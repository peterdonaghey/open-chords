import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongList from '../../components/song/SongList';
import { getAllSongs, deleteSong } from '../../services/storage';
import type { Song } from '../../types/song';

/**
 * My Songs Page - User's own songs (AUTH REQUIRED)
 */
export default function MySongsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadSongs();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSongs = await getAllSongs();
      const mySongs = fetchedSongs.filter(song =>
        song.ownerEmail === user?.email || song.userId === user?.userId
      );
      setSongs(mySongs);
    } catch (err) {
      setError('Failed to load songs. Please try again.');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSong = (song: Song) => {
    navigate(`/song/view/${song.id}`);
  };

  const handleNewSong = () => {
    navigate('/song/new');
  };

  const handleDeleteSong = async (song: Song) => {
    try {
      await deleteSong(song.id);
      await loadSongs();
    } catch (err) {
      setError('Failed to delete song. Please try again.');
      console.error('Error deleting song:', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="songs-page">
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="loading">Loading your songs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="songs-page">
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="error">{error}</div>
          <button onClick={loadSongs}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="songs-page">
      <UnifiedNavBar mode="normal" />
      <div className="page-content">
        <div className="page-title-bar">
          <h2>My Songs</h2>
          <button onClick={() => navigate('/songs')} className="btn-secondary">
            All Songs
          </button>
        </div>
        <SongList
          songs={songs}
          onSelectSong={handleSelectSong}
          onNewSong={handleNewSong}
          onDeleteSong={handleDeleteSong}
        />
      </div>
    </div>
  );
}
