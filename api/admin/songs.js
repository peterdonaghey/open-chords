// Admin API - List and delete all songs
import { listAllSongs, getSongById, deleteSong as dbDeleteSong } from '../_dynamodb.js';
import { authenticateRequest } from '../_auth.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Authenticate and check admin
    const authResult = await authenticateRequest(req);
    
    if (!authResult.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all songs
      const allSongs = await listAllSongs();
      
      // Format for admin view
      const formattedSongs = allSongs.map(song => ({
        id: song.songId,
        userId: song.userId,
        ownerEmail: song.ownerEmail || 'unknown',
        title: song.title,
        artist: song.artist,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
      }));

      return res.status(200).json(formattedSongs);
    }

    if (req.method === 'DELETE') {
      // Delete a song by ID (admin can delete any song)
      const songId = req.query.id;

      if (!songId) {
        return res.status(400).json({ error: 'Song ID is required' });
      }

      // Get the song to find its userId
      const song = await getSongById(songId);

      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Delete the song using its userId
      await dbDeleteSong(song.userId, songId);

      return res.status(200).json({ message: 'Song deleted successfully', songId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin songs endpoint:', error);
    
    if (error.message === 'No authorization header' || error.message === 'No token provided') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    return res.status(500).json({ error: 'Failed to process request' });
  }
}

