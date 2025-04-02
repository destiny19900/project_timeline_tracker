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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';

interface NewProjectFormProps {
  open: boolean;
  onClose: () => void;
  onProjectCreate: (project: Project) => Promise<void>;
}

export const NewProjectForm: React.FC<NewProjectFormProps> = ({
  open,
  onClose,
  onProjectCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<{ title: string; description: string }[]>([]);

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', description: '' }]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: title,
      description,
      status: 'Not Started',
      priority: 'Medium',
      dueDate: new Date().toISOString(),
      progress: 0,
      team: [],
      tasks: tasks.map(task => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: task.title,
        description: task.description,
        status: 'Todo',
        priority: 'Medium',
        dueDate: new Date().toISOString(),
        assignedTo: '',
        projectId: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: []
      }))
    };

    await onProjectCreate(newProject);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTasks([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>Create New Project</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Project Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Box sx={{ mt: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Tasks</Typography>
              <IconButton onClick={handleAddTask} color="primary">
                <AddIcon />
              </IconButton>
            </Box>

            <AnimatePresence>
              {tasks.map((task, index) => (
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
                    <Box display="flex" alignItems="center" gap={2}>
                      <TextField
                        label={`Task ${index + 1} Title`}
                        fullWidth
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        required
                      />
                      <IconButton
                        onClick={() => handleRemoveTask(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      label="Task Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={task.description}
                      onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!title || !description || tasks.length === 0}
          >
            Create Project
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 