import { Octokit } from '@octokit/rest';
import type { Song } from '../types/song';

interface GitHubFile {
  type: string;
  name: string;
  path: string;
  content?: string;
  sha?: string;
}

interface GitHubDirItem extends GitHubFile {
  type: 'dir';
}

interface GitHubFileItem extends GitHubFile {
  type: 'file';
  content: string;
  sha: string;
}

/**
 * GitHub service for storing and retrieving songs
 */
class GitHubService {
  private octokit: Octokit | null = null;
  private owner: string | null = null;
  private repo: string | null = null;
  private authenticated = false;

  async init(token: string, owner: string, repo: string): Promise<boolean> {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;

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

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  async listSongs(): Promise<Array<{ path: string; title: string; artist: string; sha?: string }>> {
    if (!this.authenticated || !this.octokit || !this.owner || !this.repo) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'songs',
      });

      const songs: Array<{ path: string; title: string; artist: string; sha?: string }> = [];
      const items = Array.isArray(data) ? data : [data];

      for (const item of items as GitHubDirItem[]) {
        if (item.type === 'dir') {
          const artistSongs = await this.getSongsInDirectory(item.path);
          songs.push(...artistSongs);
        } else if (item.name.endsWith('.txt')) {
          const songData = await this.getSongMetadata(item.path);
          if (songData) songs.push(songData);
        }
      }

      return songs;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  private async getSongsInDirectory(
    dirPath: string
  ): Promise<Array<{ path: string; title: string; artist: string; sha?: string }>> {
    if (!this.octokit || !this.owner || !this.repo) return [];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: dirPath,
      });

      const songs: Array<{ path: string; title: string; artist: string; sha?: string }> = [];
      const items = Array.isArray(data) ? data : [data];

      for (const item of items as GitHubFileItem[]) {
        if (item.type === 'file' && item.name.endsWith('.txt')) {
          const songData = await this.getSongMetadata(item.path);
          if (songData) songs.push(songData);
        }
      }

      return songs;
    } catch (error) {
      console.error(`Error getting songs in ${dirPath}:`, error);
      return [];
    }
  }

  private async getSongMetadata(
    path: string
  ): Promise<{ path: string; title: string; artist: string; sha?: string } | null> {
    if (!this.octokit || !this.owner || !this.repo) return null;

    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      const fileData = data as GitHubFileItem;
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const titleMatch = content.match(/^Title:\s*(.+)$/m);
      const artistMatch = content.match(/^Artist:\s*(.+)$/m);

      return {
        path,
        title: titleMatch ? titleMatch[1].trim() : path.split('/').pop()?.replace('.txt', '') ?? '',
        artist: artistMatch ? artistMatch[1].trim() : path.split('/')[1] ?? 'Unknown',
        sha: fileData.sha,
      };
    } catch (error) {
      console.error(`Error getting metadata for ${path}:`, error);
      return null;
    }
  }

  async getSong(path: string): Promise<Partial<Song> & { path: string; sha?: string }> {
    if (!this.authenticated || !this.octokit || !this.owner || !this.repo) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
    });

    const fileData = data as GitHubFileItem;
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const titleMatch = content.match(/^Title:\s*(.+)$/m);
    const artistMatch = content.match(/^Artist:\s*(.+)$/m);
    const typeMatch = content.match(/^Type:\s*(chords|tabs)$/m);

    const songContent = content
      .replace(/^Title:.*$/m, '')
      .replace(/^Artist:.*$/m, '')
      .replace(/^Type:.*$/m, '')
      .replace(/^\n+/, '');

    return {
      path,
      title: titleMatch ? titleMatch[1].trim() : 'Untitled',
      artist: artistMatch ? artistMatch[1].trim() : 'Unknown',
      type: (typeMatch ? typeMatch[1] : 'chords') as 'chords' | 'tabs',
      content: songContent,
      sha: fileData.sha,
    };
  }

  async saveSong(song: Song): Promise<Song & { path: string; sha?: string }> {
    if (!this.authenticated || !this.octokit || !this.owner || !this.repo) {
      throw new Error('Not authenticated');
    }

    const artistSlug = this.slugify(song.artist);
    const songSlug = this.slugify(song.title);
    const path = `songs/${artistSlug}/${songSlug}.txt`;
    const content = `Title: ${song.title}
Artist: ${song.artist}
Type: ${song.type ?? 'chords'}

${song.content}`;

    try {
      let sha: string | null = null;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
        });
        sha = (data as GitHubFileItem).sha ?? null;
      } catch {
        // File doesn't exist
      }

      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: sha ? `Update ${song.title} by ${song.artist}` : `Add ${song.title} by ${song.artist}`,
        content: Buffer.from(content).toString('base64'),
        sha: sha ?? undefined,
      });

      return {
        ...song,
        path,
        sha: data.content?.sha,
      };
    } catch (error) {
      console.error('Error saving song:', error);
      throw error;
    }
  }

  async deleteSong(path: string, sha: string): Promise<void> {
    if (!this.authenticated || !this.octokit || !this.owner || !this.repo) {
      throw new Error('Not authenticated');
    }

    await this.octokit.repos.deleteFile({
      owner: this.owner,
      repo: this.repo,
      path,
      message: `Delete ${path}`,
      sha,
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default new GitHubService();
