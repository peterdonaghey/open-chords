/**
 * Forgot password endpoint - Generate reset token
 */
import { randomBytes } from 'crypto';
import { getUserByEmail, setResetToken } from '../_users.js';

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
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        message: 'If the email exists, a reset token has been generated',
      });
    }

    // Generate random reset token
    const resetToken = randomBytes(32).toString('hex');
    
    // Set expiry to 1 hour from now
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save reset token to database
    await setResetToken(email, resetToken, resetExpiry);

    // Return token (in production, you'd send this via email)
    return res.status(200).json({
      message: 'Reset token generated',
      resetToken, // TODO: Remove in production, send via email instead
      resetUrl: `${process.env.VITE_API_BASE_URL || ''}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

