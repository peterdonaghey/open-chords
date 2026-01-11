// API endpoint: GET /api/songs/[id] - Get a specific song (PUBLIC)
// API endpoint: PUT /api/songs/[id] - Update a song (AUTH REQUIRED)
// API endpoint: DELETE /api/songs/[id] - Delete a song (AUTH REQUIRED, or ADMIN)
import { getSong, getSongById, updateSong, deleteSong } from '../_dynamodb.js';
import { authenticateRequest } from '../_auth.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Song ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get a specific song - PUBLIC, no auth required
      const song = await getSongById(id);

      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Transform songId to id for frontend compatibility
      return res.status(200).json({
        ...song,
        id: song.songId,
      });
    }

    // Auth required for PUT and DELETE
    const authResult = await authenticateRequest(req);

    if (req.method === 'PUT') {
      // Update a song
      const song = req.body;

      // Validate required fields
      if (!song.id || !song.title || !song.content) {
        return res.status(400).json({ error: 'Missing required fields: id, title, content' });
      }

      // Ensure the ID in the URL matches the ID in the body
      if (song.id !== id) {
        return res.status(400).json({ error: 'Song ID mismatch' });
      }

      // Get the existing song to check ownership
      const existingSong = await getSongById(id);
      if (!existingSong) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Check ownership: either userId matches OR ownerEmail matches
      const isOwner = 
        (existingSong.userId === authResult.userId) || 
        (existingSong.ownerEmail === authResult.email);
      
      if (!isOwner && !authResult.isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to edit this song' });
      }

      // Update using the song's original userId (for DynamoDB key)
      const updatedSong = await updateSong(existingSong.userId, song);
      // Transform songId to id for frontend compatibility
      return res.status(200).json({
        ...updatedSong,
        id: updatedSong.songId,
      });
    }

    if (req.method === 'DELETE') {
      // Get the song first
      const existingSong = await getSongById(id);
      
      if (!existingSong) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Check if user owns the song OR is admin
      const isOwner = existingSong.userId === authResult.userId;
      
      if (!isOwner && !authResult.isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to delete this song' });
      }

      // Delete the song (use the song's userId for DynamoDB key)
      await deleteSong(existingSong.userId, id);
      return res.status(200).json({ success: true, message: 'Song deleted' });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle authentication errors (JWT validation, missing auth, etc.)
    if (error.message?.includes('authorization') || 
        error.message?.includes('token') || 
        error.message?.includes('jwt') ||
        error.message?.includes('No authorization') ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized', message: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
