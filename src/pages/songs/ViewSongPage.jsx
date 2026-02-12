import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongViewer from '../../components/song/SongViewer';
import { getSong } from '../../services/storage';
import { transposeSong } from '../../services/transposer';

/**
 * View Song Page - View and transpose a song (PUBLIC)
 */
export default function ViewSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [song, setSong] = useState(null);
  const [transposedContent, setTransposedContent] = useState('');
  const [currentTranspose, setCurrentTranspose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDoubleColumn, setIsDoubleColumn] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [hasDropdownOpen, setHasDropdownOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [navActuallyVisible, setNavActuallyVisible] = useState(true); // for padding
  const scrollContainerRef = useRef(null);

  // Scroll tracking (non-compact only): nav sticks at top, hides when scrolled, shows on hover
  useEffect(() => {
    if (isDoubleColumn) return; // compact mode: hover-to-show only, no scroll tracking
    const el = scrollContainerRef.current;
    if (!el) return;

    const checkScroll = () => {
      setIsAtTop(el.scrollTop < 80);
    };
    checkScroll(); // initial
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [isDoubleColumn, song]); // Re-run when song loads (ref becomes available)

  // Mouse tracking for auto-hide navbar - but stay visible if dropdown is open
  useEffect(() => {
    let hideTimeout;
    
    const handleMouseMove = (e) => {
      // Don't hide if dropdown is open
      if (hasDropdownOpen) {
        setIsNavVisible(true);
        return;
      }
      
      // Show navbar when mouse is near top
      if (e.clientY < 100) {
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
      } else if (e.clientY > 100) {
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

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentTranspose(prev => {
          const newTranspose = prev + 1;
          return newTranspose >= 12 ? newTranspose - 12 : newTranspose;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentTranspose(prev => {
          const newTranspose = prev - 1;
          return newTranspose <= -12 ? newTranspose + 12 : newTranspose;
        });
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
    <div className={`view-song-page ${navActuallyVisible ? 'nav-visible' : ''}`}>
      <UnifiedNavBar
        mode="song-view"
        isVisible={isNavVisible}
        atTop={isAtTop}
        isDoubleColumn={isDoubleColumn}
        onVisibilityChange={setNavActuallyVisible}
        transpose={currentTranspose}
        onTranspose={handleTranspose}
        onDoubleColumnToggle={() => setIsDoubleColumn(prev => !prev)}
        onEdit={handleEdit}
        user={user}
        isAuthenticated={isAuthenticated}
        songOwnerId={song?.userId}
        songOwnerEmail={song?.ownerEmail}
        onDropdownChange={setHasDropdownOpen}
      />

      <div
        ref={scrollContainerRef}
        className={`view-song-container ${isDoubleColumn ? 'compact-mode' : ''}`}
      >
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
