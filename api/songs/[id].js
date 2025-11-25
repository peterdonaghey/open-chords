// API endpoint: GET /api/songs/[id] - Get a specific song
// API endpoint: PUT /api/songs/[id] - Update a song
// API endpoint: DELETE /api/songs/[id] - Delete a song
import { getSong, saveSong, deleteSong } from '../_s3.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Song ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get a specific song
      const song = await getSong(id);

      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }

      return res.status(200).json(song);
    }

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

      const savedSong = await saveSong(song);
      return res.status(200).json(savedSong);
    }

    if (req.method === 'DELETE') {
      // Delete a song
      await deleteSong(id);
      return res.status(200).json({ success: true, message: 'Song deleted' });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
