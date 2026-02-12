import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongEditor from '../../components/song/SongEditor';
import LoginModal from '../../components/auth/LoginModal';
import { getSong, updateSong } from '../../services/storage';
import type { Song } from '../../types/song';

/**
 * Edit Song Page - Edit an existing song (PUBLIC - allows anonymous)
 */
export default function EditSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    loadSong();
  }, []);

  const loadSong = async () => {
    try {
      setLoading(true);
      setError(null);
      const id = window.location.pathname.split('/').pop();
      const fetchedSong = await getSong(id ?? '');
      setSong(fetchedSong);
    } catch (err) {
      setError('Failed to load song. Please try again.');
      console.error('Error loading song:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (songData: Song) => {
    try {
      setError(null);
      await updateSong(songData);
      navigate(`/song/view/${songData.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save song. Please try again.';
      setError(errorMessage);
      console.error('Error saving song:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    if (song) {
      navigate(`/song/view/${song.id}`);
    } else {
      navigate('/songs');
    }
  };

  if (loading) {
    return (
      <div className="edit-song-page">
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="edit-song-page">
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="error">
            <p>Song not found</p>
            <button onClick={() => navigate('/songs')}>Back to Library</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-song-page">
      <UnifiedNavBar mode="normal" />
      <div className="page-content">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}
        <div className="user-status">
          {isAuthenticated ? (
            <span className="logged-in-as">
              Editing as: <strong>{user?.email}</strong>
            </span>
          ) : (
            <span className="anonymous-user">
              Editing as: <strong>Anonymous</strong>
              {' · '}
              <button onClick={() => setShowLoginModal(true)} className="inline-login-btn">
                Sign in to claim
              </button>
            </span>
          )}
        </div>
        <SongEditor song={song} onSave={handleSave} onCancel={handleCancel} />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
}
