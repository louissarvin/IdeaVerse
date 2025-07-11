// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SuperheroNFT
 * @dev Optimized superhero identity management (soulbound NFT)
 */
contract SuperheroNFT is ERC721, ERC721URIStorage, AccessControl {
    uint256 private _nextSuperheroToken;
    uint256 private constant SUPERHERO_BASE = 100000;

    bytes32 public constant SUPERHERO_ROLE = keccak256("SUPERHERO_ROLE");

    struct Superhero {
        uint256 superheroId;
        bytes32 name;             
        bytes32 bio;            
        string avatarUrl;         
        uint256 createdAt;   
        uint256 reputation;
        bytes32[] specialities;
        bytes32[] skills;
        bool flagged;
    }

    // Mappings
    mapping(address => Superhero) public superheroIdentity;
    mapping(bytes32 => bool) public usedSuperheroNames;

    // Events
    event CreateSuperhero(address indexed addr, uint256 indexed id, bytes32 name, bytes32 bio, string indexed uri);

    constructor() ERC721("SuperheroNFT", "HERO") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createSuperhero(
        bytes32 _name, 
        bytes32 _bio, 
        string memory _uri,
        bytes32[] memory _skills,
        bytes32[] memory _specialities
    ) external returns (Superhero memory) {
        require(superheroIdentity[msg.sender].superheroId == 0, "Superhero already exists");
        require(!usedSuperheroNames[_name], "Name already exists");
        require(_name != bytes32(0), "Name cannot be empty");
        require(!superheroIdentity[msg.sender].flagged, "Superhero flagged");
        require(_skills.length <= 10, "Too many skills (max 10)");
        require(_specialities.length <= 10, "Too many specialities (max 10)");
        
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
        usedSuperheroNames[_name] = true;

        emit CreateSuperhero(msg.sender, tokenId, _name, _bio, _uri);
        return superhero;
    }

    function updateReputation(address _superhero, uint256 _newReputation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        superheroIdentity[_superhero].reputation = _newReputation;
    }

    function isSuperheroNameAvailable(bytes32 _name) external view returns (bool) {
        return !usedSuperheroNames[_name];
    }

    function getSuperheroProfile(address _superhero) external view returns (Superhero memory) {
        return superheroIdentity[_superhero];
    }

    function isSuperhero(address _address) external view returns (bool) {
        return superheroIdentity[_address].superheroId != 0;
    }

    function totalSuperheroes() external view returns (uint256) {
        return _nextSuperheroToken;
    }

    // Override _update to make non-transferable (soulbound)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("NFT is non-transferable (soulbound)");
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}