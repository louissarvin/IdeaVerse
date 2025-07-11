// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IdeaNFT.sol";

/**
 * @title IdeaUtils
 * @dev Utility contract for expensive view functions to reduce main contract size
 */
contract IdeaUtils {
    IdeaNFT public immutable ideaNFT;

    constructor(address _ideaNFT) {
        ideaNFT = IdeaNFT(_ideaNFT);
    }

    /**
     * @dev Get all available ideas in the marketplace
     */
    function getAllAvailableIdeas() external view returns (IdeaNFT.IdeaMan[] memory) {
        uint256 totalIdeas = ideaNFT.totalIdeas();
        uint256 availableCount = 0;
        
        // Count available ideas
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    availableCount++;
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        // Create array of available ideas
        IdeaNFT.IdeaMan[] memory availableIdeas = new IdeaNFT.IdeaMan[](availableCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    availableIdeas[currentIndex] = idea;
                    currentIndex++;
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        return availableIdeas;
    }

    /**
     * @dev Get all ideas by category
     */
    function getIdeasByCategory(string memory _category) external view returns (IdeaNFT.IdeaMan[] memory) {
        uint256 totalIdeas = ideaNFT.totalIdeas();
        uint256 categoryCount = 0;
        
        // Count ideas in category
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    for (uint256 j = 0; j < idea.category.length; j++) {
                        if (keccak256(abi.encodePacked(idea.category[j])) == keccak256(abi.encodePacked(_category))) {
                            categoryCount++;
                            break;
                        }
                    }
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        // Create array of category ideas
        IdeaNFT.IdeaMan[] memory categoryIdeas = new IdeaNFT.IdeaMan[](categoryCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    for (uint256 j = 0; j < idea.category.length; j++) {
                        if (keccak256(abi.encodePacked(idea.category[j])) == keccak256(abi.encodePacked(_category))) {
                            categoryIdeas[currentIndex] = idea;
                            currentIndex++;
                            break;
                        }
                    }
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        return categoryIdeas;
    }

    /**
     * @dev Get total platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalSuperheroes,
        uint256 totalIdeas,
        uint256 totalPurchasedIdeas,
        uint256 totalAvailableIdeas
    ) {
        totalSuperheroes = ideaNFT.totalSuperheroes();
        totalIdeas = ideaNFT.totalIdeas();
        
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0)) {
                    if (idea.isPurchased) {
                        totalPurchasedIdeas++;
                    } else {
                        totalAvailableIdeas++;
                    }
                }
            } catch {
                // Skip non-existent ideas
            }
        }
    }

    /**
     * @dev Get ideas with pagination
     */
    function getIdeasPaginated(uint256 _offset, uint256 _limit) external view returns (IdeaNFT.IdeaMan[] memory, uint256 totalCount) {
        uint256 totalIdeas = ideaNFT.totalIdeas();
        uint256 availableCount = 0;
        
        // Count available ideas
        for (uint256 i = 0; i < totalIdeas; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    availableCount++;
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        totalCount = availableCount;
        
        // Calculate actual limit
        uint256 actualLimit = _limit;
        if (_offset + _limit > availableCount) {
            actualLimit = availableCount - _offset;
        }
        
        if (_offset >= availableCount) {
            return (new IdeaNFT.IdeaMan[](0), totalCount);
        }
        
        // Create paginated array
        IdeaNFT.IdeaMan[] memory paginatedIdeas = new IdeaNFT.IdeaMan[](actualLimit);
        uint256 currentIndex = 0;
        uint256 itemCount = 0;
        
        for (uint256 i = 0; i < totalIdeas && currentIndex < actualLimit; i++) {
            try ideaNFT.getIdea(i) returns (IdeaNFT.IdeaMan memory idea) {
                if (idea.creator != address(0) && !idea.isPurchased) {
                    if (itemCount >= _offset) {
                        paginatedIdeas[currentIndex] = idea;
                        currentIndex++;
                    }
                    itemCount++;
                }
            } catch {
                // Skip non-existent ideas
            }
        }
        
        return (paginatedIdeas, totalCount);
    }
}