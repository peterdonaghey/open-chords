/**
 * Admin Reset Password API - Admin resets any user's password
 */
import { getUserByEmail, updatePassword } from '../_users.js';
import { authenticateRequest } from '../_auth.js';
import { scrypt, randomUUID } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hash a password
 */
async function hashPassword(password) {
  const salt = randomUUID();
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate and check admin
    const authResult = await authenticateRequest(req);

    if (!authResult.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password (no verification of current password needed - admin override)
    await updatePassword(email, passwordHash);

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

