import './Toolbar.css';

interface ToolbarProps {
  transpose?: number;
  onTranspose?: (value: number) => void;
  isAutoScrolling?: boolean;
  onAutoScrollToggle?: () => void;
  autoScrollSpeed?: number;
  onAutoScrollSpeedChange?: (speed: number) => void;
  isDoubleColumn?: boolean;
  onDoubleColumnToggle?: () => void;
}

/**
 * Toolbar component - compact sticky toolbar for transpose, auto-scroll, and layout controls
 */
function Toolbar({
  transpose = 0,
  onTranspose,
  isAutoScrolling = false,
  onAutoScrollToggle,
  autoScrollSpeed = 3,
  onAutoScrollSpeedChange,
  isDoubleColumn = false,
  onDoubleColumnToggle,
}: ToolbarProps) {
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

  return (
    <div className="toolbar">
      <div className="toolbar-container">
        <div className="toolbar-section transpose-section">
          <span className="toolbar-label">Transpose</span>
          <button
            className="toolbar-btn transpose-btn"
            onClick={handleTransposeDown}
            title="Transpose down (↓)"
          >
            −
          </button>
          <span className={`transpose-display ${transpose !== 0 ? (transpose > 0 ? 'positive' : 'negative') : ''}`}>
            {getTransposeDisplay()}
          </span>
          <button
            className="toolbar-btn transpose-btn"
            onClick={handleTransposeUp}
            title="Transpose up (↑)"
          >
            +
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className={`toolbar-section autoscroll-section ${isDoubleColumn ? 'disabled' : ''}`}>
          <span className="toolbar-label">Auto-scroll</span>
          <button
            className={`toolbar-btn ${isAutoScrolling ? 'active' : ''}`}
            onClick={onAutoScrollToggle}
            title={isDoubleColumn ? "Disabled in compact mode" : "Toggle auto-scroll (Space)"}
            disabled={isDoubleColumn}
          >
            {isAutoScrolling ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min="1"
            max="10"
            value={autoScrollSpeed}
            onChange={(e) => onAutoScrollSpeedChange?.(Number(e.target.value))}
            className="speed-slider"
            title="Scroll speed"
            disabled={isDoubleColumn}
          />
          <span className="speed-display">{autoScrollSpeed}x</span>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section layout-section">
          <span className="toolbar-label">Compact</span>
          <button
            className={`toolbar-btn ${isDoubleColumn ? 'active' : ''}`}
            onClick={onDoubleColumnToggle}
            title="Toggle compact view"
          >
            {isDoubleColumn ? '⬜' : '▭'}
          </button>
        </div>

        <div className="toolbar-section shortcuts-section">
          <span className="shortcuts-text">
            <kbd>↑</kbd> <kbd>↓</kbd> transpose • <kbd>Space</kbd> scroll • <kbd>0</kbd> reset
          </span>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
