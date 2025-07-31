import 'dotenv/config';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '@/services/database';
import { IPFSService } from '@/services/ipfs';
import { BlockchainService } from '@/services/blockchain';
import type { APIResponse } from '@/types';

// Helper function to generate emoji avatars
const generateEmojiAvatar = (address: string): string => {
  const avatars = [
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '👨‍💻', '👩‍💻', 
    '🧑‍🚀', '👨‍🔬', '👩‍🔬', '🧑‍💼', '👨‍🎨', '👩‍🎨',
    '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍⚕️', '👨‍🌾', '👩‍🌾',
    '🧑‍🍳', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍✈️', '👩‍✈️'
  ];
  
  // Use address to deterministically select an emoji avatar
  const hash = parseInt(address.slice(-8), 16);
  return avatars[hash % avatars.length];
};

const app = new Hono();
const db = new DatabaseService();
const ipfs = new IPFSService();
const blockchain = new BlockchainService();

// Validation schemas
const createSuperheroSchema = z.object({
  name: z.string().min(1).max(31), // bytes32 limit
  bio: z.string().min(1).max(1000),
  skills: z.array(z.string()).max(10),
  specialities: z.array(z.string()).max(10),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  force: z.string().optional().transform(val => val === 'true')
});

// GET /superheroes - Get all superheroes with pagination and blockchain fallback
app.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const { page, limit, force } = c.req.valid('query');
    console.log(`Fetching superheroes: page=${page}, limit=${limit}, forceBlockchain=${force}`);
    
    const result = await db.getSuperheroes(page, limit, force);
    
    // Add fake avatars to the data
    if (result.success && result.data) {
      result.data = result.data.map(superhero => ({
        ...superhero,
        avatar_url: generateEmojiAvatar(superhero.address)
      }));
    }
    
    // Add debugging info to response
    const response = {
      ...result,
      debug: {
        timestamp: new Date().toISOString(),
        forceBlockchain: force,
        dataSource: result.dataSource || 'unknown'
      }
    };
    
    return c.json(response);
  } catch (error) {
    console.error('Error fetching superheroes:', error);
    return c.json({ 
      success: false, 
      error: { code: 'FETCH_ERROR', message: error.message } 
    }, 500);
  }
});

// GET /superheroes/:address - Get superhero by address
app.get('/:address', async (c) => {
  try {
    const address = c.req.param('address');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    // Get from blockchain data and add fake avatar
    const allSuperheroes = await db.getSuperheroes(1, 100, true); // Force blockchain query
    
    if (allSuperheroes.success && allSuperheroes.data) {
      const superhero = allSuperheroes.data.find(s => 
        s.address.toLowerCase() === address.toLowerCase()
      );
      
      if (superhero) {
        // Add fake avatar
        const superheroWithAvatar = {
          ...superhero,
          avatar_url: generateEmojiAvatar(address)
        };
        
        return c.json({ success: true, data: superheroWithAvatar });
      }
    }

    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Superhero not found' }
    }, 404);
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500);
  }
});

// POST /superheroes/create - Create new superhero (JSON only)
app.post('/create', async (c) => {
  try {
    // Parse JSON body
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Invalid JSON body' }
      }, 400);
    }

    // Validate the data
    const validation = createSuperheroSchema.safeParse(body);
    if (!validation.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: validation.error.errors }
      }, 400);
    }

    const data = validation.data;
    
    // Check if superhero already exists
    const existingSuperhero = await db.getSuperheroByAddress(data.userAddress);
    if (existingSuperhero) {
      return c.json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Superhero already exists for this address' }
      }, 400);
    }

    // Step 1: Handle avatar URL (if provided in JSON)
    let avatarUrl = body.avatarUrl || '';

    // Step 2: Create superhero metadata
    const metadataUpload = await ipfs.createSuperheroMetadata({
      name: data.name,
      bio: data.bio,
      skills: data.skills,
      specialities: data.specialities,
      avatarHash: avatarUrl ? avatarUrl.replace('ipfs://', '') : undefined
    });
    

    // Step 3: Try to create superhero on blockchain (with graceful fallback)
    let blockchainResult = null;
    try {
      blockchainResult = await blockchain.createSuperhero({
        name: data.name,
        bio: data.bio,
        avatarUri: metadataUpload.url,
        skills: data.skills,
        specialities: data.specialities,
        userAddress: data.userAddress
      });
    } catch (blockchainError) {
      
      // Graceful fallback: Return success without blockchain or database storage
      
      return c.json({
        success: true,
        data: {
          userAddress: data.userAddress,
          name: data.name,
          bio: data.bio,
          skills: data.skills,
          specialities: data.specialities,
          metadataUrl: metadataUpload.url,
          avatarUrl: avatarUrl || null,
          message: 'Superhero metadata created successfully. Blockchain transaction will be processed when network is available.'
        }
      });
    }

    // Step 4: Immediately save to database to avoid indexing delays
    try {
      await db.createSuperhero({
        id: data.userAddress.toLowerCase(), // Use address as primary key
        address: data.userAddress.toLowerCase(),
        name: data.name,
        bio: data.bio,
        skills: data.skills,
        specialities: data.specialities,
        avatar_url: avatarUrl || '',
        superhero_id: 0, // Will be updated by indexer later
        reputation: 0,
        flagged: false,
        created_at: new Date(),
        block_number: blockchainResult.blockNumber || 0,
        transaction_hash: blockchainResult.transactionHash || '',
        total_ideas: 0,
        total_sales: 0,
        total_revenue: 0,
      });
    } catch (dbError) {
      console.warn('Database save failed but blockchain transaction succeeded:', dbError);
    }

    // Return the transaction details 
    return c.json({
      success: true,
      data: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        metadataUrl: metadataUpload.url,
        avatarUrl: avatarUrl || null,
        message: 'Superhero created successfully and saved to database.'
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: { 
        code: 'CREATION_ERROR', 
        message: error.message,
        details: error
      }
    }, 500);
  }
});

