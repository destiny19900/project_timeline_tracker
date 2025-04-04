import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Collapse,
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { motion } from 'framer-motion';
import type { Project, Task } from '../types';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';

const StatusSelect = styled(Select)(({ theme }) => ({
  minWidth: 120,
  '& .MuiSelect-select': {
    padding: theme.spacing(1),
  },
}));

const PrioritySelect = styled(Select)(({ theme }) => ({
  minWidth: 120,
  '& .MuiSelect-select': {
    padding: theme.spacing(1),
  },
}));

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'success';
  }
};

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(true);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        const fetchedProject = await projectService.getProjectById(projectId);
        setProject(fetchedProject);
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleUpdateProject = async (field: string, value: any) => {
    if (!project || !projectId) return;

    try {
      const updatedProject = await projectService.updateProject({
        ...project,
        [field]: value,
      });
      setProject(updatedProject);
      setIsEditing(null);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project');
    }
  };

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    if (!project) return;

    try {
      const taskToUpdate = project.tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = await projectService.updateTask({
        ...taskToUpdate,
        completed: completed,
        status: completed ? 'completed' : 'todo',
        projectId: project.id,
        createdAt: taskToUpdate.createdAt,
        updatedAt: new Date().toISOString(),
        subtasks: taskToUpdate.subtasks || []
      });

      setProject({
        ...project,
        tasks: project.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task status');
    }
  };

  const handleTaskUpdate = async (taskId: string, field: keyof Task, value: any) => {
    if (!project) return;

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const originalTask = project.tasks[taskIndex];

    // Optimistic UI update
    const updatedTasksOptimistic = [...project.tasks];
    updatedTasksOptimistic[taskIndex] = {
      ...originalTask,
      [field]: value,
      updatedAt: new Date().toISOString() // Update timestamp optimistically
    };

    setProject(prevProject => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        tasks: updatedTasksOptimistic,
      };
    });

    try {
      // Prepare data for the service call (ensure all required fields are present if needed)
      const taskDataForUpdate = {
        ...originalTask, // Use original task data as base
        [field]: value,   // Apply the specific change
        updatedAt: new Date().toISOString(), // Ensure this matches optimistic update
        // Ensure required fields are included if the service expects the full object
        projectId: project.id,
        createdAt: originalTask.createdAt, // Keep original createdAt
        subtasks: originalTask.subtasks || [], // Keep subtasks
        // Add other fields from Task type if necessary for updateTask method
        title: originalTask.title,
        description: originalTask.description,
        completed: field === 'status' ? (value === 'completed') : originalTask.completed, // Update completed based on status change
        priority: field === 'priority' ? value : originalTask.priority,
        status: field === 'status' ? value : originalTask.status,
        orderIndex: originalTask.orderIndex,
        startDate: originalTask.startDate,
        endDate: originalTask.endDate,
        assignedTo: originalTask.assignedTo,
        parentId: originalTask.parentId,
      };

      // Update the task in the database
      // Note: Ensure projectService.updateTask accepts the full Task object or adjust taskDataForUpdate accordingly
      const updatedTaskFromServer = await projectService.updateTask(taskDataForUpdate as Task);

      // Update the local state with the definitive data from the server
      setProject(prevProject => {
        if (!prevProject) return null;
        const finalTasks = [...prevProject.tasks];
        const serverTaskIndex = finalTasks.findIndex(t => t.id === taskId);
        if (serverTaskIndex !== -1) {
          finalTasks[serverTaskIndex] = updatedTaskFromServer;
        }
        return {
          ...prevProject,
          tasks: finalTasks,
        };
      });

    } catch (err) {
      console.error('Failed to update task:', err);
      setError(`Failed to update task ${field}`);
      // Rollback optimistic update on error
      setProject(prevProject => {
        if (!prevProject) return null;
        const revertedTasks = [...prevProject.tasks];
        const errorTaskIndex = revertedTasks.findIndex(t => t.id === taskId);
        if (errorTaskIndex !== -1) {
          revertedTasks[errorTaskIndex] = originalTask; // Revert to original task
        }
        return {
          ...prevProject,
          tasks: revertedTasks,
        };
      });
    }
  };

  const handleCompleteProject = async () => {
    if (!project || !projectId) return;

    try {
      // Update all tasks to completed
      const updatedTasks = await Promise.all(
        project.tasks.map(task =>
          projectService.updateTask(task.id, { status: 'completed' })
        )
      );

      // Update project status
      const updatedProject = await projectService.updateProject(projectId, {
        ...project,
        status: 'completed',
        tasks: updatedTasks,
      });

      setProject(updatedProject);
      setIsCompleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to complete project:', err);
      setError('Failed to complete project');
    }
  };

  const calculateProjectProgress = () => {
    if (!project || !project.tasks.length) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const getDeadlineWarning = () => {
    if (!project?.endDate) return null;
    const daysUntilDeadline = differenceInDays(new Date(project.endDate), new Date());
    
    if (daysUntilDeadline < 0) {
      return { severity: 'error', message: 'Project deadline has passed' };
    }
    if (daysUntilDeadline <= 3) {
      return { severity: 'warning', message: 'Project deadline is approaching' };
    }
    return null;
  };

  const handleAddTask = async () => {
    if (!project || !projectId) return;

    try {
      const newTaskData = {
        ...newTask,
        projectId: project.id,
        orderIndex: project.tasks.length,
        status: 'todo',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: []
      };

      const createdTask = await projectService.createTask(newTaskData);
      
      setProject({
        ...project,
        tasks: [...project.tasks, createdTask],
      });
      
      setIsTaskDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
      });
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Failed to add task');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
      </Box>
    );
  }

  const deadlineWarning = getDeadlineWarning();

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 2,
        px: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2 
        }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/app/projects')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to Projects
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsTaskDialogOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Task
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2 
        }}>
          <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
            {isEditing === 'title' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <IconButton onClick={() => handleUpdateProject('title', editValue)} color="primary">
                  <CheckIcon />
                </IconButton>
                <IconButton onClick={() => setIsEditing(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {project.title}
                <IconButton onClick={() => {
                  setEditValue(project.title);
                  setIsEditing('title');
                }}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => setIsCompleteDialogOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Complete Project
          </Button>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {isEditing === 'description' ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  autoFocus
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => handleUpdateProject('description', editValue)} variant="contained">
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(null)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary">
                  {project.description}
                </Typography>
                <IconButton onClick={() => {
                  setEditValue(project.description);
                  setIsEditing('description');
                }}>
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              label={`Status: ${project.status}`}
              color={project.status === 'completed' ? 'success' : 'primary'}
            />
            <Chip
              label={`Priority: ${project.priority}`}
              color={
                project.priority === 'high' ? 'error' :
                project.priority === 'medium' ? 'warning' : 'success'
              }
            />
          </Stack>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Start Date: {format(new Date(project.startDate), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End Date: {format(new Date(project.endDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          {deadlineWarning && showDeadlineWarning && (
            <Collapse in={showDeadlineWarning}>
              <Alert 
                severity={deadlineWarning.severity as 'error' | 'warning'}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setShowDeadlineWarning(false)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                {deadlineWarning.message}
              </Alert>
            </Collapse>
          )}

          <LinearProgress
            variant="determinate"
            value={calculateProjectProgress()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Paper>

        <Typography variant="h5" sx={{ mb: 2 }}>Tasks</Typography>
        {project.tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.checked)}
                  />
                  {isEditing === `task-title-${task.id}` ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      flex: 1,
                      minWidth: 0
                    }}>
                      <TextField
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        size="small"
                        fullWidth
                        autoFocus
                        sx={{ 
                          flex: 1,
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleTaskUpdate(task.id, 'title', editValue)}
                        color="primary"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setIsEditing(null)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="h6" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </Typography>
                  )}
                  {isEditing !== `task-title-${task.id}` && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditValue(task.title);
                        setIsEditing(`task-title-${task.id}`);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {isEditing !== `task-title-${task.id}` && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small">
                      <Select
                        value={task.status || 'todo'}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTaskUpdate(task.id, 'status', e.target.value as Task['status']);
                        }}
                        size="small"
                        sx={{
                          '& .MuiSelect-select': {
                            backgroundColor: (theme) => 
                              theme.palette[getStatusColor(task.status || 'todo')].light,
                            color: (theme) => 
                              theme.palette[getStatusColor(task.status || 'todo')].contrastText,
                          },
                        }}
                      >
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small">
                      <Select
                        value={task.priority || 'medium'}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTaskUpdate(task.id, 'priority', e.target.value as Task['priority']);
                        }}
                        size="small"
                        sx={{
                          '& .MuiSelect-select': {
                            backgroundColor: (theme) => 
                              theme.palette[getPriorityColor(task.priority || 'medium')].light,
                            color: (theme) => 
                              theme.palette[getPriorityColor(task.priority || 'medium')].contrastText,
                          },
                        }}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {task.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {task.startDate && (
                  <Typography variant="body2" color="text.secondary">
                    Start: {format(new Date(task.startDate), 'MMM dd, yyyy')}
                  </Typography>
                )}
                {task.endDate && (
                  <Typography variant="body2" color="text.secondary">
                    End: {format(new Date(task.endDate), 'MMM dd, yyyy')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </motion.div>
        ))}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing('title')}
          >
            Edit Project
          </Button>
        </Stack>

        <Dialog
          open={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTask.status}
                  label="Status"
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} variant="contained">Add Task</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isCompleteDialogOpen}
          onClose={() => setIsCompleteDialogOpen(false)}
        >
          <DialogTitle>Complete Project</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to mark this project as completed? This will mark all tasks as completed.
            </Typography>
            {project.tasks.some(task => task.status !== 'completed') && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Some tasks are still pending. Are you sure you want to complete the project?
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteProject} color="success">
              Complete Project
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}; 