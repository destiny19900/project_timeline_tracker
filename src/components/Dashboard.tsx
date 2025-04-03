import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, LinearProgress, Chip, IconButton, Tooltip, Avatar, AvatarGroup, Grid, Container, Fab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import { CreateTaskModal } from './tasks/CreateTaskModal';
import { NewProjectForm } from './NewProjectForm';
import { projectService } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  width: '100%',
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
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.3)'
      : '0 8px 32px rgba(0,0,0,0.1)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: '20%',
    height: '60%',
    width: 1,
    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
}));

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Projects',
      value: '12',
      trend: '+2',
      trendUp: true,
      color: '#3b82f6',
    },
    {
      title: 'Active Tasks',
      value: '48',
      trend: '+5',
      trendUp: true,
      color: '#8b5cf6',
    },
    {
      title: 'Team Members',
      value: '8',
      trend: '+1',
      trendUp: true,
      color: '#10b981',
    },
    {
      title: 'Completed Tasks',
      value: '156',
      trend: '+12',
      trendUp: true,
      color: '#f59e0b',
    },
  ];

  const recentProjects = [
    {
      name: 'Website Redesign',
      progress: 75,
      status: 'In Progress',
      dueDate: '2024-03-15',
      team: [
        { name: 'John Doe', avatar: 'JD' },
        { name: 'Alice Miller', avatar: 'AM' },
        { name: 'Sarah King', avatar: 'SK' },
      ],
      priority: 'High',
    },
    {
      name: 'Mobile App Development',
      progress: 45,
      status: 'On Track',
      dueDate: '2024-04-01',
      team: [
        { name: 'John Doe', avatar: 'JD' },
        { name: 'Alice Miller', avatar: 'AM' },
      ],
      priority: 'Medium',
    },
    {
      name: 'Marketing Campaign',
      progress: 90,
      status: 'Almost Done',
      dueDate: '2024-03-10',
      team: [
        { name: 'Sarah King', avatar: 'SK' },
        { name: 'Alice Miller', avatar: 'AM' },
      ],
      priority: 'Low',
    },
  ];

  const upcomingTasks = [
    {
      title: 'Review Design Mockups',
      date: '2024-03-15',
      project: 'Website Redesign',
      priority: 'High',
    },
    {
      title: 'Client Meeting',
      date: '2024-03-16',
      project: 'Mobile App Development',
      priority: 'Medium',
    },
    {
      title: 'Content Review',
      date: '2024-03-17',
      project: 'Marketing Campaign',
      priority: 'Low',
    },
  ];

  const handleCreateTask = (taskData: any) => {
    console.log('Creating task:', taskData);
    // TODO: Implement task creation logic
  };

  const handleCreateProject = async (project: any) => {
    try {
      console.log('Creating project:', project);
      const newProject = await projectService.createProject({
        ...project,
        userId: user?.id || '',
      });
      console.log('Project created successfully:', newProject);
      setIsNewProjectFormOpen(false);
      // TODO: Refresh projects list
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <IconButton
          onClick={() => setIsNewProjectFormOpen(true)}
          sx={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Stats Overview */}
          <StatCard sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid item xs={6} sm={3} key={stat.title}>
                  <StatItem>
                    <Typography variant="h4" sx={{ color: stat.color, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                  </StatItem>
                </Grid>
              ))}
            </Grid>
          </StatCard>

          {/* Recent Projects */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Recent Projects
          </Typography>
          <Grid container spacing={2}>
            {recentProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.name}>
                <ProjectCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>{project.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip
                          label={project.priority}
                          size="small"
                          color={
                            project.priority === 'High'
                              ? 'error'
                              : project.priority === 'Medium'
                              ? 'warning'
                              : 'success'
                          }
                        />
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
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.progress}%
                        </Typography>
                      </Box>
                      <ProgressBar variant="determinate" value={project.progress} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AvatarGroup 
                        max={3}
                        sx={{
                          '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' }
                        }}
                      >
                        {project.team.map((member) => (
                          <Tooltip key={member.avatar} title={member.name}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {member.avatar}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </Box>
                  </Box>
                </ProjectCard>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon /> Upcoming Tasks
            </Typography>
            <Stack spacing={2}>
              {upcomingTasks.map((task) => (
                <Box key={task.title} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.project}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={
                        task.priority === 'High'
                          ? 'error'
                          : task.priority === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(task.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </StatCard>
        </Grid>
      </Grid>

      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <NewProjectForm
        open={isNewProjectFormOpen}
        onClose={() => setIsNewProjectFormOpen(false)}
        onProjectCreate={handleCreateProject}
      />
    </Container>
  );
}; 