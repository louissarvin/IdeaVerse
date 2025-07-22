import axios, { AxiosResponse } from 'axios';
import type {
  APIResponse,
  PaginatedResponse,
  Superhero,
  Idea,
  Team,
  Purchase,
  CreateSuperheroRequest,
  CreateIdeaRequest,
  CreateTeamRequest,
  IPFSUploadResult,
  PlatformStats,
  BlockchainStatus,
  TransactionStatus
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increase timeout to 2 minutes for IPFS + blockchain operations
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle specific backend errors
    if (error.response?.data?.error?.message?.includes('does not exist')) {
      const dbError = new Error('Database is not ready yet. The blockchain indexer is still syncing.');
      dbError.name = 'DatabaseError';
      return Promise.reject(dbError);
    }
    
    return Promise.reject(error);
  }
);

export class ApiService {
  // Health & Status
  static async getHealth(): Promise<APIResponse> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      // If it's a 503 error, extract the actual health data from the response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: any } };
        if (axiosError.response?.status === 503 && axiosError.response?.data) {
          return {
            success: false,
            message: 'Service degraded - blockchain network issue',
            data: axiosError.response.data
          };
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  static async getStats(): Promise<APIResponse<PlatformStats>> {
    const response = await api.get('/stats');
    return response.data;
  }

  static async getBlockchainStatus(): Promise<APIResponse<BlockchainStatus>> {
    const response = await api.get('/blockchain/status');
    return response.data;
  }

  static async getTransactionStatus(hash: string): Promise<APIResponse<TransactionStatus>> {
    const response = await api.get(`/blockchain/tx/${hash}`);
    return response.data;
  }

  // Superheroes
  static async getSuperheroes(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Superhero>> {
    const response = await api.get('/superheroes', {
      params: { page, limit }
    });
    return response.data;
  }

  static async getSuperheroByAddress(address: string): Promise<APIResponse<Superhero>> {
    const response = await api.get(`/superheroes/${address}/profile`);
    return response.data;
  }

  static async createSuperhero(data: CreateSuperheroRequest, avatarFile?: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('bio', data.bio);
    formData.append('skills', JSON.stringify(data.skills));
    formData.append('specialities', JSON.stringify(data.specialities));
    formData.append('userAddress', data.userAddress);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await api.post('/superheroes/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Ideas
  static async getIdeas(page: number = 1, limit: number = 20, availableOnly: boolean = true): Promise<PaginatedResponse<Idea>> {
    const response = await api.get('/ideas', {
      params: { page, limit, availableOnly }
    });
    return response.data;
  }

  static async getIdeaById(ideaId: number): Promise<APIResponse<Idea>> {
    const response = await api.get(`/ideas/${ideaId}`);
    return response.data;
  }

  static async getIdeasByCreator(address: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Idea>> {
    const response = await api.get(`/ideas/by-creator/${address}`, {
      params: { page, limit }
    });
    return response.data;
  }

  static async createIdea(data: CreateIdeaRequest, contentFile?: File, imageFile?: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categories', JSON.stringify(data.categories));
    formData.append('price', data.price.toString());
    formData.append('userAddress', data.userAddress);
    
    if (contentFile) {
      formData.append('content', contentFile);
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post('/ideas/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async prepareIdeaMetadata(data: CreateIdeaRequest, contentFile?: File, imageFile?: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categories', JSON.stringify(data.categories));
    formData.append('price', data.price.toString());
    formData.append('userAddress', data.userAddress);
    
    if (contentFile) {
      formData.append('content', contentFile);
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post('/ideas/prepare-metadata', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getIdeaCategories(): Promise<APIResponse<string[]>> {
    const response = await api.get('/ideas/categories');
    return response.data;
  }

  // Teams
  static async getTeams(page: number = 1, limit: number = 20, status?: string): Promise<PaginatedResponse<Team>> {
    const response = await api.get('/teams', {
      params: { page, limit, status }
    });
    return response.data;
  }

  static async getTeamById(teamId: number): Promise<APIResponse<Team>> {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  }

  static async createTeam(data: CreateTeamRequest, projectFiles?: File[]): Promise<APIResponse> {
    if (projectFiles && projectFiles.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('teamName', data.teamName);
      formData.append('projectName', data.projectName);
      formData.append('description', data.description);
      formData.append('requiredMembers', data.requiredMembers.toString());
      formData.append('requiredStake', data.requiredStake.toString());
      formData.append('roles', JSON.stringify(data.roles));
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('userAddress', data.userAddress);
      
      // Add each project file
      projectFiles.forEach((file, index) => {
        formData.append(`projectFiles`, file);
      });

      const response = await api.post('/teams/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Use JSON for teams without files
      const response = await api.post('/teams/create', data);
      return response.data;
    }
  }

  static async joinTeam(teamId: number, userAddress: string): Promise<APIResponse> {
    const response = await api.post(`/teams/${teamId}/join`, { userAddress });
    return response.data;
  }

  static async getTeamsByLeader(address: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Team>> {
    const response = await api.get(`/teams/by-leader/${address}`, {
      params: { page, limit }
    });
    return response.data;
  }

  // Purchases
  static async getPurchases(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Purchase>> {
    const response = await api.get('/purchases', {
      params: { page, limit }
    });
    return response.data;
  }

  static async purchaseIdea(ideaId: number, buyerAddress: string): Promise<APIResponse> {
    const response = await api.post(`/ideas/${ideaId}/purchase`, {
      buyerAddress
    });
    return response.data;
  }

  static async getIdeaContent(ideaId: number, buyerAddress: string): Promise<APIResponse> {
    const response = await api.get(`/ideas/${ideaId}/content`, {
      params: { buyer: buyerAddress }
    });
    return response.data;
  }

  static async getIdeaPurchaseStatus(ideaId: number, userAddress: string): Promise<APIResponse> {
    const response = await api.get(`/ideas/${ideaId}/purchase-status`, {
      params: { user: userAddress }
    });
    return response.data;
  }

  static async getIdeaOwnership(ideaId: number, userAddress: string): Promise<APIResponse> {
    const response = await api.get(`/ideas/${ideaId}/ownership`, {
      params: { user: userAddress }
    });
    return response.data;
  }

  static async getPurchasedIdeas(userAddress: string): Promise<APIResponse> {
    const response = await api.get(`/ideas/purchased-by/${userAddress}`);
    return response.data;
  }

  static async recordPurchase(purchaseData: {
    ideaId: number;
    buyer: string;
    seller: string;
    price: string;
    transactionHash: string;
    timestamp: string;
  }): Promise<APIResponse> {
    const response = await api.post('/purchases/record', purchaseData);
    return response.data;
  }

  // File uploads
  static async uploadContent(file: File): Promise<APIResponse<IPFSUploadResult>> {
    const formData = new FormData();
    formData.append('content', file);

    const response = await api.post('/ideas/upload-content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async uploadImage(file: File): Promise<APIResponse<IPFSUploadResult>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/ideas/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Search
  static async search(query: string, page: number = 1, limit: number = 20): Promise<APIResponse> {
    const response = await api.get(`/search/${encodeURIComponent(query)}`, {
      params: { page, limit }
    });
    return response.data;
  }

  // IPFS
  static async getIPFSFile(hash: string): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/ipfs/${hash}`);
    return response;
  }

  static async getIPFSJson(hash: string): Promise<APIResponse> {
    const response = await api.get(`/ipfs/${hash}/json`);
    return response.data;
  }

  // Ratings
  static async getBuilderRatings(builderId: string, page: number = 1, limit: number = 20): Promise<APIResponse> {
    const response = await api.get(`/ratings/builder/${builderId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  static async submitBuilderRating(data: {
    builderId: string;
    raterAddress: string;
    rating: number;
    comment?: string;
  }): Promise<APIResponse> {
    const response = await api.post('/ratings', data);
    return response.data;
  }

  static async getUserRatings(userAddress: string, page: number = 1, limit: number = 20): Promise<APIResponse> {
    const response = await api.get(`/ratings/user/${userAddress}`, {
      params: { page, limit }
    });
    return response.data;
  }
}

export default ApiService;