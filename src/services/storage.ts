/**
 * Storage Service - Handles song persistence via API
 * Caches to IndexedDB when online, serves from cache when offline
 * Auto-syncs when connection restored
 */

import { getIdToken } from './auth';
import {
  saveSongsList,
  getSongsListFromCache,
  saveSong as cacheSong,
  getSongFromCache,
} from './songCache';
import type { Song } from '../types/song';

const API_BASE = import.meta.env.DEV ? 'https://open-chords.org/api' : '/api';

/** Custom event dispatched when songs are synced from API (e.g. after coming back online) */
export const SONGS_SYNCED_EVENT = 'open-chords:songs-synced';

function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

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

/** Sync songs from API to cache and dispatch SONGS_SYNCED_EVENT for UI refresh */
export async function syncSongs(): Promise<Song[]> {
  const response = await fetch(`${API_BASE}/songs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch songs: ${response.statusText}`);
  }
  const songs = await response.json();
  try {
    await saveSongsList(songs);
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SONGS_SYNCED_EVENT));
  }
  return songs;
}

function initOnlineSync(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', () => {
    syncSongs().catch((err) => console.error('Auto-sync failed:', err));
  });
}
initOnlineSync();

export async function getAllSongs(): Promise<Song[]> {
  if (isOnline()) {
    try {
      const response = await fetch(`${API_BASE}/songs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.statusText}`);
      }
      const songs = await response.json();
      try {
        await saveSongsList(songs);
      } catch (e) {
        console.warn('Cache save failed:', e);
      }
      return songs;
    } catch (error) {
      try {
        const cached = await getSongsListFromCache();
        if (cached && cached.length > 0) return cached;
      } catch {
        /* cache read failed */
      }
      console.error('Error fetching songs:', error);
      throw error;
    }
  }

  try {
    const cached = await getSongsListFromCache();
    if (!cached || cached.length === 0) {
      throw new Error('Offline: no cached songs. Connect to the internet to load songs.');
    }
    return cached;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Offline:')) throw e;
    throw new Error('Offline: no cached songs. Connect to the internet to load songs.');
  }
}

export async function getSong(id: string): Promise<Song | null> {
  if (isOnline()) {
    try {
      const response = await fetch(`${API_BASE}/songs/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch song: ${response.statusText}`);
      }
      const song = await response.json();
      try {
        await cacheSong(song);
      } catch (e) {
        console.warn('Cache save failed:', e);
      }
      return song;
    } catch (error) {
      try {
        const cached = await getSongFromCache(id);
        if (cached) return cached;
      } catch {
        /* cache read failed */
      }
      console.error('Error fetching song:', error);
      throw error;
    }
  }

  try {
    const cached = await getSongFromCache(id);
    if (!cached) {
      throw new Error(`Offline: song not in cache. Connect to the internet to load it.`);
    }
    return cached;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Offline:')) throw e;
    throw new Error(`Offline: song not in cache. Connect to the internet to load it.`);
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
