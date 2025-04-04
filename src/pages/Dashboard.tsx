import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { UserList } from '../components/UserList';
import { useThemeContext } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Welcome {user?.displayName || user?.email?.split('@')[0] || 'User'} 👋
            </Typography>
            <UserList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 