// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IdeaNFTLibrary.sol";

/**
 * @title IdeaNFT
 * @dev NFT-based superhero identity and idea system
 * Features:
 * - Contains superhero metadata and ideas.
 * - Non-transferable (soulbound).
 */
contract IdeaNFT is ERC721, AccessControl {
    uint256 private _nextIdeaToken;
    uint256 private _nextSuperheroToken;

    uint256 private constant SUPERHERO_BASE = 100000;

    // Role Definitions
    bytes32 public constant SUPERHERO_ROLE = keccak256("SUPERHERO_ROLE");

    struct Superhero {
        uint256 superheroId;
        bytes32 name;             
        bytes32 bio;            
        string avatarUrl;         
        uint256 createdAt;   
        uint248 reputation;  // Packed with flagged
        bytes32[] specialities;
        bytes32[] skills;
        bool flagged;
    }

    struct IdeaMan {
        uint256 ideaId;
        address creator;        // 20 bytes
        uint96 price;          // 12 bytes - packed with creator
        uint256 created;
        bytes32 title;
        bytes32[] category;
        string ipfsHash; 
        uint248 ratingTotal;   // 31 bytes
        bool isPurchased;      // 1 byte - packed with ratingTotal
        uint256 numRaters;
    }

    struct SuperheroReputation {
        uint248 totalScore;  // Packed with hasInitialized
        uint256 numRaters;
        bool hasInitialized;
        mapping(address => bool) hasRated;
    }

    // Mappings.
    mapping(address => Superhero) public superheroIdentity;
    mapping(address => IdeaMan[]) public trackIdeaSuperhero;
    mapping(uint256 => SuperheroReputation) public superheroReputation;
    mapping(bytes32 => bool) public usedSuperheroNames;    
    mapping(uint256 => IdeaMan) public ideas;
    mapping(address => bool) public authorizedMarketplaces;

    // Events.
    event CreateSuperhero(address indexed addr, uint256 indexed id, bytes32 name, bytes32 bio, string indexed uri);
    event CreateIdea(address indexed creator, uint256 indexed ideaId, bytes32 title);
    event IdeaPriceUpdated(uint256 indexed ideaId, uint256 indexed oldPrice, uint256 indexed newPrice);

    constructor() ERC721("IdeaNFT", "IDEA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyIdeaCreator(uint256 _ideaId) {
        if (ideas[_ideaId].creator != msg.sender) {
            revert("Only the creator can change the price");
        }
        _;
    }

    function createSuperhero(bytes32 _name, bytes32 _bio, string memory _uri, bytes32[] memory _skills, bytes32[] memory _specialities) external returns(Superhero memory) {
        if (superheroIdentity[msg.sender].name != bytes32(0)) {
            revert("Superhero already exists for this address");
        }
        if (usedSuperheroNames[_name]) {
            revert("Superhero name already exists");
        }
        if (superheroIdentity[msg.sender].flagged) {
            revert("Superhero Identity flagged");
        }
        
        // Use library for validation
        IdeaNFTLibrary.validateSuperheroCreation(_name, _skills, _specialities);
        
        uint256 tokenId = SUPERHERO_BASE + _nextSuperheroToken++;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);
        _grantRole(SUPERHERO_ROLE, msg.sender);

        Superhero memory superhero = Superhero({
            superheroId: tokenId,
            name: _name,
            bio: _bio,
            avatarUrl: _uri,
            createdAt: block.timestamp,
            reputation: 0,
            specialities: _specialities,
            skills: _skills,
            flagged: false
        });

        superheroIdentity[msg.sender] = superhero;
        
        // FIXED: Mark the name as used
        usedSuperheroNames[_name] = true;

        emit CreateSuperhero(msg.sender, tokenId, _name, _bio, _uri);
        
        return superhero;
    }

    function createIdea(bytes32 _title, bytes32[] memory _category, string memory _uri, uint256 _price) external onlyRole(SUPERHERO_ROLE) {
        // Use library for validation
        IdeaNFTLibrary.validateIdeaCreation(_title, _category, _price);
        
        Superhero memory creator = superheroIdentity[msg.sender];
        if (creator.superheroId == 0) {
            revert("Creator must be a registered superhero");
        }
        SuperheroReputation storage creatorReputation = superheroReputation[creator.superheroId];
        
        uint256 tokenId = _nextIdeaToken++;
        
        uint256 avgRating = 0;
        if (creatorReputation.numRaters > 0) {
            avgRating = creatorReputation.totalScore / creatorReputation.numRaters;
        }

        IdeaMan memory idea = IdeaMan({
            ideaId: tokenId,
            creator: msg.sender,
            created: block.timestamp,
            title: _title,
            category: _category,
            ipfsHash: _uri,
            price: uint96(_price),
            ratingTotal: uint248(avgRating),
            numRaters: creatorReputation.numRaters,
            isPurchased: false 
        });
        
        ideas[tokenId] = idea;
        trackIdeaSuperhero[msg.sender].push(idea);
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);
        
        emit CreateIdea(msg.sender, tokenId, _title);
    }

    function updatePriceIdea(uint256 _ideaId, uint256 _newPrice) external onlyIdeaCreator(_ideaId) {
        if (_newPrice == 0) {
            revert("Price must be greater than 0");
        }
        if (ideas[_ideaId].creator == address(0)) {
            revert("Idea does not exist");
        }
        
        uint256 oldPrice = ideas[_ideaId].price;
        ideas[_ideaId].price = uint96(_newPrice);

        emit IdeaPriceUpdated(_ideaId, oldPrice, _newPrice);
    }

    function rateSuperhero(uint256 rating, uint256 ideaId) external {
        if (rating < 1 || rating > 5) {
            revert("Invalid rating");
        }
        if (ideas[ideaId].creator == address(0)) {
            revert("Idea does not exist");
        }
        if (ideas[ideaId].creator == msg.sender) {
            revert("Cannot rate your own idea");
        }
        
        // Get the idea creator's superhero ID
        address ideaCreator = ideas[ideaId].creator;
        uint256 superheroId = superheroIdentity[ideaCreator].superheroId;
        
        if (superheroReputation[superheroId].hasRated[msg.sender]) {
            revert("Already rated this superhero");
        }

        superheroReputation[superheroId].totalScore += uint248(rating);
        superheroReputation[superheroId].numRaters += 1;
        superheroReputation[superheroId].hasRated[msg.sender] = true;
        
        // Update superhero's reputation score
        if (superheroReputation[superheroId].numRaters > 0) {
            superheroIdentity[ideaCreator].reputation = uint248(superheroReputation[superheroId].totalScore / superheroReputation[superheroId].numRaters);
        }
    }
    
    // HELPER FUNCTIONS
    
    /**
     * @dev Check if a superhero name is available
     */
    function isSuperheroNameAvailable(bytes32 _name) external view returns (bool) {
        return !usedSuperheroNames[_name];
    }
    
    /**
     * @dev Get superhero's current average reputation
     */
    function getSuperheroReputation(address _superheroAddr) external view returns (uint256 avgReputation, uint256 totalRaters) {
        Superhero memory superhero = superheroIdentity[_superheroAddr];
        if (superhero.superheroId == 0) return (0, 0);
        SuperheroReputation storage reputation = superheroReputation[superhero.superheroId];
        if (reputation.numRaters > 0) avgReputation = reputation.totalScore / reputation.numRaters;
        totalRaters = reputation.numRaters;
    }

    // Removed getAvailableIdeas() - use events/indexing for efficiency

    /**
     * @dev Get total number of ideas (kept for compatibility)
     */
    function totalIdeas() external view returns (uint256) {
        return _nextIdeaToken;
    }
    
    /**
     * @dev Get total number of superheroes (kept for compatibility)
     */
    function totalSuperheroes() external view returns (uint256) {
        return _nextSuperheroToken;
    }
    
    /**
     * @dev Get idea details by token ID
     */
    function getIdea(uint256 _tokenId) external view returns (IdeaMan memory) {
        require(ideas[_tokenId].creator != address(0), "Idea not found");
        return ideas[_tokenId];
    }

    /**
     * @dev Mark idea as purchased (only authorized marketplaces)
     */
    function markIdeaPurchased(uint256 _ideaId) external {
        require(authorizedMarketplaces[msg.sender], "Not authorized");
        require(ideas[_ideaId].creator != address(0), "Idea not found");
        ideas[_ideaId].isPurchased = true;
    }

    /**
     * @dev Authorize/revoke marketplace (only admin)
     */
    function setMarketplaceAuth(address _marketplace, bool _authorized) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedMarketplaces[_marketplace] = _authorized;
    }

    /**
     * @dev Override _update function to make non-transferable.
     * Use case: Make soulbound (non-transferable).
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("NFT is non-transferable (soulbound)");
        }
        return super._update(to, tokenId, auth);
    }


    /**
     * @dev Override: tokenURI.
     */
    // Custom URI implementation without ERC721URIStorage
    mapping(uint256 => string) private _tokenURIs;
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    // =============================================================
    //                    BASIC HELPER FUNCTIONS
    // =============================================================

    /**
     * @dev Get superhero profile by address
     */
    function getSuperheroProfile(address _superhero) external view returns (Superhero memory) {
        return superheroIdentity[_superhero];
    }

    // Removed getAllSuperheroIdeas() - use events/indexing for efficiency

    /**
     * @dev Check if address is a superhero
     */
    function isSuperhero(address _address) external view returns (bool) {
        return superheroIdentity[_address].superheroId != 0;
    }

    /**
     * @dev Override: supportsInterface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}