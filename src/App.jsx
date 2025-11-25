import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SongList from './components/SongList';
import SongEditor from './components/SongEditor';
import SongViewer from './components/SongViewer';
import Transposer from './components/Transposer';
import { transposeSong } from './services/transposer';
import { getAllSongs, getSong, createSong, updateSong, deleteSong } from './services/storage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/songs" replace />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/song/new" element={<NewSongPage />} />
          <Route path="/song/edit/:id" element={<EditSongPage />} />
          <Route path="/song/view/:id" element={<ViewSongPage />} />
          <Route path="*" element={<Navigate to="/songs" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Songs Page - Browse and manage songs
 */
function SongsPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSongs = await getAllSongs();
      setSongs(fetchedSongs);
    } catch (err) {
      setError('Failed to load songs. Please try again.');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSong = (song) => {
    navigate(`/song/view/${song.id}`);
  };

  const handleNewSong = () => {
    navigate('/song/new');
  };

  const handleDeleteSong = async (song) => {
    try {
      await deleteSong(song.id);
      // Reload songs after deletion
      await loadSongs();
    } catch (err) {
      setError('Failed to delete song. Please try again.');
      console.error('Error deleting song:', err);
    }
  };

  if (loading) {
    return (
      <div className="songs-page">
        <header className="app-header">
          <h1 onClick={() => navigate('/')}>Open Chords</h1>
        </header>
        <div className="loading">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="songs-page">
        <header className="app-header">
          <h1 onClick={() => navigate('/')}>Open Chords</h1>
        </header>
        <div className="error">{error}</div>
        <button onClick={loadSongs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="songs-page">
      <header className="app-header">
        <h1>Open Chords</h1>
      </header>
      <SongList
        songs={songs}
        onSelectSong={handleSelectSong}
        onNewSong={handleNewSong}
        onDeleteSong={handleDeleteSong}
      />
    </div>
  );
}

/**
 * New Song Page - Create a new song
 */
function NewSongPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      <header className="app-header">
        <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
      </header>
      <SongEditor onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

/**
 * Edit Song Page - Edit an existing song
 */
function EditSongPage() {
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSong();
  }, []);

  const loadSong = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get song ID from URL
      const id = window.location.pathname.split('/').pop();
      const fetchedSong = await getSong(id);
      setSong(fetchedSong);
    } catch (err) {
      setError('Failed to load song. Please try again.');
      console.error('Error loading song:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (songData) => {
    try {
      setSaving(true);
      setError(null);
      await updateSong(songData);
      navigate(`/song/view/${songData.id}`);
    } catch (err) {
      setError('Failed to save song. Please try again.');
      console.error('Error saving song:', err);
      setSaving(false);
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
    return <div className="loading">Loading...</div>;
  }

  if (!song) {
    return (
      <div className="error">
        <p>Song not found</p>
        <button onClick={() => navigate('/songs')}>Back to Library</button>
      </div>
    );
  }

  return (
    <div className="edit-song-page">
      <header className="app-header">
        <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
      </header>
      <SongEditor song={song} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

/**
 * View Song Page - View and transpose a song
 */
function ViewSongPage() {
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [transposedContent, setTransposedContent] = useState('');
  const [currentTranspose, setCurrentTranspose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSong();
  }, []);

  const loadSong = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get song ID from URL
      const id = window.location.pathname.split('/').pop();
      const fetchedSong = await getSong(id);
      if (fetchedSong) {
        setSong(fetchedSong);
        setTransposedContent(fetchedSong.content);
      }
    } catch (err) {
      setError('Failed to load song. Please try again.');
      console.error('Error loading song:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (song) {
      const transposed = transposeSong(song.content, currentTranspose, song.key);
      setTransposedContent(transposed);
    }
  }, [currentTranspose, song]);

  const handleTranspose = (semitones) => {
    setCurrentTranspose(semitones);
  };

  const handleEdit = () => {
    navigate(`/song/edit/${song.id}`);
  };

  const handleBack = () => {
    navigate('/songs');
  };

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentTranspose(prev => prev + 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentTranspose(prev => prev - 1);
      } else if (e.key === '0') {
        e.preventDefault();
        setCurrentTranspose(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !song) {
    return (
      <div className="view-song-page">
        <header className="app-header">
          <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
        </header>
        <div className="error">
          <p>{error || 'Song not found'}</p>
          <button onClick={() => navigate('/songs')}>Back to Library</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-song-page">
      <header className="app-header">
        <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
        <div className="header-actions">
          <button onClick={handleEdit} className="btn-edit">
            Edit
          </button>
          <button onClick={handleBack} className="btn-back">
            Back to Library
          </button>
        </div>
      </header>

      <div className="view-song-container">
        <Transposer
          originalKey={song.key}
          currentTranspose={currentTranspose}
          onTranspose={handleTranspose}
        />
        <SongViewer
          songText={transposedContent}
          title={song.title}
          artist={song.artist}
        />
      </div>
    </div>
  );
}

export default App;
