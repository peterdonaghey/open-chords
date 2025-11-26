import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SongList from './components/SongList';
import SongEditor from './components/SongEditor';
import SongViewer from './components/SongViewer';
import Toolbar from './components/Toolbar';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import VerifyEmailForm from './components/Auth/VerifyEmailForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import LoginModal from './components/Auth/LoginModal';
import { transposeSong } from './services/transposer';
import { useAutoScroll } from './hooks/useAutoScroll';
import { getAllSongs, getSong, createSong, updateSong, deleteSong } from './services/storage';
import './App.css';

/**
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public routes - main app is public! */}
            <Route path="/" element={<Navigate to="/songs" replace />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/song/view/:id" element={<ViewSongPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/verify-email" element={<VerifyEmailForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />

            {/* Song creation/editing - now public with inline login option */}
            <Route path="/song/new" element={<NewSongPage />} />
            <Route path="/song/edit/:id" element={<EditSongPage />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/songs" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

/**
 * Songs Page - Browse and manage songs (PUBLIC)
 */
function SongsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
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
    // Require auth to create songs
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/song/new' } } });
      return;
    }
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
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
        <div className="header-user-info">
          {isAuthenticated ? (
            <>
              <span className="user-email">{user?.email}</span>
              <button onClick={handleSignOut} className="btn-signout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-signin">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')} className="btn-signup">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>
      <SongList
        songs={songs}
        onSelectSong={handleSelectSong}
        onNewSong={handleNewSong}
        onDeleteSong={handleDeleteSong}
        currentUserId={user?.userId}
      />
    </div>
  );
}

/**
 * New Song Page - Create a new song (PUBLIC - allows anonymous)
 */
function NewSongPage() {
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
      <header className="app-header">
        <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
      </header>
      <SongEditor onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

/**
 * Edit Song Page - Edit an existing song (PUBLIC - allows anonymous)
 */
function EditSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      </header>
      <SongEditor song={song} onSave={handleSave} onCancel={handleCancel} />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
        }}
      />
    </div>
  );
}

/**
 * View Song Page - View and transpose a song (PUBLIC)
 */
function ViewSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [song, setSong] = useState(null);
  const [transposedContent, setTransposedContent] = useState('');
  const [currentTranspose, setCurrentTranspose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(3);
  const [isDoubleColumn, setIsDoubleColumn] = useState(false);
  
  const { isScrolling, toggle: toggleAutoScroll } = useAutoScroll(true, autoScrollSpeed);

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
    // Require auth to edit songs
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/song/edit/${song.id}` } } });
      return;
    }
    // Check if user owns this song
    if (song.userId && user?.userId !== song.userId) {
      alert('You can only edit your own songs');
      return;
    }
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
        const newTranspose = currentTranspose + 1;
        setCurrentTranspose(newTranspose >= 12 ? newTranspose - 12 : newTranspose);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newTranspose = currentTranspose - 1;
        setCurrentTranspose(newTranspose <= -12 ? newTranspose + 12 : newTranspose);
      } else if (e.key === '0') {
        e.preventDefault();
        setCurrentTranspose(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTranspose]);

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

      <Toolbar
        transpose={currentTranspose}
        onTranspose={handleTranspose}
        isAutoScrolling={isScrolling}
        onAutoScrollToggle={toggleAutoScroll}
        autoScrollSpeed={autoScrollSpeed}
        onAutoScrollSpeedChange={setAutoScrollSpeed}
        isDoubleColumn={isDoubleColumn}
        onDoubleColumnToggle={() => setIsDoubleColumn(prev => !prev)}
      />

      <div className={`view-song-container ${isDoubleColumn ? 'compact-mode' : ''}`}>
        <SongViewer
          songText={transposedContent}
          title={song.title}
          artist={song.artist}
          isDoubleColumn={isDoubleColumn}
        />
      </div>
    </div>
  );
}

export default App;
