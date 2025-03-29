import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Timeline as TimelineIcon, Task as TaskIcon, Analytics as AnalyticsIcon, AccountCircle as AccountIcon } from '@mui/icons-material';
import AnimatedBackground from './AnimatedBackground';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: 'Project Timeline',
      description: 'Visualize your project progress with interactive timelines'
    },
    {
      icon: <TaskIcon sx={{ fontSize: 40 }} />,
      title: 'Task Management',
      description: 'Break down projects into manageable tasks and subtasks'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Progress Tracking',
      description: 'Monitor project completion and team performance'
    }
  ];

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleNewProject = () => {
    navigate('/app/new-project');
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      
      <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
        <Grid container spacing={6} alignItems="center" sx={{ minHeight: '80vh' }}>
          {/* Hero Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Project Timeline Tracker
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Streamline your project management with our intuitive timeline and task tracking solution
              </Typography>
              <Stack direction="row" spacing={2}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccountIcon />}
                    onClick={handleGetStarted}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleNewProject}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    Try New Project
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} key={feature.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 