import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { UserList } from '../components/UserList';
import { useThemeContext } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserProfile {
  username: string;
  email: string;
}

export const Dashboard: React.FC = () => {
  useThemeContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('username, email')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        } catch (err) {
          console.error('Error loading profile:', err);
        }
      }
    };

    loadProfile();
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Welcome {profile?.username || user?.email?.split('@')[0] || 'User'} 👋
            </Typography>
            <UserList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 