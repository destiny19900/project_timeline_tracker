import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Tooltip, Legend } from 'recharts';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { DashboardData } from '../../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'default';
    case 'in_progress':
      return 'primary';
    case 'completed':
      return 'success';
    case 'blocked':
      return 'error';
    default:
      return 'default';
  }
};

export const DashboardContent: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
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
      <Grid container spacing={3}>
        {/* Task Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            {dashboardData.taskDistribution.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {dashboardData.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body1" color="text.secondary">
                  No tasks available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Projects
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentProjects.length > 0 ? (
                    dashboardData.recentProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          {project.title.length > 15
                            ? project.title.substring(0, 15) + '...'
                            : project.title}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={project.status}
                            color={getStatusColor(project.status) as any}
                          />
                        </TableCell>
                        <TableCell>{project.tasks.length}</TableCell>
                        <TableCell>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No projects available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
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
                        <TableCell>
                          {(dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-').length > 12
                            ? (dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-').substring(0, 12) + '...'
                            : (dashboardData.recentProjects.find(p => p.id === task.projectId)?.title || '-')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.status}
                            color={getStatusColor(task.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.priority}
                            color={
                              task.priority === 'high'
                                ? 'error'
                                : task.priority === 'medium'
                                ? 'warning'
                                : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell>{format(new Date(task.createdAt), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No tasks available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 