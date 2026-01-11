import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import ThemeSelector from './ThemeSelector';
import './UnifiedNavBar.css';

/**
 * Unified Navigation Bar - ONE bar with everything
 * Can be pinned or auto-hide on song view
 */
export default function UnifiedNavBar({
  mode = 'normal', // 'normal' or 'song-view'
  isVisible = true,
  // Song view specific props
  transpose = 0,
  onTranspose,
  isAutoScrolling = false,
  onAutoScrollToggle,
  autoScrollSpeed = 3,
  onAutoScrollSpeedChange,
  isDoubleColumn = false,
  onDoubleColumnToggle,
  onEdit,
  onBack,
  onDropdownChange, // Callback to notify parent when dropdown state changes
}) {
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);

  const handleTransposeUp = () => {
    const newTranspose = transpose + 1;
    const adjusted = newTranspose >= 12 ? newTranspose - 12 : newTranspose;
    onTranspose(adjusted);
  };

  const handleTransposeDown = () => {
    const newTranspose = transpose - 1;
    const adjusted = newTranspose <= -12 ? newTranspose + 12 : newTranspose;
    onTranspose(adjusted);
  };

  const getTransposeDisplay = () => {
    if (transpose === 0) return '0';
    return transpose > 0 ? `+${transpose}` : `${transpose}`;
  };

  if (mode === 'song-view') {
    // Show navbar if pinned OR if mouse is hovering
    const shouldShow = isPinned || isVisible;
    
    return (
      <nav className={`unified-navbar song-view ${shouldShow ? 'visible' : 'hidden'}`}>
        <div className="navbar-section navbar-left">
          <h1 onClick={() => navigate('/songs')} className="navbar-logo">
            🎵 Open Chords
          </h1>
          {/* Pin/Unpin toggle */}
          <button 
            className={`control-btn pin-btn ${isPinned ? 'active' : ''}`}
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? "Unpin navbar (auto-hide)" : "Pin navbar (always show)"}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        </div>

        <div className="navbar-section navbar-center">
          {/* Transpose */}
          <div className="control-group">
            <span className="control-label">Transpose</span>
            <button className="control-btn transpose-btn" onClick={handleTransposeDown} title="Transpose down (↓)">
              <span className="btn-icon">−</span>
            </button>
            <span className={`transpose-display ${transpose !== 0 ? (transpose > 0 ? 'positive' : 'negative') : ''}`}>
              {getTransposeDisplay()}
            </span>
            <button className="control-btn transpose-btn" onClick={handleTransposeUp} title="Transpose up (↑)">
              <span className="btn-icon">+</span>
            </button>
          </div>

          <div className="divider" />

          {/* Auto-scroll */}
          <div className="control-group">
            <span className="control-label">Auto-scroll</span>
            <button 
              className={`control-btn scroll-btn ${isAutoScrolling ? 'active' : ''}`}
              onClick={onAutoScrollToggle}
              disabled={isDoubleColumn}
              title={isDoubleColumn ? "Disabled in compact mode" : "Toggle auto-scroll (Space)"}
            >
              <span className="btn-icon">{isAutoScrolling ? '⏸' : '▶'}</span>
            </button>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={autoScrollSpeed}
              onChange={(e) => onAutoScrollSpeedChange(Number(e.target.value))}
              className="speed-slider"
              disabled={isDoubleColumn}
              title="Scroll speed"
            />
            <span className="speed-display">{autoScrollSpeed}x</span>
          </div>

          <div className="divider" />

          {/* Compact toggle */}
          <button 
            className={`control-btn layout-btn ${isDoubleColumn ? 'active' : ''}`}
            onClick={onDoubleColumnToggle}
            title={isDoubleColumn ? "Exit compact mode" : "Enter compact mode"}
          >
            <span className="btn-icon">{isDoubleColumn ? '📄' : '⚏'}</span>
            <span className="btn-label">Compact</span>
          </button>
        </div>

        <div className="navbar-section navbar-right">
          <ThemeSelector onDropdownChange={onDropdownChange} />
          <button className="control-btn action-btn" onClick={onEdit} title="Edit song">
            <span className="btn-icon">✏️</span>
            <span className="btn-label">Edit</span>
          </button>
          <button className="control-btn action-btn" onClick={onBack} title="Back to library">
            <span className="btn-icon">◀</span>
            <span className="btn-label">Back</span>
          </button>
          <UserMenu onDropdownChange={onDropdownChange} />
        </div>
      </nav>
    );
  }

  // Normal mode (library, edit pages, etc.)
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

