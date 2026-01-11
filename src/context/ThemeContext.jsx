import { createContext, useContext, useState, useEffect } from 'react';
import { themes, getThemesByCategory } from '../themes';

const ThemeContext = createContext(null);

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

  const themesByCategory = getThemesByCategory();

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes, themesByCategory }}>
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

