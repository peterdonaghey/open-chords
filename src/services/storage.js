/**
 * Storage Service - Handles song persistence via API
 * This abstracts the storage backend (S3 via Vercel API routes)
 */

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5173/api';

/**
 * Get all songs
 */
export async function getAllSongs() {
  try {
    const response = await fetch(`${API_BASE}/songs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    // Fallback to localStorage for development
    if (import.meta.env.DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      return savedSongs ? JSON.parse(savedSongs) : [];
    }
    throw error;
  }
}

/**
 * Get a specific song by ID
 */
export async function getSong(id) {
  try {
    const response = await fetch(`${API_BASE}/songs/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching song:', error);
    // Fallback to localStorage for development
    if (import.meta.env.DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      if (savedSongs) {
        const songs = JSON.parse(savedSongs);
        return songs.find(s => s.id === id) || null;
      }
    }
    throw error;
  }
}

/**
 * Create a new song
 */
export async function createSong(song) {
  try {
    const response = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });
    if (!response.ok) {
      throw new Error(`Failed to create song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating song:', error);
    // Fallback to localStorage for development
    if (import.meta.env.DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      songs.push(song);
      localStorage.setItem('open-chords-songs', JSON.stringify(songs));
      return song;
    }
    throw error;
  }
}

/**
 * Update an existing song
 */
export async function updateSong(song) {
  try {
    const response = await fetch(`${API_BASE}/songs/${song.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });
    if (!response.ok) {
      throw new Error(`Failed to update song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating song:', error);
    // Fallback to localStorage for development
    if (import.meta.env.DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      const index = songs.findIndex(s => s.id === song.id);
      if (index !== -1) {
        songs[index] = song;
        localStorage.setItem('open-chords-songs', JSON.stringify(songs));
      }
      return song;
    }
    throw error;
  }
}

/**
 * Delete a song
 */
export async function deleteSong(id) {
  try {
    const response = await fetch(`${API_BASE}/songs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting song:', error);
    // Fallback to localStorage for development
    if (import.meta.env.DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      const filtered = songs.filter(s => s.id !== id);
      localStorage.setItem('open-chords-songs', JSON.stringify(filtered));
      return { success: true };
    }
    throw error;
  }
}
