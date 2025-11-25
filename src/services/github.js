import { Octokit } from '@octokit/rest';

/**
 * GitHub service for storing and retrieving songs
 * Requires GitHub personal access token with repo scope
 */

class GitHubService {
  constructor() {
    this.octokit = null;
    this.owner = null;
    this.repo = null;
    this.authenticated = false;
  }

  /**
   * Initialize GitHub client with token
   * @param {string} token - GitHub personal access token
   * @param {string} owner - Repository owner (username)
   * @param {string} repo - Repository name
   */
  async init(token, owner, repo) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;

    // Verify authentication
    try {
      await this.octokit.users.getAuthenticated();
      this.authenticated = true;
      return true;
    } catch (error) {
      console.error('GitHub authentication failed:', error);
      this.authenticated = false;
      return false;
    }
  }

  /**
   * Check if service is authenticated
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * List all songs in the repository
   * @returns {Array<Object>} - Array of song metadata
   */
  async listSongs() {
    if (!this.authenticated) throw new Error('Not authenticated');

    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'songs',
      });

      const songs = [];

      // Recursively get all song files
      for (const item of data) {
        if (item.type === 'dir') {
          const artistSongs = await this.getSongsInDirectory(item.path);
          songs.push(...artistSongs);
        } else if (item.name.endsWith('.txt')) {
          const songData = await this.getSongMetadata(item.path);
          if (songData) songs.push(songData);
        }
      }

      return songs;
    } catch (error) {
      if (error.status === 404) {
        // songs directory doesn't exist yet
        return [];
      }
      throw error;
    }
  }

  /**
   * Get songs in a directory
   */
  async getSongsInDirectory(path) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      const songs = [];

      for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.txt')) {
          const songData = await this.getSongMetadata(item.path);
          if (songData) songs.push(songData);
        }
      }

      return songs;
    } catch (error) {
      console.error(`Error getting songs in ${path}:`, error);
      return [];
    }
  }

  /**
   * Get song metadata from file path
   */
  async getSongMetadata(path) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      const content = Buffer.from(data.content, 'base64').toString('utf-8');

      // Parse metadata from content
      const titleMatch = content.match(/^Title:\s*(.+)$/m);
      const artistMatch = content.match(/^Artist:\s*(.+)$/m);
      const keyMatch = content.match(/^Key:\s*([A-G][#b]?m?)$/m);

      return {
        path,
        title: titleMatch ? titleMatch[1].trim() : path.split('/').pop().replace('.txt', ''),
        artist: artistMatch ? artistMatch[1].trim() : path.split('/')[1] || 'Unknown',
        key: keyMatch ? keyMatch[1].trim() : null,
        sha: data.sha,
      };
    } catch (error) {
      console.error(`Error getting metadata for ${path}:`, error);
      return null;
    }
  }

  /**
   * Get full song content
   * @param {string} path - File path in repository
   * @returns {Object} - Song data
   */
  async getSong(path) {
    if (!this.authenticated) throw new Error('Not authenticated');

    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    // Parse metadata
    const titleMatch = content.match(/^Title:\s*(.+)$/m);
    const artistMatch = content.match(/^Artist:\s*(.+)$/m);
    const keyMatch = content.match(/^Key:\s*([A-G][#b]?m?)$/m);
    const typeMatch = content.match(/^Type:\s*(chords|tabs)$/m);

    // Remove metadata lines from content
    const songContent = content
      .replace(/^Title:.*$/m, '')
      .replace(/^Artist:.*$/m, '')
      .replace(/^Key:.*$/m, '')
      .replace(/^Type:.*$/m, '')
      .replace(/^\n+/, '');

    return {
      path,
      title: titleMatch ? titleMatch[1].trim() : 'Untitled',
      artist: artistMatch ? artistMatch[1].trim() : 'Unknown',
      key: keyMatch ? keyMatch[1].trim() : 'C',
      type: typeMatch ? typeMatch[1] : 'chords',
      content: songContent,
      sha: data.sha,
    };
  }

  /**
   * Save a song to the repository
   * @param {Object} song - Song data
   * @returns {Object} - Updated song data with path and sha
   */
  async saveSong(song) {
    if (!this.authenticated) throw new Error('Not authenticated');

    // Create file path: songs/artist-slug/song-slug.txt
    const artistSlug = this.slugify(song.artist);
    const songSlug = this.slugify(song.title);
    const path = `songs/${artistSlug}/${songSlug}.txt`;

    // Prepare content with metadata
    const content = `Title: ${song.title}
Artist: ${song.artist}
Key: ${song.key}
Type: ${song.type}

${song.content}`;

    try {
      // Check if file exists
      let sha = null;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
        });
        sha = data.sha;
      } catch (error) {
        // File doesn't exist, that's fine
      }

      // Create or update file
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: sha
          ? `Update ${song.title} by ${song.artist}`
          : `Add ${song.title} by ${song.artist}`,
        content: Buffer.from(content).toString('base64'),
        sha,
      });

      return {
        ...song,
        path,
        sha: data.content.sha,
      };
    } catch (error) {
      console.error('Error saving song:', error);
      throw error;
    }
  }

  /**
   * Delete a song from the repository
   * @param {string} path - File path
   * @param {string} sha - File SHA
   */
  async deleteSong(path, sha) {
    if (!this.authenticated) throw new Error('Not authenticated');

    await this.octokit.repos.deleteFile({
      owner: this.owner,
      repo: this.repo,
      path,
      message: `Delete ${path}`,
      sha,
    });
  }

  /**
   * Convert string to URL-friendly slug
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new GitHubService();
