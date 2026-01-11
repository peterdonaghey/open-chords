/**
 * Change Password API - User changes their own password
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

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hashedPassword) {
  const [salt, key] = hashedPassword.split(':');
  const derivedKey = await scryptAsync(password, salt, 64);
  return derivedKey.toString('hex') === key;
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
    // Authenticate user
    const { email } = await authenticateRequest(req);

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await updatePassword(email, newPasswordHash);

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to change password' });
  }
}

