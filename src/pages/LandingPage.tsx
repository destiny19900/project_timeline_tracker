import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Link } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AnimatedLogo from '../components/AnimatedLogo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', py: 8, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Hero Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedLogo />
              <Typography variant="h3" component="h1" sx={{ mt: 2, mb: 3, fontWeight: 700 }}>
                Organize Your Projects with AI
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Create, manage, and track your projects with intelligent task management and AI-powered project generation.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
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
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <TimelineIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        Visual Project Timeline
                      </Typography>
                      <Typography color="text.secondary">
                        Track your project progress with an intuitive timeline view
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        AI-Powered Project Generation
                      </Typography>
                      <Typography color="text.secondary">
                        Let AI help you structure your projects and tasks
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 40, color: '#10b981' }} />
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        Secure & Private
                      </Typography>
                      <Typography color="text.secondary">
                        Your data is encrypted and stored securely
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          mt: 4, 
          borderTop: 1, 
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            Made with <FavoriteIcon sx={{ color: 'error.main', fontSize: '1rem' }} /> by Buildera.dev
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contact us: <Link href="mailto:contact@buildera.dev" color="primary">contact@buildera.dev</Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 