import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { UserList } from '../components/UserList';

export const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <UserList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 