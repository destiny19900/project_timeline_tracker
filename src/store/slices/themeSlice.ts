import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Helper function to get initial theme from localStorage or default to dark
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
  }
  return 'dark'; // Default to dark theme
};

interface ThemeState {
  mode: 'light' | 'dark';
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      // Persist theme preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer; 