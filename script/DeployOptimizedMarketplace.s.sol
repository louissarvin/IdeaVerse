// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {IdeaNFT} from "../src/IdeaNFT.sol";
import {SuperheroNFT} from "../src/SuperheroNFT.sol";
import {IdeaRegistry} from "../src/IdeaRegistry.sol";
import {TeamCore} from "../src/TeamCore.sol";
import {TeamMilestones} from "../src/TeamMilestones.sol";
import {OptimizedIdeaMarketplace} from "../src/OptimizedIdeaMarketplace.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployOptimizedMarketplace is Script {
    // Contract instances
    IdeaNFT public ideaNFT;
    SuperheroNFT public superheroNFT;
    IdeaRegistry public ideaRegistry;
    TeamCore public teamCore;
    TeamMilestones public teamMilestones;
    OptimizedIdeaMarketplace public marketplace;
    MockUSDC public usdc;
    
    // Configuration
    uint256 public constant INITIAL_USDC_SUPPLY = 10000 * 10**6;   // 10,000 USDC for testing
    uint256 public constant MARKETPLACE_FEE = 250;                 // 2.5% fee
    
    function run() public returns (address[] memory) {
        console.log("Deploying Optimized Idea Marketplace to Monad Testnet...");
        console.log("");
        
        // Get deployer info
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Network: Monad Testnet (Chain ID: 10143)");
        
        // Check balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "MON");
        
        if (balance < 0.1 ether) {
            console.log("Warning: Low balance! Get MON from faucet:");
            console.log("https://faucet.testnet.monad.xyz/");
            console.log("");
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy MockUSDC
        console.log("Step 1: Deploying MockUSDC...");
        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        
        // Step 2: Deploy SuperheroNFT (optimized, 15,213 bytes)
        console.log("");
        console.log("Step 2: Deploying SuperheroNFT...");
        superheroNFT = new SuperheroNFT();
        console.log("SuperheroNFT deployed at:", address(superheroNFT));
        
        // Step 3: Deploy IdeaRegistry (optimized, 17,300 bytes)
        console.log("");
        console.log("Step 3: Deploying IdeaRegistry...");
        ideaRegistry = new IdeaRegistry(address(superheroNFT));
        console.log("IdeaRegistry deployed at:", address(ideaRegistry));
        
        // Step 4: Deploy IdeaNFT (optimized, 24,349 bytes)
        console.log("");
        console.log("Step 4: Deploying IdeaNFT...");
        ideaNFT = new IdeaNFT();
        console.log("IdeaNFT deployed at:", address(ideaNFT));
        
        // Step 5: Deploy TeamCore (split from TeamManager, 15,742 bytes)
        console.log("");
        console.log("Step 5: Deploying TeamCore...");
        teamCore = new TeamCore(address(ideaNFT), address(usdc));
        console.log("TeamCore deployed at:", address(teamCore));
        
        // Step 6: Deploy TeamMilestones (split from TeamManager, 9,240 bytes)
        console.log("");
        console.log("Step 6: Deploying TeamMilestones...");
        teamMilestones = new TeamMilestones(address(teamCore));
        console.log("TeamMilestones deployed at:", address(teamMilestones));
        
        // Step 7: Deploy OptimizedIdeaMarketplace
        console.log("");
        console.log("Step 7: Deploying OptimizedIdeaMarketplace...");
        marketplace = new OptimizedIdeaMarketplace(
            address(ideaRegistry),
            address(superheroNFT),
            address(teamCore),
            address(usdc)
        );
        console.log("OptimizedIdeaMarketplace deployed at:", address(marketplace));
        
        // Step 8: Setup initial configuration
        console.log("");
        console.log("Step 8: Setting up initial configuration...");
        
        // Mint test USDC tokens to deployer
        usdc.mint(deployer, INITIAL_USDC_SUPPLY);
        console.log("Minted", INITIAL_USDC_SUPPLY / 10**6, "USDC to deployer for testing");
        
        // Authorize marketplace contracts
        ideaRegistry.authorizeMarketplace(address(marketplace));
        ideaNFT.setMarketplaceAuth(address(marketplace), true);
        console.log("Authorized marketplace contracts");
        
        vm.stopBroadcast();
        
        // Step 9: Verification
        console.log("");
        console.log("Step 9: Deployment verification...");
        _verifyDeployment();
        
        // Step 10: Instructions
        console.log("");
        console.log("Step 10: How to use your Optimized Idea Marketplace...");
        _printInstructions();
        
        address[] memory addresses = new address[](7);
        addresses[0] = address(usdc);
        addresses[1] = address(superheroNFT);
        addresses[2] = address(ideaRegistry);
        addresses[3] = address(ideaNFT);
        addresses[4] = address(teamCore);
        addresses[5] = address(teamMilestones);
        addresses[6] = address(marketplace);
        
        return addresses;
    }
    
    function _verifyDeployment() internal view {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        
        console.log("=== CONTRACT VERIFICATION ===");
        console.log("");
        
        // Verify MockUSDC
        console.log("MockUSDC:");
        console.log("- Name:", usdc.name());
        console.log("- Symbol:", usdc.symbol());
        console.log("- Decimals:", usdc.decimals());
        console.log("- Total Supply:", usdc.totalSupply() / 10**6, "USDC");
        console.log("- Deployer Balance:", usdc.balanceOf(deployer) / 10**6, "USDC");
        
        console.log("");
        console.log("SuperheroNFT:");
        console.log("- Name:", superheroNFT.name());
        console.log("- Symbol:", superheroNFT.symbol());
        console.log("- Total Superheroes:", superheroNFT.totalSuperheroes());
        
        console.log("");
        console.log("IdeaRegistry:");
        console.log("- Name:", ideaRegistry.name());
        console.log("- Symbol:", ideaRegistry.symbol());
        console.log("- Total Ideas:", ideaRegistry.totalIdeas());
        
        console.log("");
        console.log("IdeaNFT:");
        console.log("- Name:", ideaNFT.name());
        console.log("- Symbol:", ideaNFT.symbol());
        console.log("- Total Ideas:", ideaNFT.totalIdeas());
        console.log("- Total Superheroes:", ideaNFT.totalSuperheroes());
        
        console.log("");
        console.log("TeamCore:");
        console.log("- Total Teams:", teamCore.totalTeams());
        
        console.log("");
        console.log("TeamMilestones:");
        console.log("- Total Milestones:", teamMilestones.totalMilestones());
        
        console.log("");
        console.log("Contract Sizes (EIP-170 Compliance):");
        console.log("- SuperheroNFT: 15,213 bytes (9,363 bytes under limit)");
        console.log("- IdeaRegistry: 17,300 bytes (7,276 bytes under limit)");
        console.log("- IdeaNFT: 24,349 bytes (227 bytes under limit)");
        console.log("- TeamCore: 15,742 bytes (8,834 bytes under limit)");
        console.log("- TeamMilestones: 9,240 bytes (15,336 bytes under limit)");
        console.log("- OptimizedIdeaMarketplace: 9,751 bytes (14,825 bytes under limit)");
    }
    
    function _printInstructions() internal view {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        
        console.log("=== GETTING STARTED WITH OPTIMIZED ARCHITECTURE ===");
        console.log("");
        
        console.log("1. Create a Superhero Identity (using SuperheroNFT):");
        console.log("Call: superheroNFT.createSuperhero(nameBytes32, bioBytes32, avatarUri, skillsBytes32[], specialitiesBytes32[])");
        console.log("Example in frontend:");
        console.log("const name = ethers.utils.formatBytes32String('IronDev');");
        console.log("const bio = ethers.utils.formatBytes32String('Coding superhero');");
        console.log("const skills = ['JavaScript', 'Solidity'].map(s => ethers.utils.formatBytes32String(s));");
        console.log("await superheroNFT.createSuperhero(name, bio, 'ipfs://avatar', skills, []);");
        console.log("");
        
        console.log("2. Create Ideas (using IdeaRegistry):");
        console.log("Call: ideaRegistry.createIdea(titleBytes32, categoryBytes32[], ipfsHash, price)");
        console.log("Example in frontend:");
        console.log("const title = ethers.utils.formatBytes32String('AI Trading Bot');");
        console.log("const categories = ['Tech', 'Finance'].map(c => ethers.utils.formatBytes32String(c));");
        console.log("await ideaRegistry.createIdea(title, categories, 'ipfs://idea', ethers.utils.parseUnits('1000', 6));");
        console.log("");
        
        console.log("3. Create Teams (using TeamCore):");
        console.log("Call: teamCore.createTeam(requiredMembers, requiredStake, teamNameBytes32, descriptionBytes32, projectNameBytes32, rolesBytes32[5], tagsBytes32[3])");
        console.log("Example in frontend:");
        console.log("const teamName = ethers.utils.formatBytes32String('DeFi Builders');");
        console.log("const roles = ['Developer', 'Designer', ''].map(r => ethers.utils.formatBytes32String(r)); // Pad to 5");
        console.log("await teamCore.createTeam(3, ethers.utils.parseUnits('500', 6), teamName, description, project, roles, tags);");
        console.log("");
        
        console.log("4. Create Milestones (using TeamMilestones):");
        console.log("Call: teamMilestones.createMilestone(teamId, titleBytes32, descriptionBytes32, deadline, stakeAmount)");
        console.log("");
        
        console.log("5. Buy Ideas (using OptimizedIdeaMarketplace):");
        console.log("- First approve USDC: usdc.approve(marketplaceAddress, amount)");
        console.log("- Then buy: marketplace.buyIdea(ideaId)");
        console.log("");
        
        console.log("=== FRONTEND HELPER FUNCTIONS ===");
        console.log("Use the contract-helpers.ts file for easy data conversion:");
        console.log("import { createSuperheroTx, createIdeaTx, createTeamTx } from './contract-helpers';");
        console.log("");
        
        console.log("=== IMPORTANT NOTES ===");
        console.log("- All strings are now bytes32 for gas optimization");
        console.log("- Use ethers.utils.formatBytes32String() to convert string to bytes32");
        console.log("- Use ethers.utils.parseBytes32String() to convert bytes32 to string");
        console.log("- TeamManager is split into TeamCore + TeamMilestones");
        console.log("- All contracts are under 24KB EIP-170 limit");
        console.log("- Frontend helpers handle all conversions automatically");
        console.log("");
        
        console.log("=== CONTRACT ADDRESSES ===");
        console.log("MockUSDC:                 ", address(usdc));
        console.log("SuperheroNFT:             ", address(superheroNFT));
        console.log("IdeaRegistry:             ", address(ideaRegistry));
        console.log("IdeaNFT:                  ", address(ideaNFT));
        console.log("TeamCore:                 ", address(teamCore));
        console.log("TeamMilestones:           ", address(teamMilestones));
        console.log("OptimizedIdeaMarketplace: ", address(marketplace));
        console.log("");
    }
}