// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {SuperheroNFT} from "../src/SuperheroNFT.sol";
import {IdeaRegistry} from "../src/IdeaRegistry.sol";
import {CoreTeamManager} from "../src/CoreTeamManager.sol";
import {OptimizedIdeaMarketplace} from "../src/OptimizedIdeaMarketplace.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract OptimizedContractsTest is Test {
    SuperheroNFT public superheroNFT;
    IdeaRegistry public ideaRegistry;
    CoreTeamManager public teamManager;
    OptimizedIdeaMarketplace public marketplace;
    MockUSDC public mockUSDC;
    
    address public deployer = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    function setUp() public {
        vm.startPrank(deployer);
        
        // Deploy optimized contracts
        superheroNFT = new SuperheroNFT();
        ideaRegistry = new IdeaRegistry(address(superheroNFT));
        mockUSDC = new MockUSDC();
        teamManager = new CoreTeamManager(address(superheroNFT), address(mockUSDC));
        marketplace = new OptimizedIdeaMarketplace(
            address(superheroNFT),
            address(ideaRegistry),
            address(mockUSDC),
            deployer
        );
        
        // Set up permissions
        ideaRegistry.authorizeMarketplace(address(marketplace));
        
        // Mint USDC to users
        mockUSDC.mint(user1, 1000000 * 10**6);
        mockUSDC.mint(user2, 1000000 * 10**6);
        
        vm.stopPrank();
    }
    
    function test_OptimizedSuperheroCreation() public {
        vm.startPrank(user1);
        
        SuperheroNFT.Superhero memory superhero = superheroNFT.createSuperhero(
            bytes32("TestHero"),
            bytes32("Test Bio"),
            bytes32("ipfs://test")
        );
        
        assertEq(superhero.name, bytes32("TestHero"));
        assertTrue(superhero.superheroId >= 100000);
        
        vm.stopPrank();
    }
    
    function test_OptimizedIdeaCreation() public {
        vm.startPrank(user1);
        
        // Create superhero first
        superheroNFT.createSuperhero(
            bytes32("TestHero"),
            bytes32("Test Bio"),
            bytes32("ipfs://test")
        );
        
        // Create idea
        ideaRegistry.createIdea(
            bytes32("Test Idea"),
            bytes32("Tech"),
            bytes32("ipfs://idea"),
            1000 * 10**6
        );
        
        IdeaRegistry.IdeaMan memory idea = ideaRegistry.getIdea(0);
        assertEq(idea.title, bytes32("Test Idea"));
        assertEq(idea.price, 1000 * 10**6);
        
        vm.stopPrank();
    }
    
    function test_OptimizedTeamCreation() public {
        vm.startPrank(user1);
        
        // Create superhero first
        superheroNFT.createSuperhero(
            bytes32("TestHero"),
            bytes32("Test Bio"),
            bytes32("ipfs://test")
        );
        
        // Approve USDC
        mockUSDC.approve(address(teamManager), 1000 * 10**6);
        
        // Create team
        uint256 teamId = teamManager.createTeam(
            3,
            uint96(1000 * 10**6),
            bytes32("Test Team"),
            bytes32("Test Project")
        );
        
        CoreTeamManager.Team memory team = teamManager.getTeam(teamId);
        assertEq(team.teamName, bytes32("Test Team"));
        assertEq(team.requiredMembers, 3);
        
        vm.stopPrank();
    }
    
    function test_OptimizedMarketplacePurchase() public {
        // Setup superhero and idea
        vm.startPrank(user1);
        superheroNFT.createSuperhero(
            bytes32("Creator"),
            bytes32("Creator Bio"),
            bytes32("ipfs://creator")
        );
        ideaRegistry.createIdea(
            bytes32("Test Idea"),
            bytes32("Tech"),
            bytes32("ipfs://idea"),
            1000 * 10**6
        );
        vm.stopPrank();
        
        // Setup buyer
        vm.startPrank(user2);
        superheroNFT.createSuperhero(
            bytes32("Buyer"),
            bytes32("Buyer Bio"),
            bytes32("ipfs://buyer")
        );
        
        // Buy idea
        mockUSDC.approve(address(marketplace), 1000 * 10**6);
        marketplace.buyIdea(0);
        
        // Verify purchase
        IdeaRegistry.IdeaMan memory idea = ideaRegistry.getIdea(0);
        assertTrue(idea.isPurchased);
        
        vm.stopPrank();
    }
}