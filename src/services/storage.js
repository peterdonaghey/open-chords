/**
 * Storage Service - Handles song persistence via API
 * Always uses production DynamoDB - no localStorage, single source of truth
 */

import { getIdToken } from './auth';

// Always use production API - even in local dev, we hit the live database
const API_BASE = import.meta.env.PROD ? '/api' : 'https://open-chords.org/api';

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
    const response = await fetch(`${API_BASE}/songs`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
}

/**
 * Get a specific song by ID (PUBLIC - no auth required)
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
    throw error;
  }
}

/**
 * Create a new song (AUTH OPTIONAL - can create anonymously)
 */
export async function createSong(song) {
  try {
    // Try to get auth headers, but don't fail if user not logged in
    let headers = { 'Content-Type': 'application/json' };
    try {
      const token = await getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      // No auth token - will create as anonymous
      console.log('Creating song anonymously (not logged in)');
    }
    
    const response = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(song),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create song: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating song:', error);
    throw error;
  }
}

/**
 * Update an existing song (AUTH REQUIRED)
 */
export async function updateSong(song) {
  try {
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
    throw error;
  }
}

/**
 * Delete a song (AUTH REQUIRED)
 */
export async function deleteSong(id) {
  try {
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
    throw error;
  }
}
