/**
 * Sign up endpoint - Create new user account
 */
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { createUser } from '../_users.js';

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Hash password using scrypt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
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

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Basic email validation
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default role 'user'
    const user = await createUser(email, passwordHash, 'user');

    // Generate JWT token
    const token = generateToken(user.userId, user.email, user.role);

    return res.status(201).json({
      token,
      user: {
        email: user.email,
        userId: user.userId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    return res.status(500).json({ error: 'Failed to create account' });
  }
}

