/**
 * Admin Update Role API - Admin changes user roles
 */
import { updateRole } from '../_users.js';
import { authenticateRequest } from '../_auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate and check admin
    const authResult = await authenticateRequest(req);

    if (!authResult.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, role } = req.body;

    // Validate input
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Prevent admin from changing their own role
    if (email === authResult.email) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    // Update role (validation happens in updateRole function)
    await updateRole(email, role);

    return res.status(200).json({
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Update role error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: error.message });
    }

    if (error.message === 'Invalid role. Must be "user" or "admin"') {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to update user role' });
  }
}

