export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface Superhero {
  id: string;
  address: string;
  superhero_id: number;
  name: string;
  bio: string;
  avatar_url: string;
  reputation: number;
  skills: string[];
  specialities: string[];
  flagged: boolean;
  created_at: string;
  block_number: number;
  transaction_hash: string;
  total_ideas: number;
  total_sales: number;
  total_revenue: number;
}

export interface Idea {
  id: string;
  idea_id: number;
  creator: string;
  title: string;
  category: string[];
  ipfs_hash: string;
  price: number;
  rating_total: number;
  num_raters: number;
  is_purchased: boolean;
  created_at: string;
  block_number: number;
  transaction_hash: string;
}

export interface Team {
  id: string;
  team_id: number;
  leader: string;
  team_name: string;
  project_name?: string;
  description?: string;
  required_members: number;
  required_stake: number;
  member_count: number;
  status: 'Forming' | 'Full';
  roles: string[];
  tags: string[];
  project_files?: string[];
  total_staked: number;
  is_complete: boolean;
  created_at: string;
  block_number: number;
  transaction_hash: string;
}

export interface Purchase {
  id: string;
  idea_id: number;
  buyer: string;
  seller: string;
  price: number;
  marketplace_fee: number;
  purchase_timestamp: string;
  block_number: number;
  transaction_hash: string;
}

export interface CreateSuperheroRequest {
  name: string;
  bio: string;
  skills: string[];
  specialities: string[];
  userAddress: string;
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  categories: string[];
  price: number;
  userAddress: string;
}

export interface CreateTeamRequest {
  teamName: string;
  projectName: string;
  description: string;
  requiredMembers: number;
  requiredStake: number;
  roles: string[];
  tags: string[];
  projectFiles?: string[];
  userAddress: string;
}

export interface IPFSUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

export interface PlatformStats {
  totalSuperheroes: number;
  totalIdeas: number;
  totalTeams: number;
  totalPurchases: number;
  totalVolume: number;
  lastUpdated: string;
}

export interface BlockchainStatus {
  network: string;
  blockNumber: number;
  gasPriceGwei: number;
  timestamp: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  effectiveGasPrice?: number;
}

// Global types for Web3/MetaMask
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}