// API endpoint: GET /api/songs - List all songs
// API endpoint: POST /api/songs - Create a new song
const { listSongs, saveSong } = require('./_s3.js');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // List all songs
      const songs = await listSongs();
      return res.status(200).json(songs);
    }

    if (req.method === 'POST') {
      // Create a new song
      const song = req.body;

      // Validate required fields
      if (!song.id || !song.title || !song.content) {
        return res.status(400).json({ error: 'Missing required fields: id, title, content' });
      }

      const savedSong = await saveSong(song);
      return res.status(201).json(savedSong);
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
