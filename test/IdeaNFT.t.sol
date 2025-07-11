// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {IdeaNFT} from "../src/IdeaNFT.sol";

contract IdeaNFTTest is Test {
    IdeaNFT public ideaNFT;
    
    address public deployer = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public marketplace = address(0x4);
    
    string public constant SUPERHERO_NAME = "TestHero";
    string public constant SUPERHERO_BIO = "A test superhero";
    string public constant SUPERHERO_URI = "ipfs://test-uri";
    
    string public constant IDEA_TITLE = "Test Idea";
    string[] public ideaCategories = ["Tech", "Innovation"];
    string public constant IDEA_URI = "ipfs://encrypted-idea-uri";
    uint256 public constant IDEA_PRICE = 1000;

    function setUp() public {
        vm.startPrank(deployer);
        ideaNFT = new IdeaNFT();
        vm.stopPrank();
    }

    function getTestSkills() internal pure returns (string[] memory) {
        string[] memory skills = new string[](2);
        skills[0] = "Solidity";
        skills[1] = "Frontend";
        return skills;
    }

    function getTestSpecialities() internal pure returns (string[] memory) {
        string[] memory specialities = new string[](1);
        specialities[0] = "DeFi";
        return specialities;
    }

    // =============================================================
    //                      SUPERHERO CREATION TESTS
    // =============================================================
    
    function test_CreateSuperhero_Success() public {
        vm.startPrank(user1);
        
        IdeaNFT.Superhero memory superhero = ideaNFT.createSuperhero(
            SUPERHERO_NAME,
            SUPERHERO_BIO,
            SUPERHERO_URI,
            getTestSkills(),
            getTestSpecialities()
        );
        
        assertEq(superhero.name, SUPERHERO_NAME);
        assertEq(superhero.bio, SUPERHERO_BIO);
        assertEq(superhero.avatarUrl, SUPERHERO_URI);
        assertEq(superhero.reputation, 0);
        assertEq(superhero.flagged, false);
        assertTrue(superhero.superheroId >= 100000);
        
        // Check if user has SUPERHERO_ROLE
        assertTrue(ideaNFT.hasRole(ideaNFT.SUPERHERO_ROLE(), user1));
        
        // Check if name is marked as used
        assertFalse(ideaNFT.isSuperheroNameAvailable(SUPERHERO_NAME));
        
        vm.stopPrank();
    }
    
    function test_CreateSuperhero_RevertDuplicateName() public {
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        vm.stopPrank();
        
        vm.startPrank(user2);
        vm.expectRevert("Superhero name already exists");
        ideaNFT.createSuperhero(SUPERHERO_NAME, "Different bio", SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        vm.stopPrank();
    }
    
    function test_CreateSuperhero_RevertDuplicateAddress() public {
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.expectRevert("Superhero already exists for this address");
        ideaNFT.createSuperhero("DifferentName", SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        vm.stopPrank();
    }
    
    function test_CreateSuperhero_RevertEmptyName() public {
        vm.startPrank(user1);
        vm.expectRevert("Name cannot be empty");
        ideaNFT.createSuperhero("", SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        vm.stopPrank();
    }
    
    function test_IsSuperheroNameAvailable() public {
        assertTrue(ideaNFT.isSuperheroNameAvailable(SUPERHERO_NAME));
        
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        assertFalse(ideaNFT.isSuperheroNameAvailable(SUPERHERO_NAME));
    }

    // =============================================================
    //                      IDEA CREATION TESTS
    // =============================================================
    
    function test_CreateIdea_Success() public {
        // First create superhero
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        // Create idea
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        // Check idea details
        IdeaNFT.IdeaMan memory idea = ideaNFT.getIdea(0);
        assertEq(idea.title, IDEA_TITLE);
        assertEq(idea.creator, user1);
        assertEq(idea.price, IDEA_PRICE);
        assertEq(idea.ipfsHash, IDEA_URI);
        assertFalse(idea.isPurchased);
        assertEq(idea.category.length, 2);
        assertEq(idea.category[0], "Tech");
        assertEq(idea.category[1], "Innovation");
        
        vm.stopPrank();
    }
    
    function test_CreateIdea_RevertNotSuperhero() public {
        vm.startPrank(user1);
        vm.expectRevert();
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        vm.stopPrank();
    }
    
    function test_CreateIdea_RevertEmptyTitle() public {
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.expectRevert("Title cannot be empty");
        ideaNFT.createIdea("", ideaCategories, IDEA_URI, IDEA_PRICE);
        vm.stopPrank();
    }
    
    function test_CreateIdea_RevertEmptyCategories() public {
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        string[] memory emptyCategories = new string[](0);
        vm.expectRevert("At least one category required");
        ideaNFT.createIdea(IDEA_TITLE, emptyCategories, IDEA_URI, IDEA_PRICE);
        vm.stopPrank();
    }
    
    function test_UpdatePriceIdea_Success() public {
        vm.startPrank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        uint256 newPrice = 2000;
        ideaNFT.updatePriceIdea(0, newPrice);
        
        IdeaNFT.IdeaMan memory idea = ideaNFT.getIdea(0);
        assertEq(idea.price, newPrice);
        vm.stopPrank();
    }
    
    function test_UpdatePriceIdea_RevertNotCreator() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.startPrank(user2);
        vm.expectRevert("Only the creator can change the price");
        ideaNFT.updatePriceIdea(0, 2000);
        vm.stopPrank();
    }

    // =============================================================
    //                  MARKETPLACE AUTHORIZATION TESTS
    // =============================================================
    
    function test_AuthorizeMarketplace_Success() public {
        vm.startPrank(deployer);
        ideaNFT.authorizeMarketplace(marketplace);
        
        // Verify marketplace is authorized
        assertTrue(ideaNFT.authorizedMarketplaces(marketplace));
        vm.stopPrank();
    }
    
    function test_AuthorizeMarketplace_RevertNotAdmin() public {
        vm.startPrank(user1);
        vm.expectRevert();
        ideaNFT.authorizeMarketplace(marketplace);
        vm.stopPrank();
    }
    
    function test_RevokeMarketplace_Success() public {
        vm.startPrank(deployer);
        ideaNFT.authorizeMarketplace(marketplace);
        assertTrue(ideaNFT.authorizedMarketplaces(marketplace));
        
        ideaNFT.revokeMarketplace(marketplace);
        assertFalse(ideaNFT.authorizedMarketplaces(marketplace));
        vm.stopPrank();
    }
    
    function test_MarkIdeaPurchased_Success() public {
        // Setup: Create superhero and idea
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        // Authorize marketplace
        vm.prank(deployer);
        ideaNFT.authorizeMarketplace(marketplace);
        
        // Mark as purchased
        vm.prank(marketplace);
        ideaNFT.markIdeaPurchased(0);
        
        // Verify purchase status
        IdeaNFT.IdeaMan memory idea = ideaNFT.getIdea(0);
        assertTrue(idea.isPurchased);
    }
    
    function test_MarkIdeaPurchased_RevertUnauthorized() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.startPrank(marketplace);
        vm.expectRevert("Only authorized marketplace can mark purchased");
        ideaNFT.markIdeaPurchased(0);
        vm.stopPrank();
    }

    // =============================================================
    //                      RATING SYSTEM TESTS
    // =============================================================
    
    function test_RateSuperhero_Success() public {
        // Setup: Create two superheroes
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user2);
        ideaNFT.createSuperhero("Hero2", "Second hero", SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        // Create idea from user1
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        // User2 rates user1's superhero
        vm.prank(user2);
        ideaNFT.rateSuperhero(5, 0);
        
        // Check reputation
        (uint256 avgReputation, uint256 totalRaters) = ideaNFT.getSuperheroReputation(user1);
        assertEq(avgReputation, 5);
        assertEq(totalRaters, 1);
    }
    
    function test_RateSuperhero_RevertInvalidRating() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.startPrank(user2);
        vm.expectRevert("Invalid rating");
        ideaNFT.rateSuperhero(0, 0);
        
        vm.expectRevert("Invalid rating");
        ideaNFT.rateSuperhero(6, 0);
        vm.stopPrank();
    }
    
    function test_RateSuperhero_RevertSelfRating() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.startPrank(user1);
        vm.expectRevert("Cannot rate your own idea");
        ideaNFT.rateSuperhero(5, 0);
        vm.stopPrank();
    }
    
    function test_RateSuperhero_RevertDuplicateRating() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user2);
        ideaNFT.createSuperhero("Hero2", "Second hero", SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.prank(user2);
        ideaNFT.rateSuperhero(5, 0);
        
        vm.startPrank(user2);
        vm.expectRevert("Already rated this superhero");
        ideaNFT.rateSuperhero(4, 0);
        vm.stopPrank();
    }

    // =============================================================
    //                      HELPER FUNCTION TESTS
    // =============================================================
    
    function test_GetAvailableIdeas() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        vm.prank(user1);
        ideaNFT.createIdea(IDEA_TITLE, ideaCategories, IDEA_URI, IDEA_PRICE);
        
        vm.prank(user1);
        ideaNFT.createIdea("Second Idea", ideaCategories, IDEA_URI, IDEA_PRICE);
        
        IdeaNFT.IdeaMan[] memory availableIdeas = ideaNFT.getAvailableIdeas(user1);
        assertEq(availableIdeas.length, 2);
    }
    
    function test_GetIdea_RevertNonExistent() public {
        vm.expectRevert("Idea does not exist");
        ideaNFT.getIdea(999);
    }

    // =============================================================
    //                      SOULBOUND TOKEN TESTS
    // =============================================================
    
    function test_TokenTransfer_RevertSoulbound() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        uint256 tokenId = 100000; // First superhero token ID
        
        vm.startPrank(user1);
        vm.expectRevert("NFT is non-transferable (soulbound)");
        ideaNFT.transferFrom(user1, user2, tokenId);
        vm.stopPrank();
    }
    
    function test_TokenBurn_Success() public {
        vm.prank(user1);
        ideaNFT.createSuperhero(SUPERHERO_NAME, SUPERHERO_BIO, SUPERHERO_URI, getTestSkills(), getTestSpecialities());
        
        uint256 tokenId = 100000;
        
        vm.prank(user1);
        ideaNFT.burn(tokenId);
        
        vm.expectRevert();
        ideaNFT.ownerOf(tokenId);
    }
}