import { createClient } from '@supabase/supabase-js';
import type { Superhero, Idea, Team, Purchase, PaginatedResponse } from '@/types';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Ponder GraphQL endpoint for querying indexed data
const PONDER_GRAPHQL_URL = 'http://localhost:3003/graphql';

async function queryPonderGraphQL(query: string, variables?: any) {
  try {
    const response = await fetch(PONDER_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Ponder GraphQL query failed:', error);
    throw error;
  }
}

export class DatabaseService {
  // Superhero operations
  async getSuperheroes(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Superhero>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('Superhero')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch superheroes: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      }
    };
  }

  async getSuperheroByAddress(address: string): Promise<Superhero | null> {
    const { data, error } = await supabase
      .from('Superhero')
      .select('*')
      .eq('id', address.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch superhero: ${error.message}`);
    }

    return data;
  }

  async createSuperhero(superheroData: Partial<Superhero>): Promise<Superhero> {
    const { data, error } = await supabase
      .from('Superhero')
      .insert([superheroData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create superhero: ${error.message}`);
    }

    return data;
  }

  // Idea operations
  async getIdeas(page: number = 1, limit: number = 20, availableOnly: boolean = true): Promise<PaginatedResponse<Idea>> {
    try {
      // Try Ponder GraphQL first
      try {
        const query = `
          query GetIdeas {
            ideas(
              limit: ${limit}
              orderBy: "createdAt"
              orderDirection: "desc"
            ) {
              items {
                id
                ideaId
                creator
                title
                categories
                ipfsHash
                price
                ratingTotal
                numRaters
                isPurchased
                createdAt
                transactionHash
                blockNumber
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `;
        
        const result = await queryPonderGraphQL(query);
        let items = result.ideas?.items || [];
        
        // Filter for available only if requested
        if (availableOnly) {
          items = items.filter((idea: any) => !idea.isPurchased);
        }
        
        return {
          success: true,
          data: items,
          pagination: {
            page,
            limit,
            total: items.length,
            has_more: items.length >= limit
          }
        };
      } catch (graphqlError) {
        console.warn('Ponder GraphQL not available, using blockchain fallback:', graphqlError.message);
        
        // Fallback: Query blockchain directly when indexer is not available
        try {
          const { BlockchainService } = await import('./blockchain');
          const blockchainService = new BlockchainService();
          const contractIdeas = await blockchainService.getAllIdeas();
          
          console.log(`📡 Fetched ${contractIdeas.length} ideas from blockchain directly`);
          
          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedIdeas = contractIdeas.slice(startIndex, endIndex);
          
          // Filter for available only if requested
          const filteredIdeas = availableOnly 
            ? paginatedIdeas.filter((idea: any) => !idea.isPurchased)
            : paginatedIdeas;
          
          return {
            success: true,
            data: filteredIdeas,
            pagination: {
              page,
              limit,
              total: contractIdeas.length,
              has_more: endIndex < contractIdeas.length
            }
          };
        } catch (blockchainError) {
          console.error('Blockchain fallback also failed:', blockchainError);
          
          // Last resort: Return empty result
          return {
            success: true,
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              has_more: false
            }
          };
        }
      }
    } catch (error) {
      throw new Error(`Failed to fetch ideas: ${error.message}`);
    }
  }

  async getIdeaById(ideaId: number): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('Idea')
      .select('*')
      .eq('ideaId', ideaId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch idea: ${error.message}`);
    }

    return data;
  }

  async createIdea(ideaData: Partial<Idea>): Promise<Idea> {
    const { data, error } = await supabase
      .from('Idea')
      .insert([ideaData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create idea: ${error.message}`);
    }

    return data;
  }

  // Team operations
  async getTeams(page: number = 1, limit: number = 20, status?: string): Promise<PaginatedResponse<Team>> {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('Team')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      }
    };
  }

  async getTeamById(teamId: number): Promise<Team | null> {
    const { data, error } = await supabase
      .from('Team')
      .select('*')
      .eq('teamId', teamId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch team: ${error.message}`);
    }

    return data;
  }

  // Purchase operations
  async getPurchases(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Purchase>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('Purchase')
      .select('*', { count: 'exact' })
      .order('purchaseTimestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch purchases: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      }
    };
  }

  // Statistics
  async getPlatformStats() {
    const [superheroes, ideas, teams, purchases] = await Promise.all([
      supabase.from('Superhero').select('*', { count: 'exact', head: true }),
      supabase.from('Idea').select('*', { count: 'exact', head: true }),
      supabase.from('Team').select('*', { count: 'exact', head: true }),
      supabase.from('Purchase').select('*', { count: 'exact', head: true }),
    ]);

    // Get total volume
    const { data: volumeData } = await supabase
      .from('Purchase')
      .select('price')
      .not('price', 'is', null);

    const totalVolume = volumeData?.reduce((sum, purchase) => sum + Number(purchase.price), 0) || 0;

    return {
      success: true,
      data: {
        totalSuperheroes: superheroes.count || 0,
        totalIdeas: ideas.count || 0,
        totalTeams: teams.count || 0,
        totalPurchases: purchases.count || 0,
        totalVolume,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // Search functionality
  async searchAll(query: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const [superheroes, ideas] = await Promise.all([
      supabase
        .from('Superhero')
        .select('*')
        .or(`name.ilike.${searchPattern},bio.ilike.${searchPattern}`)
        .range(offset, offset + limit - 1),
      
      supabase
        .from('Idea')
        .select(`
          *,
          *
        `)
        .or(`title.ilike.${searchPattern}`)
        .range(offset, offset + limit - 1)
    ]);

    return {
      success: true,
      data: {
        superheroes: superheroes.data || [],
        ideas: ideas.data || []
      }
    };
  }
}