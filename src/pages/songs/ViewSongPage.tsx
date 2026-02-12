import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnifiedNavBar from '../../components/layout/UnifiedNavBar';
import SongViewer from '../../components/song/SongViewer';
import { getSong } from '../../services/storage';
import { transposeSong } from '../../services/transposer';
import type { Song } from '../../types/song';

/**
 * View Song Page - View and transpose a song (PUBLIC)
 */
export default function ViewSongPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [transposedContent, setTransposedContent] = useState('');
  const [currentTranspose, setCurrentTranspose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDoubleColumn, setIsDoubleColumn] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [hasDropdownOpen, setHasDropdownOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [navActuallyVisible, setNavActuallyVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDoubleColumn) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const checkScroll = () => {
      setIsAtTop(el.scrollTop < 80);
    };
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [isDoubleColumn, song]);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleMouseMove = (e: MouseEvent) => {
      if (hasDropdownOpen) {
        setIsNavVisible(true);
        return;
      }

      if (e.clientY < 100) {
        setIsNavVisible(true);

        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }

        hideTimeout = setTimeout(() => {
          if (!hasDropdownOpen) {
            setIsNavVisible(false);
          }
        }, 3000);
      } else if (e.clientY > 100) {
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
      const id = window.location.pathname.split('/').pop();
      const fetchedSong = await getSong(id ?? '');
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

  const handleTranspose = (semitones: number) => {
    setCurrentTranspose(semitones);
  };

  const handleEdit = () => {
    if (!song) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/song/edit/${song.id}` } } });
      return;
    }
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
    const handleKeyPress = (e: KeyboardEvent) => {
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
            <p>{error ?? 'Song not found'}</p>
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
