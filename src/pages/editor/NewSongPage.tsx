import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongEditor from '../../components/song/SongEditor';
import { createSong } from '../../services/storage';
import type { Song } from '../../types/song';

/**
 * New Song Page - Create a new song (PUBLIC - allows anonymous)
 */
export default function NewSongPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (songData: Song) => {
    try {
      setError(null);
      await createSong(songData);
      navigate(`/song/view/${songData.id}`);
    } catch (err) {
      setError('Failed to save song. Please try again.');
      console.error('Error saving song:', err);
    }
  };

  const handleCancel = () => {
    navigate('/songs');
  };

  return (
    <div className="new-song-page">
      <UnifiedNavBar mode="normal" />
      <div className="page-content">
        {error && <div className="error">{error}</div>}
        <SongEditor onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
