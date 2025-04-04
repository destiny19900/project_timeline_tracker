import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';
import { supabase } from '../lib/supabase';

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    textAlign: 'left',
    alignItems: 'flex-start',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  height: '100%',
}));

interface ActivityItem {
  id: string;
  type: 'task' | 'project';
  action: 'completed' | 'created' | 'updated';
  projectId: string;
  projectTitle: string;
  taskTitle?: string;
  timestamp: Date;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [highPriorityTasksCount, setHighPriorityTasksCount] = useState(0);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user metadata including created_at
        if (user?.id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('created_at')
            .eq('id', user.id)
            .single();
            
          if (userData) {
            setUserCreatedAt(userData.created_at);
          } else if (userError) {
            console.error('Error fetching user data:', userError);
            // Fallback to account creation date from auth if available
            setUserCreatedAt(user.created_at || null);
          }
        }
        
        const userProjects = await projectService.getProjects();
        
        setProjects(userProjects);
        
        // Calculate stats
        const completed = userProjects.filter(p => p.status === 'completed').length;
        const allTasks = userProjects.flatMap(p => p.tasks || []);
        const completedTasks = allTasks.filter(t => t.status === 'completed').length;
        
        // Count high priority tasks that are not completed
        const highPriorityTasks = allTasks.filter(
          t => t.priority === 'high' && t.status !== 'completed' && !t.completed
        );
        setHighPriorityTasksCount(highPriorityTasks.length);
        
        setStats({
          totalProjects: userProjects.length,
          completedProjects: completed,
          totalTasks: allTasks.length,
          completedTasks: completedTasks,
        });
        
        // Generate real recent activity from projects and tasks
        const activities: ActivityItem[] = [];
        
        // Add project creation activities
        userProjects.forEach(project => {
          activities.push({
            id: `project-${project.id}`,
            type: 'project',
            action: 'created',
            projectId: project.id,
            projectTitle: project.title,
            timestamp: new Date(project.createdAt)
          });
          
          // Add task activities from each project
          (project.tasks || []).forEach(task => {
            // Add task completion activities
            if (task.completed) {
              activities.push({
                id: `task-completed-${task.id}`,
                type: 'task',
                action: 'completed',
                projectId: project.id,
                projectTitle: project.title,
                taskTitle: task.title,
                timestamp: new Date(task.updatedAt || task.createdAt)
              });
            }
            
            // Add task creation/update activities (if not same as completion)
            if (!task.completed || new Date(task.createdAt).getTime() !== new Date(task.updatedAt || task.createdAt).getTime()) {
              activities.push({
                id: `task-updated-${task.id}`,
                type: 'task',
                action: 'updated',
                projectId: project.id,
                projectTitle: project.title,
                taskTitle: task.title,
                timestamp: new Date(task.createdAt)
              });
            }
          });
        });
        
        // Sort activities by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Take the most recent 10 activities
        setRecentActivity(activities.slice(0, 10));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const formatActivityTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return format(timestamp, 'MMM d, yyyy');
    }
  };
  
  const getProgressColor = (value: number) => {
    if (value < 30) return 'error';
    if (value < 70) return 'warning';
    return 'success';
  };

  // Format the created_at date to a readable format
  const formatMemberSince = () => {
    if (!userCreatedAt) return 'Unknown';
    return format(new Date(userCreatedAt), 'MMMM d, yyyy');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading profile data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          height: 120, 
          bgcolor: 'primary.main', 
          position: 'relative',
          borderRadius: '8px 8px 0 0'
        }} />
        
        <ProfileHeader>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: 0.5,
                }}
              >
                <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </Box>
            }
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                bgcolor: 'secondary.main',
                border: '4px solid white',
                marginTop: '-50px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Badge>
          
          <Box sx={{ ml: { sm: 3 }, mt: { xs: 2, sm: 0 }, flex: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {user?.email || 'user@example.com'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Project Manager | Active since {formatMemberSince()}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              size="small"
            >
              Edit Profile
            </Button>
          </Box>
        </ProfileHeader>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Projects
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ my: 1 }}>
                {stats.totalProjects}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.completedProjects / Math.max(1, stats.totalProjects) * 100} 
                color={getProgressColor(stats.completedProjects / Math.max(1, stats.totalProjects) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.completedProjects} completed
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Tasks
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ my: 1 }}>
                {stats.totalTasks}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.completedTasks / Math.max(1, stats.totalTasks) * 100} 
                color={getProgressColor(stats.completedTasks / Math.max(1, stats.totalTasks) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.completedTasks} completed
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                My Priority
              </Typography>
              {highPriorityTasksCount > 0 ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      H
                    </Avatar>
                    <Typography variant="body1" fontWeight={500}>
                      High Priority Tasks
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    You have <strong>{highPriorityTasksCount} {highPriorityTasksCount === 1 ? 'task' : 'tasks'}</strong> that need your attention
                  </Typography>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100px', alignItems: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No high priority tasks
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Latest Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentActivity.length > 0 ? (
                  <>
                    <Typography variant="body1" fontWeight={500} noWrap>
                      {recentActivity[0].type === 'task' 
                        ? `Task ${recentActivity[0].action}` 
                        : `Project ${recentActivity[0].action}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {recentActivity[0].projectTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatActivityTime(recentActivity[0].timestamp)}
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100px', alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            {recentActivity.length > 0 ? (
              <>
                <List>
                  {recentActivity.slice(0, 3).map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: activity.type === 'task' 
                                ? (activity.action === 'completed' ? 'success.main' : 'info.main') 
                                : 'primary.main' 
                            }}
                          >
                            {activity.type === 'task' 
                              ? (activity.action === 'completed' ? <CheckCircleIcon /> : <AccessTimeIcon />) 
                              : <AssignmentIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={500}>
                              {activity.type === 'task' 
                                ? (activity.action === 'completed' 
                                  ? `Completed task "${activity.taskTitle}"` 
                                  : `Updated task "${activity.taskTitle}"`) 
                                : `Created project "${activity.projectTitle}"`}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                in {activity.projectTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatActivityTime(activity.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
                {recentActivity.length > 3 && (
                  <Button 
                    fullWidth
                    sx={{ mt: 1 }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    View all activities
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '150px', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No recent activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Activity will appear here as you create and complete tasks
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              My Projects
            </Typography>
            <List>
              {projects.slice(0, 3).map((project) => (
                <ListItem 
                  key={project.id} 
                  sx={{ 
                    px: 2, 
                    py: 1.5, 
                    borderRadius: 1, 
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {project.title.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={project.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={project.status} 
                          size="small" 
                          color={project.status === 'completed' ? 'success' : 'primary'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {project.tasks?.length || 0} tasks
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {projects.length > 3 && (
              <Button 
                fullWidth
                sx={{ mt: 1 }}
                endIcon={<ArrowForwardIcon />}
              >
                View all projects
              </Button>
            )}
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account Info
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{user?.email || 'user@example.com'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Member Since</Typography>
              <Typography variant="body1">{formatMemberSince()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Last Login</Typography>
              <Typography variant="body1">{format(new Date(), 'MMM d, yyyy')}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 