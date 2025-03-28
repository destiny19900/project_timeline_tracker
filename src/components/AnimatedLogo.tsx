import React from 'react';
import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedLogo: React.FC = () => {
  const letters = "Timeline".split("");

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex' }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
          >
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {letter}
            </Typography>
          </motion.span>
        ))}
      </motion.div>
    </Box>
  );
};

export default AnimatedLogo; 