import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            color: mode === 'light' ? '#3b82f6' : '#8b5cf6',
            '&:hover': {
              background: mode === 'light' 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'rgba(139, 92, 246, 0.1)',
            },
          }}
        >
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default ThemeToggle; 