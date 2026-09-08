import { useState, useEffect } from 'react';
import { ThemePalette } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme(
  initialMode: ThemeMode = 'system',
  initialPalette: ThemePalette = 'classic'
) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);
  const [themePalette, setThemePalette] = useState<ThemePalette>(initialPalette);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Apply palette attribute
    root.setAttribute('data-palette', themePalette);

    const applyTheme = () => {
      const darkActive = themeMode === 'dark' || (themeMode === 'system' && mediaQuery.matches);
      setIsDark(darkActive);
      if (darkActive) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const listener = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode, themePalette]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return {
    themeMode,
    setThemeMode,
    themePalette,
    setThemePalette,
    isDark,
    toggleTheme,
  };
}
