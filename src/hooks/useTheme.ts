import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setThemeMode } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSystemTheme(prefersDark ? 'dark' : 'light');

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    dispatch(setThemeMode(themeMode === 'light' ? 'dark' : 'light'));
  };

  return {
    themeMode: themeMode || systemTheme,
    toggleTheme,
    systemTheme,
  };
}; 