/**
 * Reset password endpoint - Validate token and update password
 */
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { getUserByEmail, updatePassword } from '../_users.js';

const scryptAsync = promisify(scrypt);

/**
 * Hash password using scrypt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
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
    const { email, resetToken, newPassword } = req.body;

    // Validate input
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, reset token, and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate reset token
    if (user.resetToken !== resetToken) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    if (!user.resetExpiry || new Date(user.resetExpiry) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await updatePassword(email, passwordHash);

    return res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

