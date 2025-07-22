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
const createIdeaSchema = z.object({
  title: z.string().min(1).max(31), // bytes32 limit
  description: z.string().min(1).max(2000),
  categories: z.array(z.string()).min(1).max(5),
  price: z.number().min(0.01).max(10000), // USDC price
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  availableOnly: z.string().optional().default('true').transform(val => val === 'true')
});

// GET /ideas - Get all ideas with pagination
app.get('/', zValidator('query', paginationSchema), async (c) => {
  try {
    const { page, limit, availableOnly } = c.req.valid('query');
    const result = await db.getIdeas(page, limit, availableOnly);
    return c.json(result);
  } catch (error) {
    return c.json({ 
      success: false, 
      error: { code: 'FETCH_ERROR', message: (error as Error).message } 
    }, 500);
  }
});

// GET /ideas/:ideaId - Get idea by ID
app.get('/:ideaId', async (c) => {
  try {
    const ideaId = parseInt(c.req.param('ideaId'));
    
    if (isNaN(ideaId) || ideaId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid idea ID' }
      }, 400);
    }

    // Get idea details from blockchain with superhero info
    const idea = await blockchain.getIdeaDetailsWithSuperhero(ideaId);
    
    if (!idea) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Idea not found' }
      }, 404);
    }

    return c.json({ success: true, data: idea });
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /ideas/prepare-metadata - Prepare metadata for frontend contract interaction
app.post('/prepare-metadata', async (c) => {
  try {
    // Parse form data instead of JSON
    const formData = await c.req.formData();
    
    // Extract and validate data from form
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      categories: JSON.parse(formData.get('categories') as string || '[]'),
      price: parseFloat(formData.get('price') as string || '0'),
      userAddress: formData.get('userAddress') as string
    };

    // Validate the extracted data
    const validationResult = createIdeaSchema.safeParse(data);
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid form data',
          details: validationResult.error.errors
        }
      }, 400);
    }
    
    // Check if user is a superhero
    const isSuperhero = await blockchain.isSuperhero(data.userAddress);
    if (!isSuperhero) {
      return c.json({
        success: false,
        error: { code: 'NOT_SUPERHERO', message: 'Only superheroes can create ideas' }
      }, 403);
    }

    // Step 1: Handle content and image upload if provided
    let contentUrl = '';
    let imageUrl = '';
    
    // Files are already in formData (parsed above)
    
    if (formData?.get('content')) {
      const contentFile = formData.get('content') as File;
      console.log('📄 Uploading content to IPFS...');
      
      const contentUpload = await ipfs.uploadFile(contentFile, `${data.title}-content`);
      contentUrl = contentUpload.url;
      
      console.log('✅ Content uploaded:', contentUrl);
    }

    if (formData?.get('image')) {
      const imageFile = formData.get('image') as File;
      console.log('🖼️ Uploading image to IPFS...');
      
      const imageUpload = await ipfs.uploadFile(imageFile, `${data.title}-image`);
      imageUrl = imageUpload.url;
      
      console.log('✅ Image uploaded:', imageUrl);
    }

    // Step 2: Create idea metadata
    console.log('📄 Creating idea metadata...');
    const metadataUpload = await ipfs.createIdeaMetadata({
      title: data.title,
      description: data.description,
      categories: data.categories,
      contentHash: contentUrl ? contentUrl.replace('ipfs://', '') : undefined,
      imageHash: imageUrl ? imageUrl.replace('ipfs://', '') : undefined
    });
    
    console.log('✅ Metadata uploaded:', metadataUpload.url);

    // Return metadata for frontend to use in contract interaction
    console.log('✅ Metadata prepared for frontend contract interaction');
    
    return c.json({
      success: true,
      data: {
        metadataHash: metadataUpload.hash,
        metadataUrl: metadataUpload.url,
        contentUrl: contentUrl || null,
        imageUrl: imageUrl || null,
        message: 'Metadata uploaded to IPFS. Use this hash for contract interaction.'
      }
    });

  } catch (error) {
    console.error('❌ Idea creation error:', error);
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

// POST /ideas/upload-content - Upload content files to IPFS
app.post('/upload-content', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('content') as File;
    
    if (!file) {
      return c.json({
        success: false,
        error: { code: 'NO_FILE', message: 'No content file provided' }
      }, 400);
    }

    // Check file size (max 10MB for content)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'File size must be less than 10MB' }
      }, 400);
    }

    const upload = await ipfs.uploadFile(file, `content-${Date.now()}`);

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
      error: { code: 'UPLOAD_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// POST /ideas/upload-image - Upload image to IPFS
app.post('/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return c.json({
        success: false,
        error: { code: 'NO_FILE', message: 'No image file provided' }
      }, 400);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({
        success: false,
        error: { code: 'INVALID_FILE_TYPE', message: 'File must be an image' }
      }, 400);
    }

    // Check file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'File size must be less than 5MB' }
      }, 400);
    }

    const upload = await ipfs.uploadFile(file, `image-${Date.now()}`);

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
      error: { code: 'UPLOAD_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/:ideaId/details - Get complete details from blockchain
app.get('/:ideaId/details', async (c) => {
  try {
    const ideaId = parseInt(c.req.param('ideaId'));
    
    if (isNaN(ideaId) || ideaId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid idea ID' }
      }, 400);
    }

    const details = await blockchain.getIdeaDetails(ideaId);
    return c.json({ success: true, data: details });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/by-creator/:address - Get ideas by creator address
app.get('/by-creator/:address', zValidator('query', paginationSchema), async (c) => {
  try {
    const address = c.req.param('address');
    const { page, limit } = c.req.valid('query');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    // This would require a custom query in the database service
    // For now, we'll use the search functionality
    const ideas = await db.getIdeas(page, limit, false);
    
    // Filter by creator address (this should be optimized with a proper database query)
    const filteredIdeas = {
      ...ideas,
      data: ideas.data.filter((idea: any) => idea.creator?.toLowerCase() === address.toLowerCase())
    };

    return c.json(filteredIdeas);
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/categories - Get all available categories
app.get('/categories', async (c) => {
  try {
    // This could be enhanced to get dynamic categories from the database
    const categories = [
      'Technology',
      'Business',
      'Creative',
      'Social Impact',
      'Entertainment',
      'Education',
      'Health',
      'Finance',
      'Marketing',
      'Design'
    ];

    return c.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// Purchase-related endpoints

// POST /ideas/:id/purchase - Purchase an idea
const purchaseSchema = z.object({
  buyerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

app.post('/:id/purchase', zValidator('json', purchaseSchema), async (c) => {
  try {
    const ideaId = parseInt(c.req.param('id'));
    const { buyerAddress } = c.req.valid('json');
    
    if (isNaN(ideaId) || ideaId <= 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid idea ID' }
      }, 400);
    }

    console.log(`💰 Processing purchase request for idea ${ideaId} by ${buyerAddress}`);

    // Execute the purchase on blockchain
    const purchaseResult = await blockchain.buyIdea(ideaId, buyerAddress);
    
    if (!purchaseResult.success) {
      return c.json({
        success: false,
        error: { code: 'PURCHASE_FAILED', message: 'Blockchain purchase failed' }
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: 'Idea purchased successfully',
        transactionHash: purchaseResult.transactionHash,
        blockNumber: purchaseResult.blockNumber,
        ideaId: purchaseResult.ideaId,
        price: purchaseResult.price,
        seller: purchaseResult.seller,
        buyer: purchaseResult.buyer
      }
    });

  } catch (error) {
    console.error('Purchase failed:', error);
    return c.json({
      success: false,
      error: { code: 'PURCHASE_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/:id/content - Get decrypted content after purchase
app.get('/:id/content', async (c) => {
  try {
    const ideaId = parseInt(c.req.param('id'));
    const buyerAddress = c.req.query('buyer');
    
    if (isNaN(ideaId) || ideaId <= 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid idea ID' }
      }, 400);
    }

    if (!buyerAddress || !/^0x[a-fA-F0-9]{40}$/.test(buyerAddress)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_BUYER', message: 'Valid buyer address required' }
      }, 400);
    }

    console.log(`🔓 Attempting to decrypt content for idea ${ideaId} for buyer ${buyerAddress}`);

    // First verify that the user owns this idea OR has purchased it
    const isOwner = await blockchain.checkIdeaOwnership(ideaId, buyerAddress);
    let hasAccess = isOwner;
    
    if (!isOwner) {
      console.log(`🔍 User doesn't currently own idea ${ideaId}, checking purchase history...`);
      // Check if user has purchased this idea
      const purchaseHistory = await blockchain.getPurchaseHistory(buyerAddress);
      const hasPurchased = purchaseHistory.some(purchase => purchase.ideaId === ideaId);
      
      if (hasPurchased) {
        console.log(`✅ User has purchased idea ${ideaId} - allowing content access`);
        hasAccess = true;
      }
    }
    
    if (!hasAccess) {
      return c.json({
        success: false,
        error: { code: 'NOT_OWNER', message: 'You do not own this idea and have not purchased it' }
      }, 403);
    }
    
    // Get idea details for IPFS hash
    const ideaDetails = await blockchain.getIdeaDetails(ideaId);

    // Get the encrypted content from IPFS
    try {
      const ipfsContent = await ipfs.getJSON(ideaDetails.ipfsHash);
      
      // Check if content is encrypted
      if (!ipfsContent.encrypted) {
        // Content is not encrypted, return as-is (for backward compatibility)
        return c.json({
          success: true,
          data: {
            content: ipfsContent,
            encrypted: false,
            message: 'Content was not encrypted'
          }
        });
      }

      // Import crypto service for decryption
      const { CryptoService } = await import('@/services/crypto');
      
      // Decrypt the content
      const decryptedContent = CryptoService.decryptIdeaContent(ipfsContent, buyerAddress);
      
      return c.json({
        success: true,
        data: {
          content: decryptedContent,
          encrypted: true,
          decryptedFor: buyerAddress,
          ideaId: ideaId
        }
      });

    } catch (ipfsError) {
      console.error('IPFS content retrieval failed:', ipfsError);
      return c.json({
        success: false,
        error: { code: 'CONTENT_ERROR', message: 'Failed to retrieve idea content' }
      }, 500);
    }

  } catch (error) {
    console.error('Content decryption failed:', error);
    return c.json({
      success: false,
      error: { code: 'DECRYPTION_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/:id/purchase-status - Check if user has purchased an idea
app.get('/:id/purchase-status', async (c) => {
  try {
    const ideaId = parseInt(c.req.param('id'));
    const userAddress = c.req.query('user');
    
    if (isNaN(ideaId) || ideaId <= 0) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid idea ID' }
      }, 400);
    }

    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_USER', message: 'Valid user address required' }
      }, 400);
    }

    // Check if the idea has been purchased
    const ideaDetails = await blockchain.getIdeaDetails(ideaId);
    
    // Check USDC balance and allowance for the user
    const usdcStatus = await blockchain.checkUSDCAllowance(userAddress);
    
    return c.json({
      success: true,
      data: {
        ideaId,
        isPurchased: ideaDetails.isPurchased,
        price: ideaDetails.price,
        canAfford: parseFloat(usdcStatus.balance) >= parseFloat(ideaDetails.price),
        hasAllowance: parseFloat(usdcStatus.allowance) >= parseFloat(ideaDetails.price),
        userBalance: usdcStatus.balance,
        userAllowance: usdcStatus.allowance,
        priceInWei: (parseFloat(ideaDetails.price) * 1e6).toString() // USDC has 6 decimals
      }
    });

  } catch (error) {
    console.error('Purchase status check failed:', error);
    return c.json({
      success: false,
      error: { code: 'STATUS_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/:ideaId/ownership - Check if user owns a specific idea
app.get('/:ideaId/ownership', async (c) => {
  try {
    const ideaId = parseInt(c.req.param('ideaId'));
    const userAddress = c.req.query('user');

    // Validate idea ID
    if (isNaN(ideaId) || ideaId < 1) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Valid idea ID required' }
      }, 400);
    }

    // Validate user address
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_USER', message: 'Valid user address required' }
      }, 400);
    }

    console.log(`🔍 Checking ownership of idea ${ideaId} for user ${userAddress}`);

    // Check if the user owns the idea NFT
    const isOwner = await blockchain.checkIdeaOwnership(ideaId, userAddress);

    return c.json({
      success: true,
      data: {
        ideaId,
        userAddress,
        isOwner
      }
    });

  } catch (error) {
    console.error('Ownership check failed:', error);
    return c.json({
      success: false,
      error: { code: 'OWNERSHIP_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// GET /ideas/purchased-by/:userAddress - Get ideas purchased by a specific user
app.get('/purchased-by/:userAddress', async (c) => {
  try {
    const userAddress = c.req.param('userAddress');
    
    // Validate user address
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Valid user address required' }
      }, 400);
    }

    console.log(`🛒 Getting purchased ideas for user: ${userAddress}`);

    // Get purchase history from blockchain
    const purchaseHistory = await blockchain.getPurchaseHistory(userAddress);
    
    console.log(`📋 Found ${purchaseHistory.length} purchase transactions`);
    
    // Get full idea details for each purchased idea
    const purchasedIdeas = [];
    for (const purchase of purchaseHistory) {
      try {
        const ideaDetails = await blockchain.getIdeaDetails(purchase.ideaId);
        purchasedIdeas.push({
          ...ideaDetails,
          purchaseInfo: {
            transactionHash: purchase.transactionHash,
            blockNumber: purchase.blockNumber,
            timestamp: purchase.timestamp,
            price: purchase.price,
            buyer: purchase.buyer,
            seller: purchase.seller
          }
        });
      } catch (err) {
        console.warn(`Failed to get details for purchased idea ${purchase.ideaId}:`, err);
      }
    }

    return c.json({
      success: true,
      data: purchasedIdeas
    });

  } catch (error) {
    console.error('Failed to get purchased ideas:', error);
    return c.json({
      success: false,
      error: { code: 'PURCHASE_HISTORY_ERROR', message: (error as Error).message }
    }, 500);
  }
});

export default app;