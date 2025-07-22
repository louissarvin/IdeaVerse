// Contract addresses and configuration for Lisk Sepolia
export const LISK_SEPOLIA_CHAIN_ID = 4202;

export const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
  IdeaRegistry: '0xecB93f03515DE67EA43272797Ea8eDa059985894',
  TeamCore: '0xed852d3Ef6a5B57005acDf1054d15af1CF09489c',
  TeamMilestones: '0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84',
  OptimizedMarketplace: '0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF',
  MockUSDC: '0x47B320A4ED999989AE3065Be28B208f177a7546D'
} as const;

export const NETWORK_CONFIG = {
  chainId: LISK_SEPOLIA_CHAIN_ID,
  chainName: 'Lisk Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://lisk-sepolia.drpc.org',
    'https://rpc.sepolia-api.lisk.com',
  ],
  blockExplorerUrls: [
    'https://sepolia-blockscout.lisk.com'
  ],
};

// Ponder GraphQL endpoint
export const PONDER_GRAPHQL_URL = 'http://localhost:3003/graphql';

// Backend API for IPFS operations
export const BACKEND_API_URL = 'http://localhost:3002';