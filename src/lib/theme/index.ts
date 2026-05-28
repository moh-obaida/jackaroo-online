// ============================================================================
// THEME MODULE — Dark, Light, Balanced theme management
// ============================================================================

export type Theme = 'dark' | 'light' | 'balanced';

/**
 * Get the initial theme from localStorage.
 */
export function getInitialTheme(): Theme {
  const stored = localStorage.getItem('jakaroo_theme');
  if (stored === 'dark' || stored === 'light' || stored === 'balanced') return stored;
  return 'dark'; // Default
}

/**
 * Save theme preference.
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem('jakaroo_theme', theme);
}

/**
 * Apply theme class to document.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'theme-balanced');
  root.classList.add(`theme-${theme}`);

  // Also set Tailwind dark mode
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Get theme-specific CSS variables.
 */
export function getThemeColors(theme: Theme) {
  switch (theme) {
    case 'dark':
      return {
        bgPrimary: '#1a1208',
        bgSecondary: '#2d2010',
        textPrimary: '#f5f0e8',
        textSecondary: '#d4a563',
        border: '#5c3c18',
        accent: '#e6b800',
      };
    case 'light':
      return {
        bgPrimary: '#f5f0e8',
        bgSecondary: '#e8dcc8',
        textPrimary: '#1a1208',
        textSecondary: '#4a3520',
        border: '#d4a563',
        accent: '#a06b2a',
      };
    case 'balanced':
      return {
        bgPrimary: '#2d2418',
        bgSecondary: '#3d3020',
        textPrimary: '#f5f0e8',
        textSecondary: '#d4a563',
        border: '#5c3c18',
        accent: '#e6b800',
      };
  }
}
