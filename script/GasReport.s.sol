// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/IdeaNFT.sol";
import "../src/SuperheroNFT.sol";
import "../src/IdeaRegistry.sol";
import "../src/CoreTeamManager.sol";
import "../src/OptimizedIdeaMarketplace.sol";
import "../src/MockUSDC.sol";

contract GasReport is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy MockUSDC
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // Deploy SuperheroNFT
        SuperheroNFT superheroNFT = new SuperheroNFT();
        console.log("SuperheroNFT deployed at:", address(superheroNFT));

        // Deploy IdeaRegistry
        IdeaRegistry ideaRegistry = new IdeaRegistry(address(superheroNFT));
        console.log("IdeaRegistry deployed at:", address(ideaRegistry));

        // Deploy CoreTeamManager
        CoreTeamManager teamManager = new CoreTeamManager(address(superheroNFT), address(mockUSDC));
        console.log("CoreTeamManager deployed at:", address(teamManager));

        // Deploy OptimizedIdeaMarketplace
        OptimizedIdeaMarketplace marketplace = new OptimizedIdeaMarketplace(
            address(ideaRegistry),
            address(superheroNFT), 
            address(teamManager),
            address(mockUSDC)
        );
        console.log("OptimizedIdeaMarketplace deployed at:", address(marketplace));

        // Deploy IdeaNFT for comparison
        IdeaNFT ideaNFT = new IdeaNFT();
        console.log("IdeaNFT deployed at:", address(ideaNFT));

        vm.stopBroadcast();
    }
}