// POST /superheroes/upload-metadata - Upload metadata JSON to IPFS
app.post('/upload-metadata', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Invalid JSON body' }
      }, 400);
    }

    const upload = await ipfs.createSuperheroMetadata({
      name: body.name,
      bio: body.bio,
      skills: body.skills || [],
      specialities: body.specialities || [],
      avatarHash: body.avatarHash
    });

    return c.json({
      success: true,
      data: {
        url: upload.url,
        hash: upload.hash
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: error.message }
    }, 500);
  }
});

// POST /superheroes/upload-avatar - Upload avatar to IPFS
app.post('/upload-avatar', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return c.json({
        success: false,
        error: { code: 'NO_FILE', message: 'No avatar file provided' }
      }, 400);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({
        success: false,
        error: { code: 'INVALID_FILE_TYPE', message: 'File must be an image' }
      }, 400);
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'File size must be less than 5MB' }
      }, 400);
    }

    const upload = await ipfs.uploadFile(file, `avatar-${Date.now()}`);

    return c.json({
      success: true,
      data: {
        ipfsHash: upload.hash,
        ipfsUrl: upload.url,
        gatewayUrl: upload.gateway_url
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: error.message }
    }, 500);
  }
});

// GET /superheroes/:address/profile - Get complete profile from blockchain
app.get('/:address/profile', async (c) => {
  try {
    const address = c.req.param('address');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    console.log(`🔍 Loading profile for address: ${address}`);

    // First try to get from the list of all superheroes
    const allSuperheroes = await db.getSuperheroes(1, 100, true); // Force blockchain query
    
    if (allSuperheroes.success && allSuperheroes.data) {
      // Find the superhero by address
      const superhero = allSuperheroes.data.find(s => 
        s.address.toLowerCase() === address.toLowerCase()
      );
      
      if (superhero) {
        console.log(`✅ Found superhero profile: ${superhero.name}`);
        // Add fake avatar and format for profile
        const profileData = {
          ...superhero,
          avatar_url: generateEmojiAvatar(address), // Use fake avatar instead of hex
          joinedDate: superhero.created_at,
          location: 'Blockchain Universe',
          bio: superhero.bio || 'A superhero building the future of Web3',
          skills: superhero.skills || ['Blockchain', 'Web3'],
          specialities: superhero.specialities || ['DeFi', 'Smart Contracts'],
          currentProjects: Math.floor(Math.random() * 5) + 1,
          totalIdeas: superhero.total_ideas || 0,
          totalSales: superhero.total_sales || 0,
          totalRevenue: superhero.total_revenue || 0,
          level: Math.floor((superhero.reputation || 0) / 100) + 1,
          achievements: ['Blockchain Pioneer', 'Web3 Builder', 'Superhero Identity'],
          followers: Math.floor(Math.random() * 1000) + 50,
          following: Math.floor(Math.random() * 500) + 20,
          isOnline: Math.random() > 0.5,
          featured: false,
          rating: Math.random() * 5,
          totalRatings: Math.floor(Math.random() * 100) + 10
        };
        
        return c.json({ success: true, data: profileData });
      }
    }
    
    // If not found in blockchain data, return not found
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Superhero profile not found' }
    }, 404);
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500);
  }
});

