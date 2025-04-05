import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompletedIcon,
  Folder as ProjectIcon,
  Article as DocumentIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

export const DashboardContent: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    activeTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    recentProjects: [],
    taskDistribution: [],
    recentTasks: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all projects for the current user
        const projects = await projectService.getProjects();
        
        // Extract all tasks from all projects
        const allTasks = projects.flatMap(project => project.tasks);
        
        // Count active tasks (not completed or blocked)
        const activeTasks = allTasks.filter(task => 
          task.status !== 'completed' && task.status !== 'blocked'
        ).length;
        
        // Count completed tasks
        const completedTasks = allTasks.filter(task => 
          task.status === 'completed'
        ).length;
        
        // Task distribution for pie chart
        const todoTasks = allTasks.filter(task => task.status === 'todo').length;
        const inProgressTasks = allTasks.filter(task => task.status === 'in_progress').length;
        
        const taskDistribution = [
          { name: 'To Do', value: todoTasks, color: theme.palette.info.light },
          { name: 'In Progress', value: inProgressTasks, color: theme.palette.warning.light },
          { name: 'Completed', value: completedTasks, color: theme.palette.success.light },
        ];
        
        // Get recent projects (up to 5)
        const recentProjects = [...projects]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
          
        // Get recent tasks (up to 5)
        const recentTasks = [...allTasks]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setDashboardData({
          activeTasks,
          completedTasks,
          totalProjects: projects.length,
          recentProjects,
          taskDistribution,
          recentTasks
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, theme.palette]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'blocked':
        return 'error';
      case 'todo':
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <TaskIcon />
          </Box>
          <Box>
            <Typography variant="h6">{dashboardData.activeTasks}</Typography>
            <Typography color="textSecondary">Active Tasks</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.main',
            }}
          >
            <CompletedIcon />
          </Box>
          <Box>
            <Typography variant="h6">{dashboardData.completedTasks}</Typography>
            <Typography color="textSecondary">Completed Tasks</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'info.light',
              color: 'info.main',
            }}
          >
            <ProjectIcon />
          </Box>
          <Box>
            <Typography variant="h6">{dashboardData.totalProjects}</Typography>
            <Typography color="textSecondary">Total Projects</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'warning.light',
              color: 'warning.main',
            }}
          >
            <TimeIcon />
          </Box>
          <Box>
            <Typography variant="h6">
              {Math.round(
                (dashboardData.completedTasks /
                  (dashboardData.activeTasks + dashboardData.completedTasks || 1)) *
                  100
              )}%
            </Typography>
            <Typography color="textSecondary">Completion Rate</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2, height: 400, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Task Distribution
          </Typography>
          {dashboardData.taskDistribution.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={dashboardData.taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
              <Typography color="textSecondary">No task data available</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Recent Projects
          </Typography>
          {dashboardData.recentProjects.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell sx={{ 
                        maxWidth: { xs: '120px', sm: '180px' }, 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {project.title.length > 15 
                          ? project.title.substring(0, 15) + '...' 
                          : project.title}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{project.tasks.length}</TableCell>
                      <TableCell>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No projects available</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Task Table */}
      <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <TableContainer>
          <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
            Recent Tasks
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.recentTasks.length > 0 ? (
                dashboardData.recentTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell sx={{ 
                      maxWidth: { xs: '80px', sm: '150px' }, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {(dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-').length > 12
                        ? (dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-').substring(0, 12) + '...'
                        : (dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={
                          task.priority === 'high' 
                            ? 'error' 
                            : task.priority === 'medium' 
                              ? 'warning' 
                              : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{format(new Date(task.createdAt), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary" sx={{ py: 2 }}>
                      No tasks available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}; 