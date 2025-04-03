import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, DragIndicator as DragIcon, Add as AddIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SelectChangeEvent } from '@mui/material/Select';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  startDate: Date | null;
  endDate: Date | null;
  timestamp: Date;
}

interface ProjectData {
  name: string;
  description: string;
  tasks: Task[];
  useAI: boolean;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectData) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    tasks: [],
    useAI: false,
  });

  const [currentTask, setCurrentTask] = useState<Task>({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    startDate: null,
    endDate: null,
    timestamp: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(projectData);
    onClose();
  };

  const handlePriorityChange = (e: SelectChangeEvent) => {
    setCurrentTask({ ...currentTask, priority: e.target.value as Task['priority'] });
  };

  const handleAddTask = () => {
    if (currentTask.title.trim()) {
      const newTask: Task = {
        ...currentTask,
        id: `task-${Date.now()}`,
        timestamp: new Date(),
      };
      setProjectData({
        ...projectData,
        tasks: [...projectData.tasks, newTask],
      });
      setCurrentTask({
        id: '',
        title: '',
        description: '',
        priority: 'medium',
        startDate: null,
        endDate: null,
        timestamp: new Date(),
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setProjectData({
      ...projectData,
      tasks: projectData.tasks.filter(task => task.id !== taskId),
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const tasks = Array.from(projectData.tasks);
    const [reorderedTask] = tasks.splice(result.source.index, 1);
    tasks.splice(result.destination.index, 0, reorderedTask);

    setProjectData({
      ...projectData,
      tasks,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '100%',
            margin: 0,
          },
        },
      }}
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          m: 0,
          maxHeight: '70vh',
          height: '70vh',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
          '@keyframes slideUp': {
            '0%': {
              transform: 'translateY(100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: 1,
        borderColor: 'divider',
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Project
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: 'action.hover',
            borderRadius: 2,
            p: 0.5,
            ml: 'auto'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: !projectData.useAI ? 'primary.main' : 'text.secondary',
                fontWeight: !projectData.useAI ? 600 : 400
              }}
            >
              Add Manually
            </Typography>
            <Switch
              checked={projectData.useAI}
              onChange={(e) => setProjectData({ ...projectData, useAI: e.target.checked })}
              color="primary"
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AIIcon fontSize="small" sx={{ color: projectData.useAI ? 'primary.main' : 'text.secondary' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: projectData.useAI ? 'primary.main' : 'text.secondary',
                  fontWeight: projectData.useAI ? 600 : 400
                }}
              >
                Use AI
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2, sm: 3 },
        width: '100%',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
      }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: 0,
          width: '100%'
        }}>
          <Stack spacing={2}>
            <TextField
              label="Project Name"
              fullWidth
              size="small"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              required
            />
            <TextField
              label="Project Description"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
            />
            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Add Tasks
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Task Title"
                fullWidth
                size="small"
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                required
              />
              <TextField
                label="Task Description"
                fullWidth
                multiline
                rows={2}
                size="small"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={currentTask.priority}
                  label="Priority"
                  onChange={handlePriorityChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={currentTask.startDate}
                  onChange={(newValue: Date | null) => setCurrentTask({ ...currentTask, startDate: newValue })}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={currentTask.endDate}
                  onChange={(newValue: Date | null) => setCurrentTask({ ...currentTask, endDate: newValue })}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Stack>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTask}
                variant="outlined"
                disabled={!currentTask.title.trim()}
                fullWidth
                size="small"
              >
                Add Task
              </Button>
            </Stack>
            {projectData.tasks.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Tasks ({projectData.tasks.length})
                </Typography>
                <Box sx={{ 
                  maxHeight: '400px',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                  },
                }}>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="task-list">
                      {(provided) => (
                        <List 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          sx={{ 
                            '& .MuiListItem-root': {
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              mb: 1,
                              border: 1,
                              borderColor: 'divider',
                              px: { xs: 1, sm: 2 }
                            }
                          }}
                        >
                          {projectData.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <DragIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                  <ListItemText
                                    primary={
                                      <Box component="span">
                                        <Typography variant="subtitle1" component="span">
                                          {task.title}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Box component="span">
                                        <Typography variant="body2" component="span" color="text.secondary">
                                          {task.description}
                                        </Typography>
                                        <Typography variant="caption" component="span" display="block" color="text.secondary">
                                          {task.timestamp.toLocaleString()}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleDeleteTask(task.id)}
                                      size="small"
                                      aria-label={`delete task ${task.title}`}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </List>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: 0,
        borderTop: 1,
        borderColor: 'divider',
        gap: 1,
        width: '100%'
      }}>
        <Button onClick={onClose} variant="outlined" fullWidth size="small">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!projectData.name.trim() || projectData.tasks.length === 0}
          fullWidth
          size="small"
          sx={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            },
          }}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 