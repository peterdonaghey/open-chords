import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongEditor from '../../components/song/SongEditor';
import { createSong } from '../../services/storage';

/**
 * New Song Page - Create a new song (PUBLIC - allows anonymous)
 */
export default function NewSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSave = async (songData) => {
    try {
      setSaving(true);
      setError(null);
      await createSong(songData);
      navigate(`/song/view/${songData.id}`);
    } catch (err) {
      setError('Failed to save song. Please try again.');
      console.error('Error saving song:', err);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/songs');
  };

  return (
    <div className="new-song-page">
      <UnifiedNavBar mode="normal" />
      <div className="page-content">
        <SongEditor onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
