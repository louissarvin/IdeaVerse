// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./SuperheroNFT.sol";

/**
 * @title IdeaRegistry
 * @dev Optimized idea creation and management
 */
contract IdeaRegistry is ERC721, ERC721URIStorage, AccessControl {
    SuperheroNFT public immutable superheroNFT;
    
    uint256 private _nextIdeaToken;

    struct IdeaMan {
        uint256 ideaId;
        address creator;
        uint256 created;
        bytes32 title;
        bytes32[] category;
        string ipfsHash; 
        uint256 price;
        uint248 ratingTotal;  // Packed with isPurchased
        uint256 numRaters;
        bool isPurchased;
    }

    // Mappings
    mapping(uint256 => IdeaMan) public ideas;
    mapping(address => uint256[]) public creatorIdeas;
    mapping(address => bool) public authorizedMarketplaces;

    // Events
    event CreateIdea(address indexed creator, uint256 indexed ideaId, bytes32 title, uint256 price);
    event IdeaPriceUpdated(uint256 indexed ideaId, uint256 indexed oldPrice, uint256 indexed newPrice);
    event IdeaPurchased(uint256 indexed ideaId, address indexed buyer);

    constructor(address _superheroNFT) ERC721("IdeaRegistry", "IDEA") {
        superheroNFT = SuperheroNFT(_superheroNFT);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlySuperhero() {
        require(superheroNFT.hasRole(superheroNFT.SUPERHERO_ROLE(), msg.sender), "Not a superhero");
        _;
    }

    modifier onlyIdeaCreator(uint256 _ideaId) {
        require(ideas[_ideaId].creator == msg.sender, "Not idea creator");
        _;
    }

    function createIdea(
        bytes32 _title, 
        bytes32[] memory _category, 
        string memory _ipfsHash, 
        uint256 _price
    ) external onlySuperhero {
        require(_title != bytes32(0), "Title cannot be empty");
        require(_category.length > 0, "At least one category required");
        require(_category.length <= 8, "Too many categories (max 8)");
        
        uint256 tokenId = _nextIdeaToken++;
        
        IdeaMan memory idea = IdeaMan({
            ideaId: tokenId,
            creator: msg.sender,
            created: block.timestamp,
            title: _title,
            category: _category,
            ipfsHash: _ipfsHash,
            price: _price,
            ratingTotal: 0,
            numRaters: 0,
            isPurchased: false
        });
        
        ideas[tokenId] = idea;
        creatorIdeas[msg.sender].push(tokenId);
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _ipfsHash);
        
        emit CreateIdea(msg.sender, tokenId, _title, _price);
    }

    function updatePriceIdea(uint256 _ideaId, uint256 _newPrice) external onlyIdeaCreator(_ideaId) {
        require(_newPrice > 0, "Price must be greater than 0");
        require(ideas[_ideaId].creator != address(0), "Idea does not exist");
        
        uint256 oldPrice = ideas[_ideaId].price;
        ideas[_ideaId].price = _newPrice;

        emit IdeaPriceUpdated(_ideaId, oldPrice, _newPrice);
    }

    function markIdeaPurchased(uint256 _ideaId) external {
        require(authorizedMarketplaces[msg.sender], "Not authorized marketplace");
        require(ideas[_ideaId].creator != address(0), "Idea does not exist");
        
        ideas[_ideaId].isPurchased = true;
        emit IdeaPurchased(_ideaId, tx.origin);
    }

    function authorizeMarketplace(address _marketplace) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedMarketplaces[_marketplace] = true;
    }

    function revokeMarketplace(address _marketplace) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedMarketplaces[_marketplace] = false;
    }

    // View functions
    function getIdea(uint256 _tokenId) external view returns (IdeaMan memory) {
        require(ideas[_tokenId].creator != address(0), "Idea does not exist");
        return ideas[_tokenId];
    }

    function getCreatorIdeas(address _creator) external view returns (uint256[] memory) {
        return creatorIdeas[_creator];
    }

    function totalIdeas() external view returns (uint256) {
        return _nextIdeaToken;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}