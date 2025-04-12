import React, { useState } from 'react';
import { Box, Container, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Menu, MenuItem, useTheme, useMediaQuery, Drawer } from '@mui/material';
import { Add as AddIcon, AutoAwesome as AIIcon, Edit as EditIcon, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useCustomTheme } from '../hooks/useTheme';
import { useProjects } from '../hooks/useProjects';
import ThemeToggle from './ThemeToggle';
import { ProjectTimeline } from './ProjectTimeline';
import { NewProjectForm } from './NewProjectForm';
import { Sidebar } from './Sidebar';
import AnimatedBackground from './AnimatedBackground';
import AnimatedLogo from './AnimatedLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AppContent: React.FC = () => {
  const { mode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeProject, createProject, updateTaskStatus } = useProjects();
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);
  const [isProjectTypeDialogOpen, setIsProjectTypeDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AnimatedBackground />
      
      {/* Sidebar - Only permanent on desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            },
          }}
        >
          <Sidebar />
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: 'none',
            },
          }}
        >
          <Sidebar />
        </Drawer>
      )}
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: '100%',
        ml: { xs: 0, md: `240px` } 
      }}>
        <AppBar 
          position="fixed"
          elevation={0}
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'rgba(17, 25, 40, 0.75)'
              : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)',
            borderBottom: 1,
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            height: '64px',
            borderRadius: 0,
            left: { xs: 0, md: '240px' },
            right: 0,
            width: { xs: '100%', md: 'calc(100% - 240px)' },
            zIndex: 1100
          }}
        >
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            height: '100%',
            px: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setSidebarOpen(true)}
                sx={{ 
                  display: { xs: 'inline-flex', md: 'none' }
                }}
              >
                <MenuIcon />
              </IconButton>
              <AnimatedLogo />
            </Box>
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
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
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
      </Box>

      <Dialog 
        open={isProjectTypeDialogOpen} 
        onClose={() => setIsProjectTypeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
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
        onProjectCreate={handleCreateProject}
      />
    </Box>
  );
};