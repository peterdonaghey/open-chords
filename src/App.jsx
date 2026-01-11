import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import SongList from './components/SongList';
import SongEditor from './components/SongEditor';
import SongViewer from './components/SongViewer';
import UnifiedNavBar from './components/UnifiedNavBar';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import VerifyEmailForm from './components/Auth/VerifyEmailForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import LoginModal from './components/Auth/LoginModal';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { transposeSong } from './services/transposer';
import { useAutoScroll } from './hooks/useAutoScroll';
import { getAllSongs, getSong, createSong, updateSong, deleteSong } from './services/storage';
import './App.css';

/**
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/songs" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <Routes>
              {/* Public routes - main app is public! */}
              <Route path="/" element={<Navigate to="/songs" replace />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/my-songs" element={<MySongsPage />} />
              <Route path="/song/view/:id" element={<ViewSongPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/verify-email" element={<VerifyEmailForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />

              {/* User profile - requires auth */}
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Song creation/editing - now public with inline login option */}
              <Route path="/song/new" element={<NewSongPage />} />
              <Route path="/song/edit/:id" element={<EditSongPage />} />
              
              {/* Admin route - requires admin */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/songs" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

/**
 * My Songs Page - User's own songs (AUTH REQUIRED)
 */
function MySongsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // Filter to only show user's songs (by email for migrated songs, or userId for new songs)
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

  const handleSelectSong = (song) => {
    navigate(`/song/view/${song.id}`);
  };

  const handleNewSong = () => {
    navigate('/song/new');
  };

  const handleDeleteSong = async (song) => {
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

/**
 * Songs Page - Browse and manage songs (PUBLIC)
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
    // Anyone can create songs now (no auth required)
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
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="loading">Loading songs...</div>
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
      <UnifiedNavBar mode="normal" />
      <div className="page-content">
        <SongEditor onSave={handleSave} onCancel={handleCancel} />
      </div>
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
      const errorMessage = err.message || 'Failed to save song. Please try again.';
      setError(errorMessage);
      console.error('Error saving song:', err);
      setSaving(false);
      
      // Show alert for immediate feedback
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
          onSuccess={() => {
            setShowLoginModal(false);
          }}
        />
      </div>
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
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [hasDropdownOpen, setHasDropdownOpen] = useState(false);
  
  const { isScrolling, toggle: toggleAutoScroll } = useAutoScroll(true, autoScrollSpeed);

  // Mouse tracking for auto-hide navbar - but stay visible if dropdown is open
  useEffect(() => {
    let hideTimeout;
    
    const handleMouseMove = (e) => {
      // Don't hide if dropdown is open
      if (hasDropdownOpen) {
        setIsNavVisible(true);
        return;
      }
      
      // Show navbar when mouse is near top (expanded area to include dropdowns)
      if (e.clientY < 400) { // Increased from 80 to account for dropdowns
        setIsNavVisible(true);
        
        // Clear any existing timeout
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
        
        // Hide after 3 seconds of no movement at top (increased from 2s)
        hideTimeout = setTimeout(() => {
          if (!hasDropdownOpen) { // Double-check dropdown isn't open
            setIsNavVisible(false);
          }
        }, 3000);
      } else if (e.clientY > 400) {
        // Hide immediately when mouse moves away from top area
        if (!hasDropdownOpen) {
          setIsNavVisible(false);
        }
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hasDropdownOpen]);

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
      const transposed = transposeSong(song.content, currentTranspose);
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
    // Check if user owns this song (check both userId and ownerEmail for compatibility)
    const isOwner = 
      (song.userId && user?.userId === song.userId) || 
      (song.ownerEmail && user?.email === song.ownerEmail);
    
    if (song.userId && song.userId !== 'anonymous' && !isOwner) {
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
        <UnifiedNavBar mode="normal" />
        <div className="page-content">
          <div className="error">
            <p>{error || 'Song not found'}</p>
            <button onClick={() => navigate('/songs')}>Back to Library</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-song-page">
      <UnifiedNavBar
        mode="song-view"
        isVisible={isNavVisible}
        transpose={currentTranspose}
        onTranspose={handleTranspose}
        isAutoScrolling={isScrolling}
        onAutoScrollToggle={toggleAutoScroll}
        autoScrollSpeed={autoScrollSpeed}
        onAutoScrollSpeedChange={setAutoScrollSpeed}
        isDoubleColumn={isDoubleColumn}
        onDoubleColumnToggle={() => setIsDoubleColumn(prev => !prev)}
        onEdit={handleEdit}
        onBack={handleBack}
        onDropdownChange={setHasDropdownOpen}
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
