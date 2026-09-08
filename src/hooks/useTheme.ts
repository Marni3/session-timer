import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme(initialMode: ThemeMode = 'system') {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return {
    themeMode,
    setThemeMode,
    isDark,
    toggleTheme,
  };
}
