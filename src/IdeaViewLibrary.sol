// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IdeaViewLibrary
 * @dev Library containing view functions to reduce IdeaNFT contract size
 */
library IdeaViewLibrary {
    
    struct IdeaMan {
        uint256 ideaId;
        address creator;
        uint256 created;
        bytes32 title;
        bytes32[] category;
        string ipfsHash; 
        uint256 price;
        uint248 ratingTotal;
        uint256 numRaters;
        bool isPurchased;
    }

    struct Superhero {
        uint256 superheroId;
        bytes32 name;             
        bytes32 bio;            
        string avatarUrl;         
        uint256 createdAt;   
        uint248 reputation;
        bytes32[] specialities;
        bytes32[] skills;
        bool flagged;
    }

    struct SuperheroReputation {
        uint248 totalScore;
        uint256 numRaters;
        bool hasInitialized;
        mapping(address => bool) hasRated;
    }

    /**
     * @dev Get superhero's current average reputation
     */
    function getSuperheroReputation(
        mapping(uint256 => SuperheroReputation) storage superheroReputation,
        mapping(address => Superhero) storage superheroIdentity,
        address _superheroAddr
    ) external view returns (uint256 avgReputation, uint256 totalRaters) {
        Superhero memory superhero = superheroIdentity[_superheroAddr];
        if (superhero.superheroId == 0) {
            return (0, 0);
        }
        
        SuperheroReputation storage reputation = superheroReputation[superhero.superheroId];
        if (reputation.numRaters > 0) {
            avgReputation = reputation.totalScore / reputation.numRaters;
        }
        totalRaters = reputation.numRaters;
    }

    /**
     * @dev Get available (unpurchased) ideas by a superhero
     */
    function getAvailableIdeas(
        mapping(address => IdeaMan[]) storage trackIdeaSuperhero,
        address _superhero
    ) external view returns (IdeaMan[] memory) {
        IdeaMan[] memory allIdeas = trackIdeaSuperhero[_superhero];
        uint256 availableCount = 0;
        
        // Count available ideas
        for (uint256 i = 0; i < allIdeas.length; i++) {
            if (!allIdeas[i].isPurchased) {
                availableCount++;
            }
        }
        
        // Create array of available ideas
        IdeaMan[] memory availableIdeas = new IdeaMan[](availableCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allIdeas.length; i++) {
            if (!allIdeas[i].isPurchased) {
                availableIdeas[currentIndex] = allIdeas[i];
                currentIndex++;
            }
        }
        
        return availableIdeas;
    }

    /**
     * @dev Get all superhero ideas (both available and purchased)
     */
    function getAllSuperheroIdeas(
        mapping(address => IdeaMan[]) storage trackIdeaSuperhero,
        address _superhero
    ) external view returns (IdeaMan[] memory) {
        return trackIdeaSuperhero[_superhero];
    }

    /**
     * @dev Get superhero profile by address
     */
    function getSuperheroProfile(
        mapping(address => Superhero) storage superheroIdentity,
        address _superhero
    ) external view returns (Superhero memory) {
        return superheroIdentity[_superhero];
    }

    /**
     * @dev Check if address is a superhero
     */
    function isSuperhero(
        mapping(address => Superhero) storage superheroIdentity,
        address _address
    ) external view returns (bool) {
        return superheroIdentity[_address].superheroId != 0;
    }

    /**
     * @dev Check if a superhero name is available
     */
    function isSuperheroNameAvailable(
        mapping(bytes32 => bool) storage usedSuperheroNames,
        bytes32 _name
    ) external view returns (bool) {
        return !usedSuperheroNames[_name];
    }

    /**
     * @dev Get idea details by token ID
     */
    function getIdea(
        mapping(uint256 => IdeaMan) storage ideas,
        uint256 _tokenId
    ) external view returns (IdeaMan memory) {
        require(ideas[_tokenId].creator != address(0), "Idea does not exist");
        return ideas[_tokenId];
    }
}