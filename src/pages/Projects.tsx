import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { NewProjectForm } from '../components/NewProjectForm';
import { projectService } from '../services/projectService';
import type { Project } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'on_hold':
      return 'warning';
    default:
      return 'default';
  }
};

const ProjectCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
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

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await projectService.getProjects();
        setProjects(fetchedProjects);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectCreate = async (project: Project) => {
    try {
      await projectService.createProject(project);
      const updatedProjects = await projectService.getProjects();
      setProjects(updatedProjects);
      setIsNewProjectFormOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsNewProjectFormOpen(true)}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {project.title}
                    </Typography>
                    <Chip
                      label={project.status}
                      size="small"
                      color={
                        project.status === 'completed' ? 'success' :
                        project.status === 'in_progress' ? 'warning' : 'default'
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {project.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      label={project.priority}
                      size="small"
                      color={
                        project.priority === 'high' ? 'error' :
                        project.priority === 'medium' ? 'warning' : 'success'
                      }
                    />
                    <Chip
                      label={`${project.tasks.length} tasks`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {project.startDate} - {project.endDate}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </ProjectCard>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 5, 
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No projects available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Create your first project by clicking the "New Project" button above
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsNewProjectFormOpen(true)}
              >
                Create New Project
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      <NewProjectForm
        open={isNewProjectFormOpen}
        onClose={() => setIsNewProjectFormOpen(false)}
      />
    </Box>
  );
}; 