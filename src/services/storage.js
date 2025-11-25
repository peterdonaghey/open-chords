/**
 * Storage Service - Handles song persistence via API
 * This abstracts the storage backend (DynamoDB via Vercel API routes in production, S3 in dev)
 */

import { getIdToken } from './auth';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5173/api';
const IS_DEV = import.meta.env.DEV;

/**
 * Get authorization headers with JWT token
 */
async function getAuthHeaders() {
  try {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Handle API response errors
 */
function handleResponse(response) {
  if (response.status === 401) {
    // Redirect to login on unauthorized
    window.location.href = '/login';
    throw new Error('Unauthorized - please sign in');
  }
  return response;
}

/**
 * Get all songs (PUBLIC - no auth required)
 */
export async function getAllSongs() {
  try {
    // In development, use localStorage fallback since API routes don't work in Vite dev server
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      return savedSongs ? JSON.parse(savedSongs) : [];
    }
    
    const response = await fetch(`${API_BASE}/songs`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    // Fallback to localStorage
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      return savedSongs ? JSON.parse(savedSongs) : [];
    }
    throw error;
  }
}

/**
 * Get a specific song by ID (PUBLIC - no auth required)
 */
export async function getSong(id) {
  try {
    // In development, use localStorage fallback
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      if (savedSongs) {
        const songs = JSON.parse(savedSongs);
        return songs.find(s => s.id === id) || null;
      }
      return null;
    }
    
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
    // Fallback to localStorage
    if (IS_DEV) {
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
    // In development, use localStorage
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      songs.push(song);
      localStorage.setItem('open-chords-songs', JSON.stringify(songs));
      return song;
    }
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(song),
    });
    handleResponse(response);
    
    if (!response.ok) {
      throw new Error(`Failed to create song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating song:', error);
    // Fallback to localStorage
    if (IS_DEV) {
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
    // In development, use localStorage
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      const index = songs.findIndex(s => s.id === song.id);
      if (index !== -1) {
        songs[index] = song;
        localStorage.setItem('open-chords-songs', JSON.stringify(songs));
      }
      return song;
    }
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/songs/${song.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(song),
    });
    handleResponse(response);
    
    if (!response.ok) {
      throw new Error(`Failed to update song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating song:', error);
    // Fallback to localStorage
    if (IS_DEV) {
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
    // In development, use localStorage
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      const filtered = songs.filter(s => s.id !== id);
      localStorage.setItem('open-chords-songs', JSON.stringify(songs));
      return { success: true };
    }
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/songs/${id}`, {
      method: 'DELETE',
      headers,
    });
    handleResponse(response);
    
    if (!response.ok) {
      throw new Error(`Failed to delete song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting song:', error);
    // Fallback to localStorage
    if (IS_DEV) {
      const savedSongs = localStorage.getItem('open-chords-songs');
      const songs = savedSongs ? JSON.parse(savedSongs) : [];
      const filtered = songs.filter(s => s.id !== id);
      localStorage.setItem('open-chords-songs', JSON.stringify(filtered));
      return { success: true };
    }
    throw error;
  }
}
