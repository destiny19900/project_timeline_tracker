import React, { useState } from 'react';
import { Box, Container, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, AutoAwesome as AIIcon, Edit as EditIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useProjects } from '../hooks/useProjects';
import ThemeToggle from './ThemeToggle';
import { ProjectTimeline } from './ProjectTimeline';
import { NewProjectForm } from './NewProjectForm';
import AnimatedBackground from './AnimatedBackground';
import AnimatedLogo from './AnimatedLogo';

export const AppContent: React.FC = () => {
  const { themeMode } = useTheme();
  const { projects, activeProject, createProject, updateTaskStatus, selectProject } = useProjects();
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);
  const [isProjectTypeDialogOpen, setIsProjectTypeDialogOpen] = useState(false);

  const handleCreateProject = async (project: any) => {
    try {
      await createProject(project);
      setIsNewProjectFormOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (activeProject) {
      try {
        await updateTaskStatus(activeProject.id, taskId, { completed });
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleNewProjectClick = () => {
    setIsProjectTypeDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnimatedBackground />
      
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'transparent',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            height: '64px',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', height: '100%' }}>
              <AnimatedLogo />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeToggle />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewProjectClick}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      },
                    }}
                  >
                    New Project
                  </Button>
                </motion.div>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </motion.div>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <AnimatePresence mode="wait">
          {activeProject ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectTimeline
                project={activeProject}
                onTaskToggle={handleTaskToggle}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60vh',
                  textAlign: 'center',
                  gap: 3,
                }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  Welcome to Project Timeline Tracker
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Create a new project to get started
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={handleNewProjectClick}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      },
                    }}
                  >
                    Create New Project
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <Dialog 
        open={isProjectTypeDialogOpen} 
        onClose={() => setIsProjectTypeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          }
        }}
      >
        <DialogTitle>Choose Project Creation Method</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => {
                setIsProjectTypeDialogOpen(false);
                setIsNewProjectFormOpen(true);
              }}
              sx={{ py: 2 }}
            >
              Create Project Manually
            </Button>
            <Button
              startIcon={<AIIcon />}
              variant="outlined"
              onClick={() => {
                setIsProjectTypeDialogOpen(false);
                // TODO: Implement AI project generation
              }}
              sx={{ py: 2 }}
            >
              Generate with AI
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsProjectTypeDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <NewProjectForm
        open={isNewProjectFormOpen}
        onClose={() => setIsNewProjectFormOpen(false)}
        onSubmit={handleCreateProject}
      />
    </Box>
  );
}; 