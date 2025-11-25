// API endpoint: GET /api/songs - List all songs (PUBLIC)
// API endpoint: POST /api/songs - Create a new song (AUTH REQUIRED)
import { listSongs, listAllSongs, saveSong } from './_dynamodb.js';
import { authenticateRequest } from './_auth.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // List all songs - PUBLIC, no auth required
      const songs = await listAllSongs();
      return res.status(200).json(songs);
    }

    if (req.method === 'POST') {
      // Create a new song - AUTH REQUIRED
      const userId = await authenticateRequest(req);
      const song = req.body;

      // Validate required fields
      if (!song.id || !song.title || !song.content) {
        return res.status(400).json({ error: 'Missing required fields: id, title, content' });
      }

      const savedSong = await saveSong(userId, song);
      return res.status(201).json(savedSong);
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('authorization') || error.message?.includes('token')) {
      return res.status(401).json({ error: 'Unauthorized', message: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
