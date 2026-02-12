import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import ThemeSelector from './ThemeSelector';
import './UnifiedNavBar.css';
import type { User } from '../../types/auth';

interface UnifiedNavBarProps {
  mode?: 'normal' | 'song-view';
  isVisible?: boolean;
  transpose?: number;
  onTranspose?: (value: number) => void;
  isDoubleColumn?: boolean;
  onDoubleColumnToggle?: () => void;
  onEdit?: () => void;
  user?: User | null;
  isAuthenticated?: boolean;
  songOwnerId?: string | null;
  songOwnerEmail?: string | null;
  onDropdownChange?: (isOpen: boolean) => void;
  atTop?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Unified Navigation Bar - ONE bar with everything
 * Can be pinned or auto-hide on song view
 */
export default function UnifiedNavBar({
  mode = 'normal',
  isVisible = true,
  transpose = 0,
  onTranspose,
  isDoubleColumn = false,
  onDoubleColumnToggle,
  onEdit,
  user = null,
  isAuthenticated = false,
  songOwnerId = null,
  songOwnerEmail = null,
  onDropdownChange,
  atTop = true,
  onVisibilityChange,
}: UnifiedNavBarProps) {
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);

  const handleTransposeUp = () => {
    if (!onTranspose) return;
    const newTranspose = transpose + 1;
    const adjusted = newTranspose >= 12 ? newTranspose - 12 : newTranspose;
    onTranspose(adjusted);
  };

  const handleTransposeDown = () => {
    if (!onTranspose) return;
    const newTranspose = transpose - 1;
    const adjusted = newTranspose <= -12 ? newTranspose + 12 : newTranspose;
    onTranspose(adjusted);
  };

  const getTransposeDisplay = () => {
    if (transpose === 0) return '0';
    return transpose > 0 ? `+${transpose}` : `${transpose}`;
  };

  // Show navbar: pinned OR hover OR (non-compact only: when scrolled to top)
  const shouldShow = mode === 'song-view'
    ? (isPinned || isVisible || (atTop && !isDoubleColumn))
    : true;

  useEffect(() => {
    if (mode === 'song-view') {
      onVisibilityChange?.(shouldShow);
    }
  }, [mode, shouldShow, onVisibilityChange]);

  // Check if user owns the song
  const isOwner = isAuthenticated && (
    (songOwnerId && user?.userId === songOwnerId) ||
    (songOwnerEmail && user?.email === songOwnerEmail)
  );

  if (mode === 'song-view') {
    return (
      <nav className={`unified-navbar song-view ${shouldShow ? 'visible' : 'hidden'}`}>
        <div className="navbar-section navbar-left">
          <h1 onClick={() => navigate('/songs')} className="navbar-logo">
            🎵 Open Chords
          </h1>
          <button
            className={`control-btn pin-btn ${isPinned ? 'active' : ''}`}
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? "Unpin navbar (auto-hide)" : "Pin navbar (always show)"}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        </div>

        <div className="navbar-section navbar-right">
          <span className="control-label-standalone">Transpose</span>
          <button className="control-btn transpose-btn" onClick={handleTransposeDown} title="Transpose down (↓)">
            <span className="btn-icon">−</span>
          </button>
          <span className={`transpose-display ${transpose !== 0 ? (transpose > 0 ? 'positive' : 'negative') : ''}`}>
            {getTransposeDisplay()}
          </span>
          <button className="control-btn transpose-btn" onClick={handleTransposeUp} title="Transpose up (↑)">
            <span className="btn-icon">+</span>
          </button>

          <div className="divider" />

          <button
            className={`control-btn layout-btn ${isDoubleColumn ? 'active' : ''}`}
            onClick={onDoubleColumnToggle}
            title={isDoubleColumn ? "Exit compact mode" : "Enter compact mode"}
          >
            <span className="btn-icon">{isDoubleColumn ? '📄' : '⚏'}</span>
            <span className="btn-label">View</span>
          </button>

          <div className="divider" />

          <ThemeSelector onDropdownChange={onDropdownChange} />

          <div className="divider" />

          {isOwner && onEdit && (
            <>
              <button className="control-btn action-btn" onClick={onEdit} title="Edit song">
                <span className="btn-icon">✏️</span>
                <span className="btn-label">Edit</span>
              </button>
              <div className="divider" />
            </>
          )}

          <UserMenu onDropdownChange={onDropdownChange} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="unified-navbar normal">
      <h1 onClick={() => navigate('/songs')} className="navbar-logo">
        🎵 Open Chords
      </h1>
      <div className="navbar-section navbar-right">
        <ThemeSelector onDropdownChange={onDropdownChange} />
        <UserMenu onDropdownChange={onDropdownChange} />
      </div>
    </nav>
  );
}
