/**
 * JWT validation utility for custom auth
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<object>} - Decoded token payload
 */
export async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

/**
 * Middleware to extract and validate JWT from request
 * @param {object} req - Request object
 * @returns {Promise<{userId: string, email: string, role: string, isAdmin: boolean}>} - User info
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

  const decoded = await verifyToken(token);
  
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    isAdmin: decoded.role === 'admin',
  };
}