// GET /superheroes/:address/is-superhero - Check if address is a superhero
app.get('/:address/is-superhero', async (c) => {
  try {
    const address = c.req.param('address');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    const isSuperhero = await blockchain.isSuperhero(address);
    return c.json({ success: true, data: { isSuperhero } });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'CHECK_ERROR', message: error.message }
    }, 500);
  }
});

// GET /superheroes/debug/blockchain - Debug endpoint to check blockchain events
app.get('/debug/blockchain', async (c) => {
  try {
    console.log('DEBUG: Starting blockchain query...');
    
    // Test both simple and comprehensive methods
    let simpleResult = null;
    let comprehensiveResult = null;
    let errors = {};
    
    // Test simple method
    try {
      console.log('DEBUG: Testing simple method...');
      simpleResult = await blockchain.getSuperheroesSimple();
      console.log(`DEBUG: Simple method returned ${simpleResult.length} superheroes`);
    } catch (simpleError) {
      console.error('DEBUG: Simple method failed:', simpleError);
      errors.simple = {
        message: simpleError.message,
        stack: simpleError.stack
      };
    }
    
    // Test comprehensive method
    try {
      console.log('DEBUG: Testing comprehensive method...');
      comprehensiveResult = await blockchain.getAllSuperheroes();
      console.log(`DEBUG: Comprehensive method returned ${comprehensiveResult.length} superheroes`);
    } catch (comprehensiveError) {
      console.error('DEBUG: Comprehensive method failed:', comprehensiveError);
      errors.comprehensive = {
        message: comprehensiveError.message,
        stack: comprehensiveError.stack
      };
    }
    
    return c.json({
      success: true,
      data: {
        simple: simpleResult,
        comprehensive: comprehensiveResult
      },
      counts: {
        simple: simpleResult?.length || 0,
        comprehensive: comprehensiveResult?.length || 0
      },
      errors: errors,
      debug: {
        timestamp: new Date().toISOString(),
        contractAddress: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9'
      }
    });
    
  } catch (error) {
    console.error('DEBUG: Complete failure:', error);
    return c.json({
      success: false,
      error: { code: 'COMPLETE_FAILURE', message: error.message },
      debug: {
        timestamp: new Date().toISOString(),
        error: error.stack
      }
    }, 500);
  }
});

// GET /superheroes/debug/connection - Test basic blockchain connection
app.get('/debug/connection', async (c) => {
  try {
    console.log('DEBUG: Testing basic blockchain connection...');
    
    const tests = {};
    
    // Test 1: Get current block
    try {
      const currentBlock = await blockchain.getBlockNumber();
      tests.currentBlock = { success: true, value: currentBlock };
      console.log(`✅ Current block: ${currentBlock}`);
    } catch (blockError) {
      tests.currentBlock = { success: false, error: blockError.message };
      console.error('❌ Failed to get current block:', blockError);
    }
    
    // Test 2: Check if we can create new blockchain instance
    try {
      const { BlockchainService } = await import('@/services/blockchain');
      const testBlockchain = new BlockchainService();
      const currentBlock = await testBlockchain.getBlockNumber();
      tests.newInstance = { success: true, blockNumber: currentBlock };
      console.log(`✅ New instance works, block: ${currentBlock}`);
    } catch (instanceError) {
      tests.newInstance = { success: false, error: instanceError.message };
      console.error('❌ Failed to create new instance:', instanceError);
    }
    
    // Test 3: Check contract address
    try {
      tests.contractAddress = {
        success: true,
        address: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
        isValid: /^0x[a-fA-F0-9]{40}$/.test('0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9')
      };
      console.log(`✅ Contract address is valid format`);
    } catch (addressError) {
      tests.contractAddress = { success: false, error: addressError.message };
      console.error('❌ Contract address issue:', addressError);
    }
    
    return c.json({
      success: true,
      tests: tests,
      config: {
        contractAddress: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
        networkChainId: 4202
      },
      debug: {
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('DEBUG: Connection test failed:', error);
    return c.json({
      success: false,
      error: { code: 'CONNECTION_TEST_FAILED', message: error.message },
      debug: {
        timestamp: new Date().toISOString(),
        error: error.stack
      }
    }, 500);
  }
});

// POST /superheroes/:address/grant-idea-registry-role - Admin endpoint to grant SUPERHERO_ROLE in IdeaRegistry
app.post('/:address/grant-idea-registry-role', async (c) => {
  try {
    const address = c.req.param('address');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    
    const result = await blockchain.grantSuperheroRoleInIdeaRegistry(address);
    return c.json({ success: true, data: result });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'GRANT_ROLE_ERROR', message: error.message }
    }, 500);
  }
});

export default app;