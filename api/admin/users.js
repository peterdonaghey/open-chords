// Admin API - List all users with their songs
import { listAllSongs } from '../_dynamodb.js';
import { authenticateRequest } from '../_auth.js';
import { getAllUsers } from '../_users.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate and check admin
    const authResult = await authenticateRequest(req);
    
    if (!authResult.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get real users from open-chords-users table
    const realUsers = await getAllUsers();

    // Get all songs for counts
    const allSongs = await listAllSongs();

    // Create song count map by email
    const songCounts = {};
    allSongs.forEach(song => {
      const email = song.ownerEmail;
      if (email) {
        songCounts[email] = (songCounts[email] || 0) + 1;
      }
    });

    // Combine data
    const users = realUsers.map(user => ({
      userId: user.userId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      songCount: songCounts[user.email] || 0,
    }));

    // Sort by song count (descending)
    users.sort((a, b) => b.songCount - a.songCount);

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (error.message === 'No authorization header' || error.message === 'No token provided') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

