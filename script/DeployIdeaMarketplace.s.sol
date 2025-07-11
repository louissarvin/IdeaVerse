// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IdeaNFT} from "../src/IdeaNFT.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {IdeaMarketplace} from "../src/IdeaMarketplace.sol";

contract DeployIdeaMarketplace is Script {
    // Contract instances
    IdeaNFT public ideaNFT;
    MockUSDC public usdc;
    IdeaMarketplace public marketplace;
    
    // Configuration
    uint256 public constant INITIAL_USDC_SUPPLY = 10000 * 10**6;   // 10,000 USDC for testing
    uint256 public constant MARKETPLACE_FEE = 250;                 // 2.5% fee
    
    function run() public returns (address, address, address) {
        console.log("Deploying Idea Marketplace to Monad Testnet...");
        console.log("");
        
        // Get deployer info
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Network: Monad Testnet (Chain ID: 10143)");
        
        // Check balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "MON");
        
        if (balance < 0.05 ether) {
            console.log("Warning: Low balance! Get MON from faucet:");
            console.log("https://faucet.testnet.monad.xyz/");
            console.log("");
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy MockUSDC
        console.log("Step 1: Deploying MockUSDC...");
        
        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        
        // Step 2: Deploy IdeaNFT
        console.log("");
        console.log("Step 2: Deploying IdeaNFT...");
        
        ideaNFT = new IdeaNFT();
        console.log("IdeaNFT deployed at:", address(ideaNFT));
        
        // Step 3: Deploy IdeaMarketplace
        console.log("");
        console.log("Step 3: Deploying IdeaMarketplace...");
        
        marketplace = new IdeaMarketplace(
            address(ideaNFT),
            address(usdc),
            deployer  // Fee recipient
        );
        console.log("IdeaMarketplace deployed at:", address(marketplace));
        
        // Step 4: Setup initial configuration
        console.log("");
        console.log("Step 4: Setting up initial configuration...");
        
        // Mint test USDC tokens to deployer
        usdc.mint(deployer, INITIAL_USDC_SUPPLY);
        console.log("Minted", INITIAL_USDC_SUPPLY / 10**6, "USDC to deployer for testing");
        
        // Grant superhero role to deployer for testing
        bytes32 superheroRole = keccak256("SUPERHERO_ROLE");
        marketplace.grantRole(superheroRole, deployer);
        console.log("Granted SUPERHERO_ROLE to deployer for testing");
        
        vm.stopBroadcast();
        
        // Step 5: Verification
        console.log("");
        console.log("Step 5: Deployment verification...");
        
        _verifyDeployment();
        
        // Step 6: Instructions
        console.log("");
        console.log("Step 6: How to use your Idea Marketplace...");
        
        _printInstructions();
        
        return (address(ideaNFT), address(usdc), address(marketplace));
    }
    
    function _verifyDeployment() internal view {
        // Verify MockUSDC
        console.log("MockUSDC:");
        console.log("Name:", usdc.name());
        console.log("Symbol:", usdc.symbol());
        console.log("Decimals:", usdc.decimals());
        console.log("Total Supply:", usdc.totalSupply() / 10**6, "USDC");
        console.log("Deployer Balance:", usdc.balanceOf(vm.addr(vm.envUint("PRIVATE_KEY"))) / 10**6, "USDC");
        
        console.log("");
        console.log("IdeaNFT:");
        console.log("Name:", ideaNFT.name());
        console.log("Symbol:", ideaNFT.symbol());
        
        // Check if deployer has superhero role
        bytes32 superheroRole = keccak256("SUPERHERO_ROLE");
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        bool hasSuperheroRole = ideaNFT.hasRole(superheroRole, deployer);
        console.log("Deployer has SUPERHERO_ROLE:", hasSuperheroRole);
        
        console.log("");
        console.log("IdeaMarketplace:");
        (uint256 totalVolume, uint256 totalTransactions, uint256 feePercentage, address feeRecipient) = marketplace.getMarketplaceStats();
        console.log("Total Volume:", totalVolume / 10**6, "USDC");
        console.log("Total Transactions:", totalTransactions);
        console.log("Fee Recipient:", feeRecipient);
    }
    
    function _printInstructions() internal view {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        
        console.log("=== GETTING STARTED ===");
        console.log("");
        
        console.log("1. Create a Superhero Identity:");
        console.log("Call: ideaNFT.createSuperhero(name, bio, avatarUri)");
        console.log("Example: createSuperhero('IronDev', 'Coding superhero', 'ipfs://...')");
        console.log("");
        
        console.log("2. Create Ideas:");
        console.log("Call: ideaNFT.createIdea(title, categories[], ipfsHash, price)");
        console.log("Example: createIdea('AI Trading Bot', ['Tech','Finance'], 'ipfs://...', 1000000000)");
        console.log("Note: Price is in USDC wei (6 decimals), so 1000000000 = 1000 USDC");
        console.log("");
        
        console.log("3. Buy Ideas:");
        console.log("- First approve USDC: usdc.approve(marketplaceAddress, amount)");
        console.log("- Then buy: marketplace.buyIdea(ideaId)");
        console.log("");
        
        console.log("4. Get Test USDC:");
        console.log("Call: usdc.mint(yourAddress, amount)");
        console.log("Note: Only owner can mint (deployer initially)");
        console.log("");
        
        console.log("=== USEFUL VIEW FUNCTIONS ===");
        console.log("");
        console.log("- Check superhero name availability: ideaNFT.isSuperheroNameAvailable(name)");
        console.log("- Get superhero reputation: ideaNFT.getSuperheroReputation(address)");
        console.log("- Get available ideas: ideaNFT.getAvailableIdeas(superheroAddress)");
        console.log("- Get idea details: ideaNFT.getIdea(ideaId)");
        console.log("- Calculate marketplace fees: marketplace.calculateFees(price)");
        console.log("- Get user purchase/sales history: marketplace.getUserPurchases/getUserSales(address)");
        console.log("");
        
        console.log("=== CONTRACT ADDRESSES ===");
        console.log("IdeaNFT:        ", address(ideaNFT));
        console.log("MockUSDC:       ", address(usdc));
        console.log("IdeaMarketplace:", address(marketplace));
        console.log("");
        
        console.log("=== BLOCK EXPLORER ===");
        console.log("IdeaNFT:         https://testnet.monadexplorer.com/address/", address(ideaNFT));
        console.log("MockUSDC:        https://testnet.monadexplorer.com/address/", address(usdc));
        console.log("IdeaMarketplace: https://testnet.monadexplorer.com/address/", address(marketplace));
        console.log("");
        
        console.log("=== SAMPLE WORKFLOW ===");
        console.log("1. Create superhero: ideaNFT.createSuperhero('TechHero', 'Building the future', 'ipfs://avatar')");
        console.log("2. Create idea: ideaNFT.createIdea('DeFi Protocol', ['DeFi','Web3'], 'ipfs://idea', 5000000000)");
        console.log("3. Another user approves USDC: usdc.approve(marketplace, 5000000000)");
        console.log("4. Another user buys: marketplace.buyIdea(0)");
        console.log("");
        
        console.log("=== IMPORTANT NOTES ===");
        console.log("- NFTs are soulbound (non-transferable)");
        console.log("- Only superheroes can use the marketplace");
        console.log("- Ideas become non-purchasable after being bought");
        console.log("- USDC has 6 decimals (1 USDC = 1,000,000 wei)");
        console.log("");
    }
}