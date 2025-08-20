// ==========================================
// src/utils/auth.ts - JWT Token Validation
// ==========================================

import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';

// Cache the JWKS client
let jwksClientInstance: jwksClient.JwksClient | null = null;

interface DecodedToken {
  sub: string;  // User ID from Cognito
  email: string;
  email_verified: boolean;
  'cognito:username': string;
  'custom:role'?: string;
  exp: number;
  iat: number;
  aud: string;  // Client ID
  iss: string;  // Issuer
}

/**
 * Initialize JWKS client for fetching public keys
 */
function getJwksClient(): jwksClient.JwksClient {
  if (!jwksClientInstance) {
    const region = process.env.AWS_REGION || 'us-east-1';
    const userPoolId = process.env.USER_POOL_ID;
    
    if (!userPoolId) {
      throw new Error('USER_POOL_ID environment variable is not set');
    }
    
    jwksClientInstance = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000 // 10 minutes
    });
  }
  
  return jwksClientInstance;
}

/**
 * Get signing key from JWKS
 */
async function getSigningKey(kid: string | undefined): Promise<string> {
  const client = getJwksClient();
  const getSigningKeyAsync = promisify(client.getSigningKey).bind(client);
  
  try {
    const key = await getSigningKeyAsync(kid);
    if (key == null) throw Error('Unable to fetch signing key');
    return key.getPublicKey();
  } catch (error) {
    console.error('Error fetching signing key:', error);
    throw new Error('Unable to fetch signing key');
  }
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<DecodedToken> {
  // First decode the token to get the header
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }
  
  // Get the signing key
  const publicKey = await getSigningKey(decoded.header.kid);
  
  // Verify the token
  const verified = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`,
    audience: process.env.CLIENT_ID // Optional: verify the client ID
  }) as DecodedToken;
  
  return verified;
}

/**
 * Extract user info from API Gateway event
 */
export async function getUserFromEvent(event: APIGatewayProxyEvent): Promise<{
  userId: string;
  username: string;
  email: string;
  isAuthenticated: boolean;
} | null> {
  try {
    // Method 1: From Cognito Authorizer (API Gateway)
    if (event.requestContext?.authorizer?.claims) {
      const claims = event.requestContext.authorizer.claims;
      return {
        userId: claims.sub,
        username: claims['cognito:username'] || claims.email,
        email: claims.email,
        isAuthenticated: true
      };
    }
    
    // Method 2: From Authorization header (manual validation)
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      
      return {
        userId: decoded.sub,
        username: decoded['cognito:username'] || decoded.email,
        email: decoded.email,
        isAuthenticated: true
      };
    }
    
    // Method 3: From x-user-id header (for testing/migration period)
    const xUserId = event.headers?.['x-user-id'];
    if (xUserId && process.env.ALLOW_X_USER_ID === 'true') {
      // Only allow in development/testing
      console.warn('Using x-user-id header for authentication - should only be used in development');
      return {
        userId: xUserId,
        username: 'unknown',
        email: 'unknown',
        isAuthenticated: false // Mark as not properly authenticated
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user from event:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(handler: Function) {
  return async (event: APIGatewayProxyEvent, context: any) => {
    const user = await getUserFromEvent(event);
    
    if (!user || !user.isAuthenticated) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'Authentication required'
        })
      };
    }
    
    // Add user to event context for handler to use
    event.requestContext = event.requestContext || {};
    event.requestContext.authorizer = event.requestContext.authorizer || {};
    event.requestContext.authorizer.userId = user.userId;
    event.requestContext.authorizer.username = user.username;
    event.requestContext.authorizer.email = user.email;
    
    return handler(event, context);
  };
}