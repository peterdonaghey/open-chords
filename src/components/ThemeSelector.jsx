import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSelector.css';

export default function ThemeSelector({ onDropdownChange }) {
  const { currentTheme, changeTheme, themesByCategory } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const themeButtonRefs = useRef([]);

  // Get flat list of all theme keys in order
  const getAllThemeKeys = () => {
    const keys = [];
    Object.keys(categoryNames).forEach(categoryKey => {
      const themesInCategory = themesByCategory[categoryKey];
      if (themesInCategory && themesInCategory.length > 0) {
        themesInCategory.forEach(theme => keys.push(theme.key));
      }
    });
    return keys;
  };

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event) {
      const allThemeKeys = getAllThemeKeys();
      const currentIndex = allThemeKeys.indexOf(currentTheme);
      
      if (!isOpen) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allThemeKeys.length - 1;
        changeTheme(allThemeKeys[prevIndex]);
        setFocusedIndex(prevIndex);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < allThemeKeys.length - 1 ? currentIndex + 1 : 0;
        changeTheme(allThemeKeys[nextIndex]);
        setFocusedIndex(nextIndex);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTheme, themesByCategory, changeTheme, isOpen]);

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

  // Notify parent when dropdown state changes
  useEffect(() => {
    if (onDropdownChange) {
      onDropdownChange(isOpen);
    }
  }, [isOpen, onDropdownChange]);

  const handleThemeSelect = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  const categoryNames = {
    retro: '🕹️ Retro',
    neon: '⚡ Neon',
    vintage: '📜 Vintage',
    rainbow: '🌈 Rainbow',
    nature: '🌿 Nature',
    light: '☀️ Light',
    dark: '🌙 Dark',
    accessible: '♿ Accessible',
  };

  // Scroll focused theme into view
  useEffect(() => {
    if (focusedIndex >= 0 && themeButtonRefs.current[focusedIndex]) {
      themeButtonRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focusedIndex]);

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
          <div className="theme-dropdown-header">
            Choose Theme
            <span className="keyboard-hint">Use ← → ↑ ↓ to cycle</span>
          </div>
          {(() => {
            let themeIndex = 0;
            return Object.entries(categoryNames).map(([categoryKey, categoryName]) => {
              const themesInCategory = themesByCategory[categoryKey];
              if (!themesInCategory || themesInCategory.length === 0) return null;

              return (
                <div key={categoryKey} className="theme-category">
                  <div className="category-label">{categoryName}</div>
                  {themesInCategory.map(({ key, name, colors }) => {
                    const currentIndex = themeIndex++;
                    return (
                      <button
                        key={key}
                        ref={el => themeButtonRefs.current[currentIndex] = el}
                        className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                        onClick={() => handleThemeSelect(key)}
                      >
                        <div className="theme-preview">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: colors['--bg-primary'] }}
                          />
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: colors['--accent-primary'] }}
                          />
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: colors['--text-primary'] }}
                          />
                        </div>
                        <span className="theme-name">{name}</span>
                        {currentTheme === key && <span className="checkmark">✓</span>}
                      </button>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}

