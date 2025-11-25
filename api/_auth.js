// JWT validation utility for Cognito tokens
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const REGION = process.env.COGNITO_REGION || 'eu-central-1';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// JWKS client to fetch public keys from Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

/**
 * Get signing key from JWKS
 */
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify and decode Cognito JWT token
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<object>} - Decoded token payload
 */
export async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    }, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

/**
 * Extract userId from JWT token
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<string>} - User ID (sub claim)
 */
export async function getUserIdFromToken(token) {
  const decoded = await verifyToken(token);
  return decoded.sub;
}

/**
 * Middleware to extract and validate JWT from request
 * @param {object} req - Request object
 * @returns {Promise<string>} - User ID
 */
export async function authenticateRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  return await getUserIdFromToken(token);
}

