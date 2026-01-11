import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSelector.css';

export default function ThemeSelector() {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleThemeSelect = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="control-btn theme-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme"
        title="Change theme"
      >
        <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span className="btn-label">Theme</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">Choose Theme</div>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeSelect(key)}
            >
              <div className="theme-preview">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: theme.colors['--bg-primary'] }}
                />
                <div
                  className="color-swatch"
                  style={{ backgroundColor: theme.colors['--accent-primary'] }}
                />
                <div
                  className="color-swatch"
                  style={{ backgroundColor: theme.colors['--text-primary'] }}
                />
              </div>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === key && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

