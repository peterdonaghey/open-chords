/**
 * Admin Delete User API - Admin deletes users
 */
import { deleteUser } from '../_users.js';
import { authenticateRequest } from '../_auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate and check admin
    const authResult = await authenticateRequest(req);

    if (!authResult.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Prevent admin from deleting their own account
    if (email === authResult.email) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user
    await deleteUser(email);

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: error.message });
    }

    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

