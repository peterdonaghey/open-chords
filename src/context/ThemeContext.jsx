import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const themes = {
  default: {
    name: 'Default',
    colors: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#e5ff00',
      '--bg-elevated': '#c5fcff',
      '--bg-card': '#dddddd',
      '--text-primary': '#000000',
      '--text-secondary': '#b8b0a0',
      '--text-muted': '#7a7468',
      '--accent-primary': '#e8a87c',
      '--accent-secondary': '#d4845a',
      '--accent-tertiary': '#c06c45',
      '--success': '#7cb686',
      '--error': '#e07070',
      '--warning': '#e0b060',
      '--border-subtle': '#3a3a3a',
      '--border-medium': '#4a4a4a',
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2d2d2d',
      '--bg-elevated': '#252525',
      '--bg-card': '#333333',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b8b8b8',
      '--text-muted': '#888888',
      '--accent-primary': '#e8a87c',
      '--accent-secondary': '#d4845a',
      '--accent-tertiary': '#c06c45',
      '--success': '#7cb686',
      '--error': '#e07070',
      '--warning': '#e0b060',
      '--border-subtle': '#444444',
      '--border-medium': '#555555',
    }
  },
  highContrast: {
    name: 'High Contrast',
    colors: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#1a1a1a',
      '--bg-elevated': '#0a0a0a',
      '--bg-card': '#1a1a1a',
      '--text-primary': '#ffff00',
      '--text-secondary': '#ffffff',
      '--text-muted': '#cccccc',
      '--accent-primary': '#00ff00',
      '--accent-secondary': '#00dd00',
      '--accent-tertiary': '#00bb00',
      '--success': '#00ff00',
      '--error': '#ff0000',
      '--warning': '#ffff00',
      '--border-subtle': '#ffff00',
      '--border-medium': '#ffffff',
    }
  },
  warm: {
    name: 'Warm',
    colors: {
      '--bg-primary': '#fff5e6',
      '--bg-secondary': '#ffe4b3',
      '--bg-elevated': '#fff0d9',
      '--bg-card': '#f5ddb3',
      '--text-primary': '#2d1810',
      '--text-secondary': '#6b4423',
      '--text-muted': '#9a6d3a',
      '--accent-primary': '#ff6b35',
      '--accent-secondary': '#e8552e',
      '--accent-tertiary': '#d14426',
      '--success': '#8bc34a',
      '--error': '#f44336',
      '--warning': '#ff9800',
      '--border-subtle': '#d4a574',
      '--border-medium': '#b38b5c',
    }
  },
  cool: {
    name: 'Cool',
    colors: {
      '--bg-primary': '#e6f3ff',
      '--bg-secondary': '#b3d9ff',
      '--bg-elevated': '#d9ebff',
      '--bg-card': '#cce0f5',
      '--text-primary': '#0d1b2a',
      '--text-secondary': '#415a77',
      '--text-muted': '#778da9',
      '--accent-primary': '#4a90e2',
      '--accent-secondary': '#357abd',
      '--accent-tertiary': '#2666a3',
      '--success': '#5ab563',
      '--error': '#e07a7a',
      '--warning': '#f0ad4e',
      '--border-subtle': '#7ba3cc',
      '--border-medium': '#5a8ab8',
    }
  },
  vintage: {
    name: 'Vintage',
    colors: {
      '--bg-primary': '#f5e6d3',
      '--bg-secondary': '#e8d4b8',
      '--bg-elevated': '#ede0ce',
      '--bg-card': '#d9c7ae',
      '--text-primary': '#3e2723',
      '--text-secondary': '#5d4037',
      '--text-muted': '#8d6e63',
      '--accent-primary': '#8b4513',
      '--accent-secondary': '#704010',
      '--accent-tertiary': '#5a320d',
      '--success': '#6b8e23',
      '--error': '#a0522d',
      '--warning': '#cd853f',
      '--border-subtle': '#a1887f',
      '--border-medium': '#795548',
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      '--bg-primary': '#e0f7fa',
      '--bg-secondary': '#b2ebf2',
      '--bg-elevated': '#d4f1f4',
      '--bg-card': '#a7d8de',
      '--text-primary': '#004d40',
      '--text-secondary': '#00695c',
      '--text-muted': '#00897b',
      '--accent-primary': '#26c6da',
      '--accent-secondary': '#00acc1',
      '--accent-tertiary': '#0097a7',
      '--success': '#4db6ac',
      '--error': '#ef5350',
      '--warning': '#ffa726',
      '--border-subtle': '#4dd0e1',
      '--border-medium': '#00bcd4',
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      '--bg-primary': '#fff3e0',
      '--bg-secondary': '#ffe0b2',
      '--bg-elevated': '#ffead4',
      '--bg-card': '#ffd699',
      '--text-primary': '#3e2723',
      '--text-secondary': '#5d4037',
      '--text-muted': '#795548',
      '--accent-primary': '#ff7043',
      '--accent-secondary': '#ff5722',
      '--accent-tertiary': '#f4511e',
      '--success': '#8bc34a',
      '--error': '#d32f2f',
      '--warning': '#ffa000',
      '--border-subtle': '#ffab91',
      '--border-medium': '#ff8a65',
    }
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeKey) => {
    const theme = themes[themeKey];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const changeTheme = (themeKey) => {
    if (!themes[themeKey]) return;
    
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    localStorage.setItem('theme', themeKey);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

