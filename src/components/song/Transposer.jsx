import { useState, useEffect } from 'react';
import { getTransposedKey } from '../../services/transposer';
import './Transposer.css';

/**
 * Transposer component - controls for transposing songs
 */
function Transposer({ originalKey, currentTranspose, onTranspose }) {
  const [transpose, setTranspose] = useState(currentTranspose || 0);
  const [currentKey, setCurrentKey] = useState(originalKey);

  // Sync internal state with prop changes (for keyboard shortcuts)
  useEffect(() => {
    setTranspose(currentTranspose || 0);
  }, [currentTranspose]);

  useEffect(() => {
    if (originalKey) {
      const newKey = getTransposedKey(originalKey, transpose);
      setCurrentKey(newKey);
    }
  }, [originalKey, transpose]);

  const handleTransposeUp = () => {
    const newTranspose = transpose + 1;
    setTranspose(newTranspose);
    onTranspose(newTranspose);
  };

  const handleTransposeDown = () => {
    const newTranspose = transpose - 1;
    setTranspose(newTranspose);
    onTranspose(newTranspose);
  };

  const handleReset = () => {
    setTranspose(0);
    onTranspose(0);
  };

  const getSemitoneText = () => {
    if (transpose === 0) return 'Original key';
    const abs = Math.abs(transpose);
    const direction = transpose > 0 ? 'up' : 'down';
    const plural = abs === 1 ? 'semitone' : 'semitones';
    return `${abs} ${plural} ${direction}`;
  };

  return (
    <div className="transposer">
      <div className="transposer-header">
        <h3>Transpose</h3>
      </div>

      <div className="transposer-controls">
        <button
          type="button"
          className="transpose-btn transpose-down"
          onClick={handleTransposeDown}
          title="Transpose down (semitone)"
        >
          <span className="btn-icon">−</span>
          <span className="btn-label">Down</span>
        </button>

        <div className="transpose-info">
          <div className="transpose-indicator">
            {transpose !== 0 && (
              <span className={`transpose-badge ${transpose > 0 ? 'transpose-up' : 'transpose-down'}`}>
                {transpose > 0 ? `+${transpose}` : transpose}
              </span>
            )}
            {transpose === 0 && (
              <span className="transpose-badge transpose-zero">0</span>
            )}
          </div>
          <div className="key-display">
            {originalKey && (
              <>
                <span className="original-key">{originalKey}</span>
                {transpose !== 0 && (
                  <>
                    <span className="arrow">→</span>
                    <span className="current-key">{currentKey}</span>
                  </>
                )}
              </>
            )}
            {!originalKey && <span className="no-key">No key set</span>}
          </div>
          <div className="transpose-amount">{getSemitoneText()}</div>
        </div>

        <button
          type="button"
          className="transpose-btn transpose-up"
          onClick={handleTransposeUp}
          title="Transpose up (semitone)"
        >
          <span className="btn-icon">+</span>
          <span className="btn-label">Up</span>
        </button>
      </div>

      {transpose !== 0 && (
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
        >
          Reset to Original
        </button>
      )}

      <div className="transposer-help">
        <p>Use keyboard shortcuts: <kbd>↑</kbd> up, <kbd>↓</kbd> down, <kbd>0</kbd> reset</p>
      </div>
    </div>
  );
}

export default Transposer;
