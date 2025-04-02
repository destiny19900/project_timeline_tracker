import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, Grid, Stack, Paper, AppBar, Toolbar, Chip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Timeline as TimelineIcon, Task as TaskIcon, Analytics as AnalyticsIcon, AccountCircle as AccountIcon, WorkspacePremium as PremiumIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import AnimatedBackground from './AnimatedBackground';
import kanbanImage from '../assets/kanban-management.png';
import freeImage from '../assets/blue-free-png-5.png';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@mui/material/styles';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'rgba(17, 25, 40, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Taskr
          </Typography>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'text.primary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <GitHubIcon />
            </Link>
            <Button
              variant="contained"
              size="small"
              onClick={handleSignIn}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                },
              }}
            >
              Sign In
            </Button>
            <ThemeToggle />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Organize Your Projects with Ease
                </Typography>
                <Box
                  component="img"
                  src={freeImage}
                  alt="Free"
                  sx={{ 
                    height: 60,
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                paragraph
                sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}
              >
                Create, track, and manage your projects all in one place. Stay organized and boost your productivity.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mt: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  fullWidth={false}
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
                  fullWidth={false}
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
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                component="img"
                src={kanbanImage}
                alt="Kanban Project Management"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={feature.title}>
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
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}; 