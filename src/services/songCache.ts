/**
 * IndexedDB cache for offline song access
 * Caches songs when online, serves from cache when offline
 */

import type { Song } from '../types/song';

const DB_NAME = 'open-chords-cache';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';
const STORE_META = 'meta';
const META_LIST = 'songsList';
const META_TIMESTAMP = 'listTimestamp';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };
  });
}

export async function saveSongsList(songs: Song[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SONGS, STORE_META], 'readwrite');
    const songsStore = tx.objectStore(STORE_SONGS);
    const metaStore = tx.objectStore(STORE_META);

    songs.forEach((song) => songsStore.put(song));
    metaStore.put(songs, META_LIST);
    metaStore.put(new Date().toISOString(), META_TIMESTAMP);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getSongsListFromCache(): Promise<Song[] | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const request = tx.objectStore(STORE_META).get(META_LIST);
    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function saveSong(song: Song): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    tx.objectStore(STORE_SONGS).put(song);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getSongFromCache(id: string): Promise<Song | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const request = tx.objectStore(STORE_SONGS).get(id);
    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export function getCacheTimestamp(): Promise<string | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const request = tx.objectStore(STORE_META).get(META_TIMESTAMP);
        request.onsuccess = () => {
          db.close();
          resolve(request.result ?? null);
        };
        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      })
  );
}
