// Import all contract ABIs
import SUPERHERO_ABI from './abis/SUPERHERO.json';
import IDEA_REGISTRY_ABI from './abis/IDEA_REGISTRY.json';
import TEAM_CORE_ABI from './abis/TEAM_CORE.json';
import MARKETPLACE_ABI from './abis/MARKETPLACE.json';
import USDC_ABI from './abis/USDC.json';

export const ABIS = {
  SuperheroNFT: SUPERHERO_ABI,
  IdeaRegistry: IDEA_REGISTRY_ABI,
  TeamCore: TEAM_CORE_ABI,
  OptimizedMarketplace: MARKETPLACE_ABI,
  MockUSDC: USDC_ABI,
} as const;

export type ContractName = keyof typeof ABIS;