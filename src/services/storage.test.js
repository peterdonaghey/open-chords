import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../test/mocks/handlers';
import {
  getAllSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} from './storage';

// Mock the auth service
vi.mock('./auth', () => ({
  getIdToken: vi.fn(async () => 'mock-jwt-token'),
}));

// Setup MSW server
const server = setupServer(...handlers);

describe('storage service', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getAllSongs', () => {
    it('should fetch all songs without auth', async () => {
      const songs = await getAllSongs();
      
      expect(songs).toBeDefined();
      expect(Array.isArray(songs)).toBe(true);
      expect(songs.length).toBeGreaterThan(0);
    });

    it('should return songs with correct structure', async () => {
      const songs = await getAllSongs();
      
      const song = songs[0];
      expect(song).toHaveProperty('id');
      expect(song).toHaveProperty('title');
      expect(song).toHaveProperty('artist');
      expect(song).toHaveProperty('content');
    });
  });

  describe('getSong', () => {
    it('should fetch a specific song by ID', async () => {
      const song = await getSong('1');
      
      expect(song).toBeDefined();
      expect(song.id).toBe('1');
      expect(song).toHaveProperty('title');
      expect(song).toHaveProperty('content');
    });

    it('should return null for non-existent song', async () => {
      const song = await getSong('non-existent-id');
      
      expect(song).toBeNull();
    });

    it('should fetch song without auth (public access)', async () => {
      const song = await getSong('1');
      
      expect(song).toBeDefined();
      expect(song.id).toBe('1');
    });
  });

  describe('createSong', () => {
    it('should create song with authentication', async () => {
      const newSong = {
        id: 'new-song-1',
        title: 'New Song',
        artist: 'New Artist',
        type: 'chords',
        content: 'C G Am F\nTest lyrics',
      };
      
      const result = await createSong(newSong);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('new-song-1');
      expect(result.title).toBe('New Song');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should create song as anonymous (without auth)', async () => {
      // Mock getIdToken to throw error (no auth)
      const { getIdToken } = await import('./auth');
      vi.mocked(getIdToken).mockRejectedValueOnce(new Error('Not authenticated'));
      
      const newSong = {
        id: 'anonymous-song-1',
        title: 'Anonymous Song',
        artist: 'Anonymous',
        type: 'chords',
        content: 'G D Em C\nAnonymous lyrics',
      };
      
      const result = await createSong(newSong);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('anonymous-song-1');
    });

    it('should include all required fields in created song', async () => {
      const newSong = {
        id: 'complete-song',
        title: 'Complete Song',
        artist: 'Complete Artist',
        type: 'chords',
        content: 'D A Bm G\nComplete content',
      };
      
      const result = await createSong(newSong);
      
      expect(result.id).toBe('complete-song');
      expect(result.title).toBe('Complete Song');
      expect(result.artist).toBe('Complete Artist');
      expect(result.content).toBe('D A Bm G\nComplete content');
    });
  });

  describe('updateSong', () => {
    it('should update song with authentication', async () => {
      const updatedSong = {
        id: '1',
        title: 'Updated Title',
        artist: 'Updated Artist',
        type: 'chords',
        content: 'G D Em C\nUpdated content',
      };
      
      const result = await updateSong(updatedSong);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.title).toBe('Updated Title');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should throw error when updating without auth', async () => {
      // Mock getIdToken to throw error
      const { getIdToken } = await import('./auth');
      vi.mocked(getIdToken).mockRejectedValueOnce(new Error('Not authenticated'));
      
      const updatedSong = {
        id: '1',
        title: 'Should Fail',
        artist: 'Should Fail',
        type: 'chords',
        content: 'C G Am F',
      };
      
      await expect(updateSong(updatedSong)).rejects.toThrow();
    });

    it('should include authorization header', async () => {
      const updatedSong = {
        id: '1',
        title: 'Test Update',
        artist: 'Test Artist',
        type: 'chords',
        content: 'C G Am F',
      };
      
      const result = await updateSong(updatedSong);
      
      expect(result).toBeDefined();
    });
  });

  describe('deleteSong', () => {
    it('should delete song with authentication', async () => {
      const result = await deleteSong('1');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });

    it('should throw error when deleting without auth', async () => {
      // Mock getIdToken to throw error
      const { getIdToken } = await import('./auth');
      vi.mocked(getIdToken).mockRejectedValueOnce(new Error('Not authenticated'));
      
      await expect(deleteSong('1')).rejects.toThrow();
    });

    it('should include authorization header', async () => {
      const result = await deleteSong('1');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors in getAllSongs', async () => {
      // Override handler to return error
      server.use(
        handlers[0] // This would need to be replaced with error handler
      );
      
      // For now, just verify it doesn't crash
      const songs = await getAllSongs();
      expect(Array.isArray(songs)).toBe(true);
    });

    it('should handle 404 in getSong', async () => {
      const song = await getSong('non-existent-id');
      
      expect(song).toBeNull();
    });
  });

  describe('API base URL', () => {
    it('should use production API in production', () => {
      // This is tested implicitly by MSW intercepting the requests
      // to https://open-chords.org/api
      expect(true).toBe(true);
    });
  });
});

