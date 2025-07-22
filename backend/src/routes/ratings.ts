import 'dotenv/config';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '@/services/database';
import type { APIResponse } from '@/types';

const app = new Hono();
const db = new DatabaseService();

// Validation schemas
const createRatingSchema = z.object({
  builderId: z.string(),
  raterAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number)
});

// GET /ratings/builder/:builderId - Get ratings for a specific builder
app.get('/builder/:builderId', zValidator('query', paginationSchema), async (c) => {
  try {
    const builderId = c.req.param('builderId');
    const { page, limit } = c.req.valid('query');
    
    // For now, return mock data as we don't have a ratings table in the schema
    // In production, this would query the database
    const mockRatings = [
      {
        id: `${builderId}-rating-1`,
        builderId,
        raterAddress: '0x1234567890123456789012345678901234567890',
        rating: 5,
        comment: 'Excellent work on the DeFi project!',
        createdAt: Date.now() - 86400000 // 1 day ago
      },
      {
        id: `${builderId}-rating-2`,
        builderId,
        raterAddress: '0x2345678901234567890123456789012345678901',
        rating: 4,
        comment: 'Great collaboration skills',
        createdAt: Date.now() - 172800000 // 2 days ago
      }
    ];

    // Calculate average rating
    const averageRating = mockRatings.reduce((sum, r) => sum + r.rating, 0) / mockRatings.length;
    
    return c.json({
      success: true,
      data: {
        ratings: mockRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: mockRatings.length
      },
      pagination: {
        page,
        limit,
        total: mockRatings.length,
        has_more: false
      }
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: { code: 'FETCH_ERROR', message: error.message } 
    }, 500);
  }
});

// POST /ratings - Create a new rating
app.post('/', zValidator('json', createRatingSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // For now, just return success
    // In production, this would save to database
    const newRating = {
      id: `${data.builderId}-${data.raterAddress}-${Date.now()}`,
      ...data,
      createdAt: Date.now()
    };

    return c.json({
      success: true,
      data: newRating,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'CREATION_ERROR', message: error.message }
    }, 500);
  }
});

// GET /ratings/user/:address - Get ratings given by a specific user
app.get('/user/:address', zValidator('query', paginationSchema), async (c) => {
  try {
    const address = c.req.param('address');
    const { page, limit } = c.req.valid('query');
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum address' }
      }, 400);
    }

    // Mock data for user's ratings
    const userRatings = [
      {
        id: `user-rating-1`,
        builderId: '1',
        raterAddress: address,
        rating: 5,
        comment: 'Great developer!',
        createdAt: Date.now() - 86400000
      }
    ];

    return c.json({
      success: true,
      data: userRatings,
      pagination: {
        page,
        limit,
        total: userRatings.length,
        has_more: false
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500);
  }
});

export default app;