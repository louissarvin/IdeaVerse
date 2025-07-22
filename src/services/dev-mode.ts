// Local mode service for testing when backend database isn't ready
import type { APIResponse, CreateSuperheroRequest } from '../types/api';

export class DevModeService {
  private static isDevMode = import.meta.env.DEV || false;
  
  static async createSuperhero(data: CreateSuperheroRequest): Promise<APIResponse> {
    if (!this.isDevMode) {
      throw new Error('Dev mode is not enabled');
    }
    
    // Simulate API response for local testing
    console.log('🏠 Local Mode: Creating superhero locally', data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
        blockNumber: Math.floor(Math.random() * 1000000),
        message: 'Superhero created in local mode',
        superhero: {
          name: data.name,
          bio: data.bio,
          skills: data.skills,
          specialities: data.specialities,
          address: data.userAddress,
          createdAt: new Date().toISOString(),
          reputation: 0,
          avatar_url: '🦸‍♂️'
        }
      }
    };
  }
  
  static async createIdea(data: any): Promise<APIResponse> {
    if (!this.isDevMode) {
      throw new Error('Dev mode is not enabled');
    }
    
    console.log('🏠 Local Mode: Creating idea locally', data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: {
        transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
        blockNumber: Math.floor(Math.random() * 1000000),
        message: 'Idea created in local mode',
        idea: {
          title: data.title,
          description: data.description,
          categories: data.categories,
          price: data.price,
          creator: data.userAddress,
          createdAt: new Date().toISOString(),
          is_purchased: false
        }
      }
    };
  }
  
  static async createTeam(data: any): Promise<APIResponse> {
    if (!this.isDevMode) {
      throw new Error('Dev mode is not enabled');
    }
    
    console.log('🏠 Local Mode: Creating team locally', data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      data: {
        transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
        blockNumber: Math.floor(Math.random() * 1000000),
        message: 'Team created in local mode',
        team: {
          teamName: data.teamName,
          projectName: data.projectName,
          description: data.description,
          requiredMembers: data.requiredMembers,
          requiredStake: data.requiredStake,
          roles: data.roles,
          tags: data.tags,
          leader: data.userAddress,
          createdAt: new Date().toISOString(),
          status: 'Forming'
        }
      }
    };
  }
  
  static isEnabled(): boolean {
    return this.isDevMode;
  }
}

export default DevModeService;