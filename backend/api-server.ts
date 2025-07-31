// Standalone API server (without Ponder indexer)
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';

// Import routes
import superheroes from './src/routes/superheroes';
import ideas from './src/routes/ideas';
import teams from './src/routes/teams';
import ratings from './src/routes/ratings';

// Import services
import { BlockchainService } from './src/services/blockchain';
import { IPFSService } from './src/services/ipfs';
import { DatabaseService } from './src/services/database';

const app = new Hono();
const blockchain = new BlockchainService();
const ipfs = new IPFSService();
const db = new DatabaseService();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger());
app.use('*', prettyJSON());

// Health check route
app.get('/health', async (c) => {
  try {
    const blockNumber = await blockchain.getBlockNumber();
    const gasPrice = await blockchain.getGasPrice();

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      blockchain: {
        connected: true,
        latestBlock: blockNumber,
        gasPrice: `${gasPrice} gwei`,
        network: 'Lisk Sepolia (4202)',
      },
      services: {
        ipfs: 'operational',
        database: 'operational'
      }
    });
  } catch (error) {
    return c.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      blockchain: {
        connected: false,
        network: 'Lisk Sepolia (4202)',
      }
    }, 503);
  }
});

// API documentation
app.get('/', (c) => {
  return c.json({
    name: 'Idea Marketplace API',
    version: '1.0.0',
    description: 'Backend API for NFT-based idea marketplace',
    endpoints: {
      health: '/health',
      superheroes: '/superheroes',
      ideas: '/ideas',
      teams: '/teams',
      ratings: '/ratings'
    },
    blockchain: {
      network: 'Lisk Sepolia',
      chainId: 4202
    }
  });
});

// Routes
app.route('/superheroes', superheroes);
app.route('/ideas', ideas);
app.route('/teams', teams);
app.route('/ratings', ratings);

// Platform statistics endpoint
app.get('/stats', async (c) => {
  try {
    const stats = await db.getPlatformStats();
    return c.json(stats);
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'STATS_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// Search endpoint (searches across all entities)
app.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query || query.length < 2) {
      return c.json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Search query must be at least 2 characters' }
      }, 400);
    }

    const results = await db.searchAll(query, page, limit);
    return c.json(results);

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'SEARCH_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// Blockchain utility endpoints
app.get('/blockchain/status', async (c) => {
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      blockchain.getBlockNumber(),
      blockchain.getGasPrice()
    ]);

    return c.json({
      success: true,
      data: {
        network: 'Lisk Sepolia',
        blockNumber,
        gasPriceGwei: gasPrice,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: (error as Error).message }
    }, 500);
  }
});

app.get('/blockchain/tx/:hash', async (c) => {
  try {
    const txHash = c.req.param('hash');
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_HASH', message: 'Invalid transaction hash' }
      }, 400);
    }

    const status = await blockchain.getTransactionStatus(txHash);
    return c.json({ success: true, data: status });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'TX_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// IPFS utility endpoints
app.get('/ipfs/:hash', async (c) => {
  try {
    const hash = c.req.param('hash');
    
    if (!hash || hash.length !== 46) {
      return c.json({
        success: false,
        error: { code: 'INVALID_HASH', message: 'Invalid IPFS hash' }
      }, 400);
    }

    const response = await ipfs.getFile(hash);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the file directly
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'IPFS_ERROR', message: (error as Error).message }
    }, 500);
  }
});

app.get('/ipfs/:hash/json', async (c) => {
  try {
    const hash = c.req.param('hash');
    
    if (!hash || hash.length !== 46) {
      return c.json({
        success: false,
        error: { code: 'INVALID_HASH', message: 'Invalid IPFS hash' }
      }, 400);
    }

    const data = await ipfs.getJSON(hash);
    return c.json({ success: true, data });

  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'IPFS_ERROR', message: (error as Error).message }
    }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3002');

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  // Server started successfully
});