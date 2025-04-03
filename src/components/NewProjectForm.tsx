import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Task } from '../types';
import { projectService } from '../services/projectService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NewProjectFormProps {
  open: boolean;
  onClose: () => void;
  onProjectCreate: (project: Project) => void;
}

export const NewProjectForm: React.FC<NewProjectFormProps> = ({
  open,
  onClose,
  onProjectCreate,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    tasks: [
      {
        title: '',
        description: '',
        assignedTo: null as string | null,
        status: 'todo' as const,
        priority: 'medium' as const,
        startDate: null as string | null,
        endDate: null as string | null,
        orderIndex: 0,
        parentId: null as string | null,
        completed: false,
      },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log('Starting form submission...');
    console.log('Current form data:', formData);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, ensure the user exists in the users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw userError;
      }

      if (!existingUser) {
        // Create user profile if it doesn't exist
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            email: user.email || '',
            created_at: new Date().toISOString(),
          });

        if (createUserError) throw createUserError;
      }

      console.log('Preparing project data...');
      const projectData = {
        ...formData,
        userId: user.id,
        tasks: formData.tasks.map(task => ({
          ...task,
          assignedTo: user.id,
        })),
      };
      console.log('Project data to be sent:', projectData);

      console.log('Calling projectService.createProject...');
      const newProject = await projectService.createProject(projectData);
      console.log('Project created successfully:', newProject);

      setSuccess(true);
      onProjectCreate(newProject);
      setTimeout(() => {
        onClose();
        navigate('/app/projects');
      }, 1500);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: '',
          description: '',
          assignedTo: null,
          status: 'todo',
          priority: 'medium',
          startDate: null,
          endDate: null,
          orderIndex: prev.tasks.length,
          parentId: null,
          completed: false,
        },
      ],
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const updateTask = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      ),
    }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '70vh',
            m: 0,
            borderRadius: '16px 16px 0 0',
          },
        }}
        TransitionComponent={motion.div}
        TransitionProps={{
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { type: 'spring', damping: 25, stiffness: 200 }
        }}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Project Title"
                value={formData.title}
                onChange={(e) => {
                  console.log('Project title changed:', e.target.value);
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                }}
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => {
                  console.log('Project description changed:', e.target.value);
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                }}
                multiline
                rows={3}
                fullWidth
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => {
                      console.log('Project status changed:', e.target.value);
                      setFormData(prev => ({ ...prev, status: e.target.value as any }));
                    }}
                  >
                    <MenuItem value="not_started">Not Started</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    console.log('Start date changed:', e.target.value);
                    setFormData(prev => ({ ...prev, startDate: e.target.value }));
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    console.log('End date changed:', e.target.value);
                    setFormData(prev => ({ ...prev, endDate: e.target.value }));
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Tasks</Typography>
                  <IconButton onClick={addTask} color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>

                <AnimatePresence>
                  {formData.tasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              label={`Task ${index + 1} Title`}
                              value={task.title}
                              onChange={(e) => updateTask(index, 'title', e.target.value)}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                            <TextField
                              label="Description"
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              multiline
                              rows={2}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                              <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                  value={task.status}
                                  label="Status"
                                  onChange={(e) => updateTask(index, 'status', e.target.value)}
                                >
                                  <MenuItem value="todo">To Do</MenuItem>
                                  <MenuItem value="in_progress">In Progress</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                  <MenuItem value="blocked">Blocked</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => removeTask(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Project created successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}; 