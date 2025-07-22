import 'dotenv/config';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '@/services/database';
import { BlockchainService } from '@/services/blockchain';
import type { APIResponse } from '@/types';

const app = new Hono();
const db = new DatabaseService();
const blockchain = new BlockchainService();

// Validation schemas
const createTeamSchema = z.object({
  teamName: z.string().min(1).max(100),
  projectName: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  requiredMembers: z.number().min(2).max(20),
  requiredStake: z.number().min(1).max(10000), // USDC stake amount
  roles: z.array(z.string()).min(1).max(10),
  tags: z.array(z.string()).max(15),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  status: z.string().optional()
});

const teamStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled'])
});

// GET /teams - Get all teams with pagination
app.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const { page, limit, status } = c.req.valid('query');
    const result = await db.getTeams(page, limit, status);
    return c.json(result);
  } catch (error) {
    return c.json({ 
      success: false, 
      error: { code: 'FETCH_ERROR', message: (error as Error).message } 
    }, 500);
  }
});

// GET /teams/:teamId - Get team by ID
app.get('/:teamId', async (c) => {
  try {
    const teamId = parseInt(c.req.param('teamId'));
    
    if (isNaN(teamId) || teamId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid team ID' }
      }, 400);
    }

    const team = await db.getTeamById(teamId);
    
    if (!team) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      }, 404);
    }

    return c.json({ success: true, data: team });
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /teams/create - Create new team
app.post('/create', zValidator('json', createTeamSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // Check if user is a superhero
    const isSuperhero = await blockchain.isSuperhero(data.userAddress);
    if (!isSuperhero) {
      return c.json({
        success: false,
        error: { code: 'NOT_SUPERHERO', message: 'Only superheroes can create teams' }
      }, 403);
    }

    // Create team on blockchain
    console.log('⛓️ Creating team on blockchain...');
    const blockchainResult = await blockchain.createTeam({
      teamName: data.teamName,
      projectName: data.projectName,
      description: data.description,
      requiredMembers: data.requiredMembers,
      requiredStake: data.requiredStake,
      roles: data.roles,
      tags: data.tags,
      userAddress: data.userAddress
    });

    console.log('✅ Team created on blockchain:', blockchainResult.transactionHash);

    // The indexer will automatically pick up the event and save to database
    // Return the transaction details for now
    return c.json({
      success: true,
      data: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        message: 'Team creation transaction submitted. It will appear in the database once indexed.'
      }
    });

  } catch (error) {
    console.error('❌ Team creation error:', error);
    return c.json({
      success: false,
      error: { 
        code: 'CREATION_ERROR', 
        message: (error as Error).message,
        details: error
      }
    }, 500);
  }
});

// GET /teams/by-leader/:address - Get teams by leader address
app.get('/by-leader/:address', zValidator('query', paginationSchema), async (c) => {
  try {
    const address = c.req.param('address');
    const { page, limit, status } = c.req.valid('query');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    // Get all teams and filter by leader (this should be optimized with a proper database query)
    const teams = await db.getTeams(page, limit, status);
    
    const filteredTeams = {
      ...teams,
      data: teams.data.filter((team: any) => team.leader?.toLowerCase() === address.toLowerCase())
    };

    return c.json(filteredTeams);
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /teams/search/:query - Search teams by name or description
app.get('/search/:query', zValidator('query', paginationSchema), async (c) => {
  try {
    const searchQuery = c.req.param('query');
    const { page, limit } = c.req.valid('query');
    
    if (!searchQuery || searchQuery.length < 2) {
      return c.json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Search query must be at least 2 characters' }
      }, 400);
    }

    // Use the search functionality from database service
    const searchResults = await db.searchAll(searchQuery, page, limit);
    
    return c.json({
      success: true,
      data: {
        teams: searchResults.data || [],
        pagination: {
          page,
          limit,
          total: searchResults.data?.length || 0,
          has_more: false // This would need proper pagination in the search function
        }
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'SEARCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /teams/roles - Get common team roles
app.get('/roles', async (c) => {
  try {
    const roles = [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'UI/UX Designer',
      'Product Manager',
      'Marketing Specialist',
      'Business Analyst',
      'DevOps Engineer',
      'Data Scientist',
      'Content Creator',
      'Community Manager',
      'Quality Assurance',
      'Project Manager',
      'Research Analyst',
      'Growth Hacker'
    ];

    return c.json({
      success: true,
      data: roles
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /teams/tags - Get common team tags
app.get('/tags', async (c) => {
  try {
    const tags = [
      'Web3',
      'DeFi',
      'NFT',
      'AI/ML',
      'Mobile App',
      'Web App',
      'Gaming',
      'E-commerce',
      'Social Media',
      'Education',
      'Healthcare',
      'Fintech',
      'SaaS',
      'Blockchain',
      'IoT',
      'AR/VR',
      'Startup',
      'Enterprise',
      'Open Source',
      'Community'
    ];

    return c.json({
      success: true,
      data: tags
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /teams/stats - Get team statistics
app.get('/stats', async (c) => {
  try {
    const stats = await db.getPlatformStats();
    
    return c.json({
      success: true,
      data: {
        totalTeams: stats.data.totalTeams,
        activeTeams: stats.data.totalTeams, // This would need a proper query for active teams
        completedTeams: 0, // This would need a proper query for completed teams
        avgTeamSize: 4, // This would need a proper calculation
        avgStakeAmount: 100, // This would need a proper calculation
        lastUpdated: stats.data.lastUpdated
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'STATS_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /teams/:teamId/join - Join a team (placeholder - would need additional logic)
app.post('/:teamId/join', async (c) => {
  try {
    const teamId = parseInt(c.req.param('teamId'));
    
    if (isNaN(teamId) || teamId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid team ID' }
      }, 400);
    }

    // This would require additional smart contract functions for team joining
    // For now, return a placeholder response
    return c.json({
      success: false,
      error: { 
        code: 'NOT_IMPLEMENTED', 
        message: 'Team joining functionality requires additional smart contract development' 
      }
    }, 501);
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'JOIN_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /teams/:teamId/leave - Leave a team (placeholder - would need additional logic)
app.post('/:teamId/leave', async (c) => {
  try {
    const teamId = parseInt(c.req.param('teamId'));
    
    if (isNaN(teamId) || teamId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid team ID' }
      }, 400);
    }

    // This would require additional smart contract functions for team leaving
    // For now, return a placeholder response
    return c.json({
      success: false,
      error: { 
        code: 'NOT_IMPLEMENTED', 
        message: 'Team leaving functionality requires additional smart contract development' 
      }
    }, 501);
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'LEAVE_ERROR', message: (error as Error).message }
    }, 500);
  }
});

export default app;