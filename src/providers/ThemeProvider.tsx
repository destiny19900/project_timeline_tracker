import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from '../styles/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setThemeMode } from '../store/slices/themeSlice';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const [currentTheme, setCurrentTheme] = useState(themeMode === 'dark' ? darkTheme : lightTheme);

  // Update theme when mode changes
  useEffect(() => {
    setCurrentTheme(themeMode === 'dark' ? darkTheme : lightTheme);
  }, [themeMode]);

  return (
    <MUIThemeProvider theme={currentTheme}>
      <StyledThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </StyledThemeProvider>
    </MUIThemeProvider>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  // Toggle between light and dark modes
  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newMode));
  }, [themeMode, dispatch]);

  const contextValue = useMemo(
    () => ({
      mode: themeMode,
      toggleTheme,
    }),
    [themeMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </ThemeContext.Provider>
  );
}; 