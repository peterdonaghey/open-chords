/**
 * Color Theme Collection for Open Chords
 * Organized by style categories with accessibility in mind
 */

export const themes = {
  // ===== RETRO THEMES =====
  retroSunset: {
    name: 'Retro Sunset',
    category: 'retro',
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
  },

  retroWave: {
    name: 'Retro Wave',
    category: 'retro',
    colors: {
      '--bg-primary': '#2d1810',
      '--bg-secondary': '#411FCA',
      '--bg-elevated': '#080156',
      '--bg-card': '#1a0a4a',
      '--text-primary': '#ffffff',
      '--text-secondary': '#FF818E',
      '--text-muted': '#a89fc9',
      '--accent-primary': '#FE2464',
      '--accent-secondary': '#FF818E',
      '--accent-tertiary': '#7116BD',
      '--success': '#6fcb9f',
      '--error': '#fb2e01',
      '--warning': '#ffe28a',
      '--border-subtle': '#7116BD',
      '--border-medium': '#411FCA',
    }
  },

  retro70s: {
    name: 'Retro 70s',
    category: 'retro',
    colors: {
      '--bg-primary': '#f5e6d3',
      '--bg-secondary': '#e8d4b8',
      '--bg-elevated': '#ede0ce',
      '--bg-card': '#d9c7ae',
      '--text-primary': '#3e2723',
      '--text-secondary': '#5d4037',
      '--text-muted': '#8d6e63',
      '--accent-primary': '#E9A131',
      '--accent-secondary': '#F67422',
      '--accent-tertiary': '#E55017',
      '--success': '#6b8e23',
      '--error': '#a0522d',
      '--warning': '#cd853f',
      '--border-subtle': '#a1887f',
      '--border-medium': '#795548',
    }
  },

  retroFuture: {
    name: 'Retro Future',
    category: 'retro',
    colors: {
      '--bg-primary': '#1a1a2e',
      '--bg-secondary': '#16213e',
      '--bg-elevated': '#0f1729',
      '--bg-card': '#1f2937',
      '--text-primary': '#ffffff',
      '--text-secondary': '#FFC31B',
      '--text-muted': '#94a3b8',
      '--accent-primary': '#F87523',
      '--accent-secondary': '#FFC31B',
      '--accent-tertiary': '#1DB7B9',
      '--success': '#1DB7B9',
      '--error': '#F87523',
      '--warning': '#FFC31B',
      '--border-subtle': '#334155',
      '--border-medium': '#475569',
    }
  },

  retroWarm: {
    name: 'Retro Warm',
    category: 'retro',
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

  // ===== NEON THEMES =====
  neonDreams: {
    name: 'Neon Dreams',
    category: 'neon',
    colors: {
      '--bg-primary': '#0a0014',
      '--bg-secondary': '#1a0a28',
      '--bg-elevated': '#150520',
      '--bg-card': '#1f0a2e',
      '--text-primary': '#ffffff',
      '--text-secondary': '#FD4499',
      '--text-muted': '#b19cd9',
      '--accent-primary': '#12B8FF',
      '--accent-secondary': '#01DC03',
      '--accent-tertiary': '#DF19FB',
      '--success': '#01DC03',
      '--error': '#FD4499',
      '--warning': '#FFE62D',
      '--border-subtle': '#463F9E',
      '--border-medium': '#682DFA',
    }
  },

  neonCyber: {
    name: 'Neon Cyber',
    category: 'neon',
    colors: {
      '--bg-primary': '#0C0F0A',
      '--bg-secondary': '#1a1d17',
      '--bg-elevated': '#141710',
      '--bg-card': '#1e221a',
      '--text-primary': '#FBFF12',
      '--text-secondary': '#53EB42',
      '--text-muted': '#8ab67d',
      '--accent-primary': '#6A0FFC',
      '--accent-secondary': '#FF00D9',
      '--accent-tertiary': '#53EB42',
      '--success': '#53EB42',
      '--error': '#FF00D9',
      '--warning': '#FBFF12',
      '--border-subtle': '#6A0FFC',
      '--border-medium': '#FF00D9',
    }
  },

  neonMiami: {
    name: 'Neon Miami',
    category: 'neon',
    colors: {
      '--bg-primary': '#1a0033',
      '--bg-secondary': '#2d0052',
      '--bg-elevated': '#240047',
      '--bg-card': '#330066',
      '--text-primary': '#ffffff',
      '--text-secondary': '#FD7EAF',
      '--text-muted': '#c9a8d4',
      '--accent-primary': '#FD7EAF',
      '--accent-secondary': '#FFAA8C',
      '--accent-tertiary': '#F0FF9D',
      '--success': '#F0FF9D',
      '--error': '#FD7EAF',
      '--warning': '#FFDD88',
      '--border-subtle': '#6600a3',
      '--border-medium': '#8800cc',
    }
  },

  neonElectric: {
    name: 'Neon Electric',
    category: 'neon',
    colors: {
      '--bg-primary': '#000814',
      '--bg-secondary': '#001d3d',
      '--bg-elevated': '#001229',
      '--bg-card': '#002855',
      '--text-primary': '#ffffff',
      '--text-secondary': '#00F7FF',
      '--text-muted': '#80c1c9',
      '--accent-primary': '#6600FF',
      '--accent-secondary': '#CB0FFF',
      '--accent-tertiary': '#FDFF00',
      '--success': '#38FF12',
      '--error': '#CB0FFF',
      '--warning': '#FDFF00',
      '--border-subtle': '#003d82',
      '--border-medium': '#0051a8',
    }
  },

  neonOcean: {
    name: 'Neon Ocean',
    category: 'neon',
    colors: {
      '--bg-primary': '#001F2E',
      '--bg-secondary': '#003547',
      '--bg-elevated': '#002a3a',
      '--bg-card': '#004060',
      '--text-primary': '#ffffff',
      '--text-secondary': '#4deeea',
      '--text-muted': '#80c1c9',
      '--accent-primary': '#4deeea',
      '--accent-secondary': '#74ee15',
      '--accent-tertiary': '#ffe700',
      '--success': '#74ee15',
      '--error': '#f000ff',
      '--warning': '#ffe700',
      '--border-subtle': '#005573',
      '--border-medium': '#006a8f',
    }
  },

  // ===== VINTAGE THEMES =====
  vintageRose: {
    name: 'Vintage Rose',
    category: 'vintage',
    colors: {
      '--bg-primary': '#f8ede3',
      '--bg-secondary': '#dfd3c3',
      '--bg-elevated': '#f0e6dc',
      '--bg-card': '#d0b8a8',
      '--text-primary': '#3e2723',
      '--text-secondary': '#85586f',
      '--text-muted': '#9e7676',
      '--accent-primary': '#85586f',
      '--accent-secondary': '#9e7676',
      '--accent-tertiary': '#a45e5f',
      '--success': '#7cb686',
      '--error': '#a45e5f',
      '--warning': '#d4a574',
      '--border-subtle': '#c9b8a8',
      '--border-medium': '#b8a898',
    }
  },

  vintageLibrary: {
    name: 'Vintage Library',
    category: 'vintage',
    colors: {
      '--bg-primary': '#f5e6d3',
      '--bg-secondary': '#d5c5ae',
      '--bg-elevated': '#ede0ce',
      '--bg-card': '#c9b8a0',
      '--text-primary': '#312229',
      '--text-secondary': '#54101d',
      '--text-muted': '#6b4438',
      '--accent-primary': '#54101d',
      '--accent-secondary': '#47596f',
      '--accent-tertiary': '#b18653',
      '--success': '#67988A',
      '--error': '#852C3B',
      '--warning': '#b18653',
      '--border-subtle': '#b8a890',
      '--border-medium': '#a89880',
    }
  },

  vintageTeal: {
    name: 'Vintage Teal',
    category: 'vintage',
    colors: {
      '--bg-primary': '#f5f4ed',
      '--bg-secondary': '#e7e5db',
      '--bg-elevated': '#efeee6',
      '--bg-card': '#dddbd0',
      '--text-primary': '#2d2420',
      '--text-secondary': '#43C6C3',
      '--text-muted': '#6b9996',
      '--accent-primary': '#43C6C3',
      '--accent-secondary': '#F75A33',
      '--accent-tertiary': '#F2C749',
      '--success': '#43C6C3',
      '--error': '#F75A33',
      '--warning': '#F2C749',
      '--border-subtle': '#d0cec3',
      '--border-medium': '#bbb9ae',
    }
  },

  vintageAutumn: {
    name: 'Vintage Autumn',
    category: 'vintage',
    colors: {
      '--bg-primary': '#f5e8dc',
      '--bg-secondary': '#e8d8c8',
      '--bg-elevated': '#f0e2d4',
      '--bg-card': '#d9c5b0',
      '--text-primary': '#2d1810',
      '--text-secondary': '#8B4513',
      '--text-muted': '#a1784f',
      '--accent-primary': '#8B4513',
      '--accent-secondary': '#a0522d',
      '--accent-tertiary': '#cd853f',
      '--success': '#6b8e23',
      '--error': '#a0522d',
      '--warning': '#cd853f',
      '--border-subtle': '#c9b59f',
      '--border-medium': '#b8a58e',
    }
  },

  vintageCoastal: {
    name: 'Vintage Coastal',
    category: 'vintage',
    colors: {
      '--bg-primary': '#f0ffff',
      '--bg-secondary': '#d4f1f4',
      '--bg-elevated': '#e2f8f9',
      '--bg-card': '#c5e1e1',
      '--text-primary': '#284c4c',
      '--text-secondary': '#4B807D',
      '--text-muted': '#67988A',
      '--accent-primary': '#4B807D',
      '--accent-secondary': '#a45e5f',
      '--accent-tertiary': '#ebb7b6',
      '--success': '#67988A',
      '--error': '#a45e5f',
      '--warning': '#d4a574',
      '--border-subtle': '#b8d1d1',
      '--border-medium': '#a3c1c1',
    }
  },

  // ===== MODERN LIGHT THEMES =====
  default: {
    name: 'Clean Modern',
    category: 'light',
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

  softPeach: {
    name: 'Soft Peach',
    category: 'light',
    colors: {
      '--bg-primary': '#fffbf5',
      '--bg-secondary': '#ffe8d6',
      '--bg-elevated': '#fff4ea',
      '--bg-card': '#f8e5d3',
      '--text-primary': '#2d2420',
      '--text-secondary': '#6b5444',
      '--text-muted': '#9a7d66',
      '--accent-primary': '#ff9966',
      '--accent-secondary': '#ff8552',
      '--accent-tertiary': '#e67547',
      '--success': '#7cb686',
      '--error': '#e07070',
      '--warning': '#ffb84d',
      '--border-subtle': '#e6d1c1',
      '--border-medium': '#d4bfae',
    }
  },

  skyBlue: {
    name: 'Sky Blue',
    category: 'light',
    colors: {
      '--bg-primary': '#f0f9ff',
      '--bg-secondary': '#e0f2fe',
      '--bg-elevated': '#e8f5fe',
      '--bg-card': '#d0e8fa',
      '--text-primary': '#0c2d48',
      '--text-secondary': '#2e5c7a',
      '--text-muted': '#5a8aac',
      '--accent-primary': '#0ea5e9',
      '--accent-secondary': '#0284c7',
      '--accent-tertiary': '#0369a1',
      '--success': '#14b8a6',
      '--error': '#ef4444',
      '--warning': '#f59e0b',
      '--border-subtle': '#bae6fd',
      '--border-medium': '#7dd3fc',
    }
  },

  mintFresh: {
    name: 'Mint Fresh',
    category: 'light',
    colors: {
      '--bg-primary': '#f0fdf4',
      '--bg-secondary': '#dcfce7',
      '--bg-elevated': '#e6fbed',
      '--bg-card': '#d1f5de',
      '--text-primary': '#14532d',
      '--text-secondary': '#166534',
      '--text-muted': '#22c55e',
      '--accent-primary': '#10b981',
      '--accent-secondary': '#059669',
      '--accent-tertiary': '#047857',
      '--success': '#22c55e',
      '--error': '#ef4444',
      '--warning': '#f59e0b',
      '--border-subtle': '#bbf7d0',
      '--border-medium': '#86efac',
    }
  },

  lavender: {
    name: 'Lavender',
    category: 'light',
    colors: {
      '--bg-primary': '#faf5ff',
      '--bg-secondary': '#f3e8ff',
      '--bg-elevated': '#f7f0ff',
      '--bg-card': '#e9d5ff',
      '--text-primary': '#3b0764',
      '--text-secondary': '#581c87',
      '--text-muted': '#7c3aed',
      '--accent-primary': '#a855f7',
      '--accent-secondary': '#9333ea',
      '--accent-tertiary': '#7e22ce',
      '--success': '#22c55e',
      '--error': '#ef4444',
      '--warning': '#f59e0b',
      '--border-subtle': '#d8b4fe',
      '--border-medium': '#c084fc',
    }
  },

  // ===== MODERN DARK THEMES =====
  dark: {
    name: 'Modern Dark',
    category: 'dark',
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

  darkSlate: {
    name: 'Dark Slate',
    category: 'dark',
    colors: {
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--bg-elevated': '#1a2332',
      '--bg-card': '#293548',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--accent-primary': '#38bdf8',
      '--accent-secondary': '#0ea5e9',
      '--accent-tertiary': '#0284c7',
      '--success': '#22c55e',
      '--error': '#ef4444',
      '--warning': '#f59e0b',
      '--border-subtle': '#334155',
      '--border-medium': '#475569',
    }
  },

  darkForest: {
    name: 'Dark Forest',
    category: 'dark',
    colors: {
      '--bg-primary': '#0a1f0f',
      '--bg-secondary': '#1a3322',
      '--bg-elevated': '#122918',
      '--bg-card': '#234030',
      '--text-primary': '#f0fdf4',
      '--text-secondary': '#bbf7d0',
      '--text-muted': '#86efac',
      '--accent-primary': '#4ade80',
      '--accent-secondary': '#22c55e',
      '--accent-tertiary': '#16a34a',
      '--success': '#22c55e',
      '--error': '#f87171',
      '--warning': '#fbbf24',
      '--border-subtle': '#2d4a3a',
      '--border-medium': '#3a5f4a',
    }
  },

  darkPurple: {
    name: 'Dark Purple',
    category: 'dark',
    colors: {
      '--bg-primary': '#1a0f2e',
      '--bg-secondary': '#2d1f47',
      '--bg-elevated': '#23183a',
      '--bg-card': '#3a2e5c',
      '--text-primary': '#faf5ff',
      '--text-secondary': '#e9d5ff',
      '--text-muted': '#c084fc',
      '--accent-primary': '#a855f7',
      '--accent-secondary': '#9333ea',
      '--accent-tertiary': '#7e22ce',
      '--success': '#22c55e',
      '--error': '#f87171',
      '--warning': '#fbbf24',
      '--border-subtle': '#4a3e6c',
      '--border-medium': '#5c4f8a',
    }
  },

  darkOcean: {
    name: 'Dark Ocean',
    category: 'dark',
    colors: {
      '--bg-primary': '#051923',
      '--bg-secondary': '#0a2e42',
      '--bg-elevated': '#082333',
      '--bg-card': '#103950',
      '--text-primary': '#f0fdfa',
      '--text-secondary': '#99f6e4',
      '--text-muted': '#5eead4',
      '--accent-primary': '#2dd4bf',
      '--accent-secondary': '#14b8a6',
      '--accent-tertiary': '#0d9488',
      '--success': '#14b8a6',
      '--error': '#f87171',
      '--warning': '#fbbf24',
      '--border-subtle': '#1a4560',
      '--border-medium': '#255776',
    }
  },

  // ===== HIGH CONTRAST THEMES =====
  highContrast: {
    name: 'High Contrast',
    category: 'accessible',
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

  highContrastLight: {
    name: 'High Contrast Light',
    category: 'accessible',
    colors: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f0f0f0',
      '--bg-elevated': '#fafafa',
      '--bg-card': '#e8e8e8',
      '--text-primary': '#000000',
      '--text-secondary': '#1a1a1a',
      '--text-muted': '#333333',
      '--accent-primary': '#0000ff',
      '--accent-secondary': '#0000cc',
      '--accent-tertiary': '#000099',
      '--success': '#008000',
      '--error': '#cc0000',
      '--warning': '#cc6600',
      '--border-subtle': '#000000',
      '--border-medium': '#333333',
    }
  },

  // ===== ADDITIONAL WARM/COOL THEMES =====
  warm: {
    name: 'Warm Sunset',
    category: 'light',
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
    name: 'Cool Ocean',
    category: 'light',
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

  ocean: {
    name: 'Ocean Breeze',
    category: 'light',
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
    name: 'Golden Sunset',
    category: 'light',
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
  },

  // ===== UNIQUE SPECIALTY THEMES =====
  mocha: {
    name: 'Mocha',
    category: 'dark',
    colors: {
      '--bg-primary': '#1e1e1e',
      '--bg-secondary': '#2d2424',
      '--bg-elevated': '#272222',
      '--bg-card': '#3a3030',
      '--text-primary': '#cdd6f4',
      '--text-secondary': '#bac2de',
      '--text-muted': '#a6adc8',
      '--accent-primary': '#f5c2e7',
      '--accent-secondary': '#cba6f7',
      '--accent-tertiary': '#94e2d5',
      '--success': '#a6e3a1',
      '--error': '#f38ba8',
      '--warning': '#f9e2af',
      '--border-subtle': '#45475a',
      '--border-medium': '#585b70',
    }
  },

  solarized: {
    name: 'Solarized',
    category: 'light',
    colors: {
      '--bg-primary': '#fdf6e3',
      '--bg-secondary': '#eee8d5',
      '--bg-elevated': '#f5efe0',
      '--bg-card': '#e5dfc8',
      '--text-primary': '#002b36',
      '--text-secondary': '#073642',
      '--text-muted': '#586e75',
      '--accent-primary': '#268bd2',
      '--accent-secondary': '#2aa198',
      '--accent-tertiary': '#859900',
      '--success': '#859900',
      '--error': '#dc322f',
      '--warning': '#b58900',
      '--border-subtle': '#93a1a1',
      '--border-medium': '#657b83',
    }
  },

  cyberpunk: {
    name: 'Cyberpunk',
    category: 'dark',
    colors: {
      '--bg-primary': '#0a0e27',
      '--bg-secondary': '#171d3a',
      '--bg-elevated': '#10152e',
      '--bg-card': '#1f2747',
      '--text-primary': '#00fff9',
      '--text-secondary': '#ff006e',
      '--text-muted': '#8892b0',
      '--accent-primary': '#ff006e',
      '--accent-secondary': '#ffbe0b',
      '--accent-tertiary': '#00fff9',
      '--success': '#00fff9',
      '--error': '#ff006e',
      '--warning': '#ffbe0b',
      '--border-subtle': '#2d3a5f',
      '--border-medium': '#3d4a6f',
    }
  },

  earthTones: {
    name: 'Earth Tones',
    category: 'light',
    colors: {
      '--bg-primary': '#f5f1e8',
      '--bg-secondary': '#e8dcc8',
      '--bg-elevated': '#f0e9dd',
      '--bg-card': '#ddd0ba',
      '--text-primary': '#3d2817',
      '--text-secondary': '#5a4128',
      '--text-muted': '#7a5e45',
      '--accent-primary': '#8b6f47',
      '--accent-secondary': '#a0825a',
      '--accent-tertiary': '#6b5638',
      '--success': '#7a9b6d',
      '--error': '#c1666b',
      '--warning': '#d4a574',
      '--border-subtle': '#c9bba8',
      '--border-medium': '#b8a898',
    }
  },
};

/**
 * Get themes grouped by category
 */
export function getThemesByCategory() {
  const categories = {
    retro: [],
    neon: [],
    vintage: [],
    light: [],
    dark: [],
    accessible: [],
  };

  Object.entries(themes).forEach(([key, theme]) => {
    const category = theme.category || 'light';
    if (categories[category]) {
      categories[category].push({ key, ...theme });
    }
  });

  return categories;
}

/**
 * Get all theme names as an array
 */
export function getThemeNames() {
  return Object.keys(themes);
}

/**
 * Get a specific theme by key
 */
export function getTheme(key) {
  return themes[key];
}

