// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IdeaNFTLibrary
 * @dev Library for IdeaNFT helper functions to reduce contract size
 */
library IdeaNFTLibrary {
    
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

    /**
     * @dev Filter available (unpurchased) ideas from array
     */
    function filterAvailableIdeas(IdeaMan[] memory allIdeas) 
        internal 
        pure 
        returns (IdeaMan[] memory) 
    {
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
     * @dev Calculate average reputation
     */
    function calculateAverageReputation(uint248 totalScore, uint256 numRaters) 
        internal 
        pure 
        returns (uint248) 
    {
        if (numRaters > 0) {
            return uint248(totalScore / numRaters);
        }
        return 0;
    }

    /**
     * @dev Validate idea creation parameters
     */
    function validateIdeaCreation(
        bytes32 _title,
        bytes32[] memory _category,
        uint256 _price
    ) internal pure {
        require(_title != bytes32(0), "Title cannot be empty");
        require(_category.length > 0, "At least one category required");
        require(_category.length <= 8, "Too many categories (max 8)");
        require(_price > 0, "Price must be greater than 0");
    }

    /**
     * @dev Validate superhero creation parameters
     */
    function validateSuperheroCreation(
        bytes32 _name,
        bytes32[] memory _skills,
        bytes32[] memory _specialities
    ) internal pure {
        require(_name != bytes32(0), "Name cannot be empty");
        require(_skills.length <= 10, "Too many skills (max 10)");
        require(_specialities.length <= 10, "Too many specialities (max 10)");
    }
}