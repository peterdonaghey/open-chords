/**
 * Sign in endpoint - Authenticate user
 */
import { scrypt } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../_users.js';

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify password against hash
 */
async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, salt, 64);
  return key === derivedKey.toString('hex');
}

/**
 * Generate JWT token
 */
function generateToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.userId, user.email, user.role);

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        userId: user.userId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
}

