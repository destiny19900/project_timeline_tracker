import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const AnimatedBackground: React.FC = () => {
  const { mode } = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: mode === 'dark' 
          ? 'linear-gradient(45deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(45deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          width: '400px',
          height: '400px',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }}
      />
    </Box>
  );
};

export default AnimatedBackground; 