import React from 'react';
import { Box, Typography, Paper, Stack, LinearProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: 140,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
  },
}));

const ProjectCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  },
}));

export const Dashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    { title: 'Total Projects', value: '12', trend: '+2', trendUp: true },
    { title: 'Active Tasks', value: '48', trend: '+5', trendUp: true },
    { title: 'Team Members', value: '8', trend: '+1', trendUp: true },
    { title: 'Completed Tasks', value: '156', trend: '-3', trendUp: false },
  ];

  const recentProjects = [
    {
      name: 'Website Redesign',
      progress: 75,
      status: 'In Progress',
      dueDate: '2024-03-15',
      team: ['JD', 'AM', 'SK'],
    },
    {
      name: 'Mobile App Development',
      progress: 45,
      status: 'On Track',
      dueDate: '2024-04-01',
      team: ['JD', 'AM'],
    },
    {
      name: 'Marketing Campaign',
      progress: 90,
      status: 'Almost Done',
      dueDate: '2024-03-10',
      team: ['SK', 'AM'],
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.title}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" color="text.secondary">
                {stat.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {stat.trendUp ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={stat.trendUp ? 'success.main' : 'error.main'}
                >
                  {stat.trend}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ mt: 2 }}>
              {stat.value}
            </Typography>
          </StatCard>
        ))}
      </Box>

      {/* Recent Projects */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recent Projects
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {recentProjects.map((project) => (
          <ProjectCard key={project.name}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6">{project.name}</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Stack spacing={1}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.progress}%
                  </Typography>
                </Box>
                <ProgressBar variant="determinate" value={project.progress} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {project.team.map((member) => (
                    <Chip
                      key={member}
                      label={member}
                      size="small"
                      sx={{ bgcolor: theme.palette.primary.light, color: 'primary.contrastText' }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Due {new Date(project.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Chip
                label={project.status}
                size="small"
                color={
                  project.status === 'Almost Done'
                    ? 'success'
                    : project.status === 'In Progress'
                    ? 'primary'
                    : 'info'
                }
              />
            </Stack>
          </ProjectCard>
        ))}
      </Box>
    </Box>
  );
}; 