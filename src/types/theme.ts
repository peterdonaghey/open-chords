/**
 * Theme types
 */

export interface ThemeColors {
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-elevated': string;
  '--bg-card': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--accent-primary': string;
  '--accent-secondary': string;
  '--accent-tertiary': string;
  '--success': string;
  '--error': string;
  '--warning': string;
  '--border-subtle': string;
  '--border-medium': string;
}

export interface Theme {
  key?: string;
  name: string;
  category: string;
  colors: ThemeColors;
}

export interface ThemesByCategory {
  [category: string]: Theme[];
}
