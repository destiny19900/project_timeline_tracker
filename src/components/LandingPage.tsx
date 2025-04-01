import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, Grid, Stack, Paper } from '@mui/material';
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
      
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={6} item>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Organize Your Projects with Ease
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Create, track, and manage your projects all in one place. Stay organized and boost your productivity.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNewProject}
                  startIcon={<AccountIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
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
                  New Project
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid xs={12} md={6} item>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                component="img"
                src="/hero-image.svg"
                alt="Project Management"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid xs={12} md={4} item>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  Easy Project Creation
                </Typography>
                <Typography color="text.secondary">
                  Create new projects with just a few clicks. Add tasks, set deadlines, and track progress effortlessly.
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid xs={12} md={4} item>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  Real-time Updates
                </Typography>
                <Typography color="text.secondary">
                  Stay in sync with your team. Changes are reflected instantly across all devices.
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid xs={12} md={4} item>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom>
                  Secure & Reliable
                </Typography>
                <Typography color="text.secondary">
                  Your data is safe with us. We use industry-standard security measures to protect your information.
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 