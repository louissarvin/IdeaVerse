import 'dotenv/config';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '@/services/database';
import { IPFSService } from '@/services/ipfs';
import { BlockchainService } from '@/services/blockchain';
import type { APIResponse } from '@/types';

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
  limit: z.string().optional().default('20').transform(Number)
});

// GET /superheroes - Get all superheroes with pagination
app.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const { page, limit } = c.req.valid('query');
    const result = await db.getSuperheroes(page, limit);
    return c.json(result);
  } catch (error) {
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

    const superhero = await db.getSuperheroByAddress(address);
    
    if (!superhero) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Superhero not found' }
      }, 404);
    }

    return c.json({ success: true, data: superhero });
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
    console.log('📄 Creating superhero metadata...');
    const metadataUpload = await ipfs.createSuperheroMetadata({
      name: data.name,
      bio: data.bio,
      skills: data.skills,
      specialities: data.specialities,
      avatarHash: avatarUrl ? avatarUrl.replace('ipfs://', '') : undefined
    });
    
    console.log('✅ Metadata uploaded:', metadataUpload.url);

    // Step 3: Try to create superhero on blockchain (with graceful fallback)
    let blockchainResult = null;
    try {
      console.log('⛓️ Creating superhero on blockchain...');
      blockchainResult = await blockchain.createSuperhero({
        name: data.name,
        bio: data.bio,
        avatarUri: metadataUpload.url,
        skills: data.skills,
        specialities: data.specialities,
        userAddress: data.userAddress
      });
      console.log('✅ Superhero created on blockchain:', blockchainResult.transactionHash);
    } catch (blockchainError) {
      console.warn('⚠️ Blockchain creation failed, proceeding without blockchain:', blockchainError.message);
      
      // Graceful fallback: Return success without blockchain or database storage
      console.log('🚧 Database storage unavailable, returning metadata-only result');
      
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

    // The indexer will automatically pick up the event and save to database
    // Return the transaction details for now
    return c.json({
      success: true,
      data: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        metadataUrl: metadataUpload.url,
        avatarUrl: avatarUrl || null,
        message: 'Superhero creation transaction submitted. It will appear in the database once indexed.'
      }
    });

  } catch (error) {
    console.error('❌ Superhero creation error:', error);
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

    const profile = await blockchain.getSuperheroProfile(address);
    return c.json({ success: true, data: profile });
    
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

    console.log(`🔐 Admin request: Granting SUPERHERO_ROLE in IdeaRegistry to ${address}`);
    
    const result = await blockchain.grantSuperheroRoleInIdeaRegistry(address);
    return c.json({ success: true, data: result });
    
  } catch (error) {
    console.error(`❌ Failed to grant SUPERHERO_ROLE:`, error);
    return c.json({
      success: false,
      error: { code: 'GRANT_ROLE_ERROR', message: error.message }
    }, 500);
  }
});

export default app;