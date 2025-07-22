import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Rate limiting storage (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return async (c: Context, next: Next) => {
    const clientId = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (clientData) {
      if (now > clientData.resetTime) {
        // Reset the count if window has passed
        requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      } else if (clientData.count >= maxRequests) {
        // Rate limit exceeded
        return c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
          }
        }, 429);
      } else {
        // Increment count
        clientData.count++;
      }
    } else {
      // First request from this client
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    }
    
    await next();
  };
};

// Authentication middleware (placeholder for future JWT implementation)
export const authenticate = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required'
      }
    }, 401);
  }
  
  // TODO: Implement JWT verification
  // For now, just pass through
  await next();
};

// Request validation middleware
export const validateRequest = async (c: Context, next: Next) => {
  try {
    // Validate Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      const contentType = c.req.header('content-type');
      
      if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Content-Type must be application/json or multipart/form-data'
          }
        }, 400);
      }
    }
    
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'REQUEST_VALIDATION_ERROR',
        message: (error as Error).message
      }
    }, 400);
  }
};

// CORS headers middleware (additional to Hono's CORS)
export const securityHeaders = async (c: Context, next: Next) => {
  await next();
  
  // Add security headers to response
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
};

// Request logging middleware (enhanced)
export const enhancedLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('user-agent') || 'unknown';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
  console.log(`📥 ${method} ${path} - ${ip} - ${userAgent}`);
  
  await next();
  
  const end = Date.now();
  const responseTime = end - start;
  const status = c.res.status;
  
  const logLevel = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
  console.log(`${logLevel} ${method} ${path} - ${status} - ${responseTime}ms`);
};

// Error handling middleware
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('❌ Request error:', error);
    
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('ENOTFOUND')) {
        return c.json({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network connection failed'
          }
        }, 503);
      }
      
      if (error.message.includes('timeout')) {
        return c.json({
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: 'Request timeout'
          }
        }, 504);
      }
      
      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
        }
      }, 500);
    }
    
    return c.json({
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred'
      }
    }, 500);
  }
};

// File upload validation middleware
export const validateFileUpload = (maxSize: number = 10 * 1024 * 1024, allowedTypes: string[] = []) => {
  return async (c: Context, next: Next) => {
    try {
      const contentType = c.req.header('content-type');
      
      if (contentType?.includes('multipart/form-data')) {
        const formData = await c.req.formData();
        
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            // Check file size
            if (value.size > maxSize) {
              return c.json({
                success: false,
                error: {
                  code: 'FILE_TOO_LARGE',
                  message: `File ${key} is too large. Max size: ${maxSize / 1024 / 1024}MB`
                }
              }, 400);
            }
            
            // Check file type if specified
            if (allowedTypes.length > 0 && !allowedTypes.some(type => value.type.startsWith(type))) {
              return c.json({
                success: false,
                error: {
                  code: 'INVALID_FILE_TYPE',
                  message: `File ${key} type not allowed. Allowed types: ${allowedTypes.join(', ')}`
                }
              }, 400);
            }
          }
        }
      }
      
      await next();
    } catch (error) {
      return c.json({
        success: false,
        error: {
          code: 'FILE_VALIDATION_ERROR',
          message: (error as Error).message
        }
      }, 400);
    }
  };
};

// Ethereum address validation middleware
export const validateEthAddress = (paramName: string = 'address') => {
  return async (c: Context, next: Next) => {
    const address = c.req.param(paramName);
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: `Invalid Ethereum address: ${paramName}`
        }
      }, 400);
    }
    
    await next();
  };
};

// API key validation middleware (for future use)
export const validateApiKey = async (c: Context, next: Next) => {
  const apiKey = c.req.header('x-api-key');
  
  if (!apiKey) {
    return c.json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'API key required'
      }
    }, 401);
  }
  
  // TODO: Validate API key against database
  // For now, just check if it exists
  
  await next();
};

// Health check for services
export const healthCheck = async (c: Context, next: Next) => {
  // This middleware can be used to check service health before processing requests
  // For now, just pass through
  await next();
};