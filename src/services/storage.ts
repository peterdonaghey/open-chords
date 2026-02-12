/**
 * Storage Service - Handles song persistence via API
 * Always uses production DynamoDB - no localStorage, single source of truth
 */

import { getIdToken } from './auth';
import type { Song } from '../types/song';

const API_BASE = import.meta.env.DEV ? 'https://open-chords.org/api' : '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Authentication required');
  }
}

function handleResponse(response: Response): Response {
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized - please sign in');
  }
  return response;
}

export async function getAllSongs(): Promise<Song[]> {
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

export async function getSong(id: string): Promise<Song | null> {
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

export async function createSong(song: Song): Promise<Song> {
  try {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = await getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
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

export async function updateSong(song: Song): Promise<Song> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/songs/${song.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(song),
    });

    handleResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      const errorMsg = errorData.error || errorData.message || response.statusText;
      throw new Error(`Failed to update song: ${errorMsg} (Status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
}

export async function deleteSong(id: string): Promise<Song> {
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
