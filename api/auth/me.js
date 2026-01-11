/**
 * Get current user endpoint - Return authenticated user info
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Return user info from token payload
    return res.status(200).json({
      email: decoded.email,
      userId: decoded.userId,
      role: decoded.role,
      isAdmin: decoded.role === 'admin',
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
}

