import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const ComingSoonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
  textAlign: 'center',
  maxWidth: 800,
  margin: '0 auto',
}));

const TeamIcon = styled(RocketLaunchIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.spacing(1),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  marginBottom: theme.spacing(2),
}));

const Team: React.FC = () => {
  const upcomingFeatures = [
    {
      title: 'Team Collaboration',
      description: 'Work together with your team on projects. Share tasks, assign responsibilities, and track progress together.',
      icon: <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    },
    {
      title: 'User Invitations',
      description: 'Invite new team members to join your workspace. Set permissions and access levels for different users.',
      icon: <GroupAddIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    },
    {
      title: 'Real-time Notifications',
      description: 'Get instant updates when team members make changes to shared projects or complete assigned tasks.',
      icon: <RocketLaunchIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <ComingSoonContainer>
        <TeamIcon />
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Team Feature Coming Soon! 🚀
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
          We're working hard to bring you powerful team collaboration features. Stay tuned for updates!
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2,
            mb: 6,
          }}
        >
          Get Notified When Ready
        </Button>
        
        <Grid container spacing={4}>
          {upcomingFeatures.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </ComingSoonContainer>
    </Box>
  );
};

export default Team; 