import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import projectReducer from './slices/projectSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    projects: projectReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 