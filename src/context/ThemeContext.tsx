import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { themes, getThemesByCategory } from '../themes';
import type { ThemesByCategory } from '../types/theme';

export interface ThemeContextValue {
  currentTheme: string;
  changeTheme: (themeKey: string) => void;
  themes: typeof themes;
  themesByCategory: ThemesByCategory;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeKey: string) => {
    const theme = themes[themeKey as keyof typeof themes];
    if (!theme) return;

    const root = document.documentElement;
    (Object.entries(theme.colors) as [string, string][]).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const changeTheme = (themeKey: string) => {
    if (!themes[themeKey as keyof typeof themes]) return;

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

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
