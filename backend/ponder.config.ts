import { createConfig } from "@ponder/core";
import { http } from "viem";

import SuperheroABI from "./src/abi/SUPERHERO.json";
import IdeaRegistryABI from "./src/abi/IDEA_REGISTRY.json";
import TeamCoreABI from "./src/abi/TEAM_CORE.json";
import MarketplaceABI from "./src/abi/MARKETPLACE.json";
import USDCABI from "./src/abi/USDC.json";

export default createConfig({
  networks: {
    liskSepolia: {
      chainId: 4202,
      transport: http(process.env.LISK_SEPOLIA_RPC_URL || "https://lisk-sepolia.drpc.org"),
    },
  },
  contracts: {
    SuperheroNFT: {
      network: "liskSepolia",
      address: "0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9",
      abi: SuperheroABI,
      startBlock: 23451474, // Replace with your deployment block
    },
    IdeaRegistry: {
      network: "liskSepolia",
      address: "0xecB93f03515DE67EA43272797Ea8eDa059985894",
      abi: IdeaRegistryABI,
      startBlock: 23451494, // Replace with your deployment block
    },
    TeamCore: {
      network: "liskSepolia",
      address: "0xed852d3Ef6a5B57005acDf1054d15af1CF09489c",
      abi: TeamCoreABI,
      startBlock: 23451547, // Replace with your deployment block
    },
    OptimizedMarketplace: {
      network: "liskSepolia",
      address: "0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF",
      abi: MarketplaceABI,
      startBlock: 23451166, // Replace with your deployment block
    },
    MockUSDC: {
      network: "liskSepolia",
      address: "0x47B320A4ED999989AE3065Be28B208f177a7546D",
      abi: USDCABI,
      startBlock: 23453138, // Replace with your deployment block
    },
  },
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
    schema: "public",
  },
});