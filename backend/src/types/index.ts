// Database Types
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
  created_at: Date;
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
  created_at: Date;
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
  total_staked: number;
  is_complete: boolean;
  created_at: Date;
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
  purchase_timestamp: Date;
  block_number: number;
  transaction_hash: string;
}

// API Request/Response Types
export interface CreateSuperheroRequest {
  name: string;
  bio: string;
  skills: string[];
  specialities: string[];
  avatarFile?: File | Blob;
  avatarUrl?: string;
}

export interface CreateIdeaRequest {
  title: string;
  categories: string[];
  description: string;
  price: number;
  ideaFile?: File | Blob;
  ideaUrl?: string;
}

export interface CreateTeamRequest {
  teamName: string;
  projectName: string;
  description: string;
  requiredMembers: number;
  requiredStake: number;
  roles: string[];
  tags: string[];
}

// IPFS Types
export interface IPFSUploadResult {
  hash: string;
  url: string;
  gateway_url: string;
}

export interface SuperheroMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  skills: string[];
  specialities: string[];
}

export interface IdeaMetadata {
  name: string;
  description: string;
  image?: string;
  content: string;
  categories: string[];
  created_at: string;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
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

// Environment Variables
export interface Env {
  PINATA_API_KEY: string;
  PINATA_SECRET_KEY: string;
  PINATA_JWT: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  LISK_SEPOLIA_RPC_URL: string;
  PRIVATE_KEY: string;
  PORT?: string;
}