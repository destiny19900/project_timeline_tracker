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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Checkbox,
  Collapse,
  Container,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { motion } from 'framer-motion';
import type { Project, Task } from '../types';
import { format, differenceInDays } from 'date-fns';



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
    status: 'todo',
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
    
    console.log('TASK UPDATE START:', { 
      taskId, 
      field, 
      value, 
      originalStatus: originalTask.status,
      originalPriority: originalTask.priority,
      originalCompleted: originalTask.completed
    });

    // Create a copy of the task with the updated field
    const updatedTask = {
      ...originalTask,
      [field]: value,
      // If status is being updated, also update the completed flag
      ...(field === 'status' && { completed: value === 'completed' }),
      updatedAt: new Date().toISOString()
    };

    console.log('TASK AFTER LOCAL UPDATE:', {
      updatedStatus: updatedTask.status,
      updatedPriority: updatedTask.priority,
      updatedCompleted: updatedTask.completed,
      updatedField: field,
      updatedValue: value
    });

    // Optimistic UI update
    const updatedTasksOptimistic = [...project.tasks];
    updatedTasksOptimistic[taskIndex] = updatedTask;

    // Update the project state with the optimistic update
    setProject(prevProject => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        tasks: updatedTasksOptimistic,
      };
    });

    try {
      // Flatten the task data for the API call
      const taskDataForUpdate = {
        ...updatedTask,
        projectId: project.id,
        subtasks: updatedTask.subtasks || []
      };

      console.log('SENDING TASK TO SERVER:', {
        id: taskDataForUpdate.id,
        status: taskDataForUpdate.status,
        priority: taskDataForUpdate.priority,
        completed: taskDataForUpdate.completed,
        [field]: taskDataForUpdate[field]
      });

      // Call the API to update the task
      const updatedTaskFromServer = await projectService.updateTask(taskDataForUpdate as Task);

      console.log('RECEIVED FROM SERVER:', {
        id: updatedTaskFromServer.id,
        statusFromServer: updatedTaskFromServer.status,
        priorityFromServer: updatedTaskFromServer.priority,
        completedFromServer: updatedTaskFromServer.completed,
        [field]: updatedTaskFromServer[field]
      });

      // Update the UI with the server response
      setProject(prevProject => {
        if (!prevProject) return null;
        
        const finalTasks = prevProject.tasks.map(t => {
          if (t.id === taskId) {
            console.log('UPDATING TASK IN STATE:', {
              id: t.id,
              oldStatus: t.status,
              newStatus: updatedTaskFromServer.status,
              oldPriority: t.priority,
              newPriority: updatedTaskFromServer.priority,
              oldCompleted: t.completed,
              newCompleted: updatedTaskFromServer.completed
            });
            return updatedTaskFromServer;
          }
          return t;
        });
        
        return {
          ...prevProject,
          tasks: finalTasks
        };
      });

      // Clear editing state if this was a title update
      if (field === 'title') {
        setIsEditing(null);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(`Failed to update task ${field}`);
      
      // Revert to the original task on error
      setProject(prevProject => {
        if (!prevProject) return null;
        return {
          ...prevProject,
          tasks: prevProject.tasks.map(t => 
            t.id === taskId ? originalTask : t
          )
        };
      });
    }
  };

  const handleCompleteProject = async () => {
    if (!project || !projectId) return;

    try {
      console.log('Starting project completion process...');
      setIsCompleteDialogOpen(false);

      // First, update the project status
      console.log('Updating project status to completed');
      const updatedProject = await projectService.updateProject({
        ...project,
        status: 'completed'
      });

      // Store the updated tasks here to apply them to our state later
      const completedTasks = [];

      // Update all tasks to completed (one by one to avoid rate limiting)
      console.log('Updating all tasks to completed...');
      for (const task of project.tasks) {
        try {
          const updatedTask = await projectService.updateTask({
            ...task,
            status: 'completed' as const,
            completed: true
          });
          completedTasks.push(updatedTask);
        } catch (err) {
          console.error(`Failed to update task ${task.id}:`, err);
          // Continue with other tasks even if one fails
          completedTasks.push({
            ...task,
            status: 'completed' as const,
            completed: true
          });
        }
      }

      // Update the UI with both the updated project and tasks
      console.log('Updating UI with completed project and tasks');
      setProject({
        ...updatedProject,
        tasks: completedTasks
      });
      
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
        status: 'todo' as const,
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: [],
        title: newTask.title || '',
        description: newTask.description || '',
        assignedTo: null,
        startDate: null,
        endDate: null,
        parentId: null
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
                        onClick={(e) => e.stopPropagation()} 
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Prevent the page from scrolling
                          const value = e.target.value as Task['status'];
                          console.log(`Changing status to: ${value}`);
                          handleTaskUpdate(task.id, 'status', value);
                        }}
                        size="small"
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          PaperProps: {
                            style: {
                              maxHeight: 200
                            }
                          }
                        }}
                        sx={{
                          minWidth: '100px',
                          '& .MuiSelect-select': {
                            backgroundColor: (theme) => 
                              theme.palette[getStatusColor(task.status || 'todo')].light,
                            color: (theme) => 
                              theme.palette[getStatusColor(task.status || 'todo')].contrastText,
                            paddingY: 0.5,
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
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Prevent the page from scrolling
                          const value = e.target.value as Task['priority'];
                          console.log(`Changing priority to: ${value}`);
                          handleTaskUpdate(task.id, 'priority', value);
                        }}
                        size="small"
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          PaperProps: {
                            style: {
                              maxHeight: 200
                            }
                          }
                        }}
                        sx={{
                          minWidth: '100px',
                          '& .MuiSelect-select': {
                            backgroundColor: (theme) => 
                              theme.palette[getPriorityColor(task.priority || 'medium')].light,
                            color: (theme) => 
                              theme.palette[getPriorityColor(task.priority || 'medium')].contrastText,
                            paddingY: 0.5,
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
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as "todo" | "in_progress" | "completed" | "blocked" })}
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "high" | "low" | "medium" })}
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