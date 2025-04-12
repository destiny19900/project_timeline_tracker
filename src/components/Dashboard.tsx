import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, LinearProgress, Chip, IconButton, Avatar, Grid, Container, CircularProgress, Switch, FormControlLabel, Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Bolt as AIIcon } from '@mui/icons-material';
import { CreateTaskModal } from './tasks/CreateTaskModal';
import { NewProjectForm } from './NewProjectForm';
import { AIProjectForm } from './AIProjectForm';
import { projectService } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

interface ProjectItem {
  id: string;
  name: string;
  progress: number;
  status: string;
  dueDate: string | null;
  priority: string;
  team: Array<{ name: string; avatar: string }>;
}

interface TaskItem {
  title: string;
  date: string | null;
  project: string;
  priority: string;
}

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);
  const [isAIProjectFormOpen, setIsAIProjectFormOpen] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalProjects: number;
    activeTasks: number;
    teamMembers: number;
    completedTasks: number;
    recentProjects: ProjectItem[];
    upcomingTasks: TaskItem[];
  }>({
    totalProjects: 0,
    activeTasks: 0,
    teamMembers: 1, // Hardcoded
    completedTasks: 0,
    recentProjects: [],
    upcomingTasks: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching dashboard data...');
        // Fetch all projects for the current user
        const projects = await projectService.getProjects();
        console.log('Projects fetched:', projects.length);
        
        // Extract all tasks from all projects
        const allTasks = projects.flatMap(project => project.tasks);
        console.log('Total tasks:', allTasks.length);
        
        // Count active tasks (not completed or blocked)
        const activeTasks = allTasks.filter(task => 
          task.status !== 'completed' && task.status !== 'blocked'
        ).length;
        
        // Count completed tasks
        const completedTasks = allTasks.filter(task => 
          task.status === 'completed'
        ).length;
        
        // Get recent projects (up to 3)
        const recentProjects = [...projects]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map(project => {
            // Calculate project progress based on completed tasks
            const projectTasks = project.tasks || [];
            const completed = projectTasks.filter(task => task.status === 'completed').length;
            const progress = projectTasks.length > 0 
              ? Math.round((completed / projectTasks.length) * 100) 
              : 0;
            
            return {
              id: project.id,
              name: project.title,
              progress,
              status: project.status,
              dueDate: project.endDate,
              priority: project.priority,
              team: [{ name: 'User', avatar: 'U' }] // Single team member placeholder
            };
          });
        
        // Get upcoming tasks based on endDate (up to 3)
        const upcomingTasks = [...allTasks]
          .filter(task => task.status !== 'completed' && task.endDate)
          .sort((a, b) => {
            const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
            const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
            return dateA - dateB;
          })
          .slice(0, 3)
          .map(task => {
            const project = projects.find(p => p.id === task.projectId);
            return {
              title: task.title,
              date: task.endDate,
              project: project?.title || 'Unknown',
              priority: task.priority
            };
          });
        
        setDashboardData({
          totalProjects: projects.length,
          activeTasks,
          teamMembers: 1, // Hardcoded to 1 as requested
          completedTasks,
          recentProjects,
          upcomingTasks
        });
        
        console.log('Dashboard data updated:', {
          totalProjects: projects.length,
          activeTasks,
          teamMembers: 1,
          completedTasks
        });
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCreateTask = (taskData: any) => {
    console.log('Creating task:', taskData);
    // TODO: Implement task creation logic
  };

  const handleCreateProject = async (project: any) => {
    try {
      console.log('Creating project:', project);
      
      if (useAI) {
        // AI-assisted project creation is now handled by AIProjectForm
        console.log('Using AI to enhance project creation');
        setIsAIProjectFormOpen(true);
      } else {
        // Regular project creation
        const newProject = await projectService.createProject({
          ...project,
          userId: user?.id || '',
        });
        console.log('Project created successfully:', newProject);
        
        setIsNewProjectFormOpen(false);
        // Refresh the dashboard data
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
  };

  const getProjectInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Create stats array from actual data
  const stats = [
    {
      title: 'Total Projects',
      value: dashboardData.totalProjects.toString(),
      trend: '+0',
      trendUp: true,
      color: '#3b82f6',
    },
    {
      title: 'Active Tasks',
      value: dashboardData.activeTasks.toString(),
      trend: '+0',
      trendUp: true,
      color: '#8b5cf6',
    },
    {
      title: 'Team Members',
      value: dashboardData.teamMembers.toString(),
      trend: '+0',
      trendUp: true,
      color: '#10b981',
    },
    {
      title: 'Completed Tasks',
      value: dashboardData.completedTasks.toString(),
      trend: '+0',
      trendUp: true,
      color: '#f59e0b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Welcome {user?.email?.split('@')[0] || 'User'} 👋
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                color="primary"
              />
            }
            label={useAI ? "AI Assist" : "Manual"}
            sx={{ mr: 1 }}
          />

          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <IconButton
              onClick={() => useAI ? setIsAIProjectFormOpen(true) : setIsNewProjectFormOpen(true)}
              sx={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                color: 'white',
                transition: 'transform 0.3s, background 0.3s',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  transform: 'translateY(-4px)',
                },
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                position: 'relative',
                p: 1.5,
              }}
            >
              {useAI ? <AIIcon /> : <AddIcon />}
            </IconButton>
          </Zoom>
        </Box>
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Projects
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardData.recentProjects.length > 0 ? (
              dashboardData.recentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard 
                    onClick={() => handleProjectClick(project.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="h6" 
                        noWrap 
                        sx={{ 
                          maxWidth: { xs: '180px', sm: '65%' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        {project.name.length > 18 
                          ? project.name.substring(0, 18) + '...' 
                          : project.name}
                      </Typography>
                      <Chip
                        label={project.priority}
                        size="small"
                        color={
                          project.priority === 'high' ? 'error' :
                          project.priority === 'medium' ? 'warning' : 'success'
                        }
                      />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {project.progress}% Complete
                      </Typography>
                      <ProgressBar variant="determinate" value={project.progress} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.dueDate ? format(new Date(project.dueDate), 'MMM dd') : 'No date'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem',
                            bgcolor: theme.palette.primary.main 
                          }}
                        >
                          {getProjectInitials(project.name)}
                        </Avatar>
                        <Chip
                          label={project.status}
                          size="small"
                          color={
                            project.status === 'completed' ? 'success' :
                            project.status === 'in_progress' ? 'warning' : 'info'
                          }
                        />
                      </Box>
                    </Box>
                  </ProjectCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No projects available</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Upcoming Tasks */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upcoming Tasks
          </Typography>
          <Paper sx={{ p: 2 }}>
            {dashboardData.upcomingTasks.length > 0 ? (
              <Stack spacing={2}>
                {dashboardData.upcomingTasks.map((task, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    }}
                  >
                    <Typography variant="subtitle1">{task.title}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {task.project}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'high' ? 'error' :
                            task.priority === 'medium' ? 'warning' : 'success'
                          }
                        />
                        <Typography variant="body2" color="text.secondary">
                          {task.date ? format(new Date(task.date), 'MMM dd') : 'No date'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No upcoming tasks</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* New Project Form */}
      <NewProjectForm
        open={isNewProjectFormOpen}
        onClose={() => setIsNewProjectFormOpen(false)}
        onProjectCreate={handleCreateProject}
      />
      
      {/* AI Project Form */}
      <AIProjectForm
        open={isAIProjectFormOpen}
        onClose={() => setIsAIProjectFormOpen(false)}
        onSuccess={() => {
          // Refresh dashboard data after creating an AI project
          window.location.reload();
        }}
      />
    </Container>
  );
}; 