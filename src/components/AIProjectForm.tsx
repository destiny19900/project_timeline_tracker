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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Slider,
  Divider,
  Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';

interface AIProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProjectPromptData {
  description: string;
  numTasks: number;
  startDate: string;
  endDate: string;
}

export const AIProjectForm: React.FC<AIProjectFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promptData, setPromptData] = useState<ProjectPromptData>({
    description: '',
    numTasks: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the AI service to generate a project based on the prompt
      const aiResponse = await callAIService(promptData);
      
      // Process the AI response into a valid project structure
      const projectData = parseAIResponse(aiResponse);
      
      // Save the project to the database
      await projectService.createProject({
        ...projectData,
        userId: user.id
      });
      
      setSuccess(true);
      
      // Close the form and navigate after a short delay
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        navigate('/app/projects');
      }, 1500);
    } catch (err) {
      console.error('Error creating AI project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project with AI');
    } finally {
      setLoading(false);
    }
  };
  
  const callAIService = async (promptData: ProjectPromptData): Promise<string> => {
    // This is a placeholder for the actual AI service call
    // In a real implementation, this would call an API endpoint
    
    // In this demo, we'll simulate a response with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a prompt based on the user's input
        const prompt = generateAIPrompt(promptData);
        
        // For the demo, we'll return a static JSON response
        // In production, this would be the result of an actual API call
        resolve(mockAIResponse(promptData));
      }, 2000);
    });
  };
  
  const generateAIPrompt = (data: ProjectPromptData): string => {
    return `
Create a detailed project plan based on the following description:
"${data.description}"

The project should have ${data.numTasks} tasks, start on ${data.startDate} and end by ${data.endDate}.

For each task, provide:
1. A clear, specific title
2. A detailed description
3. A status (todo, in_progress, completed, or blocked)
4. A priority level (low, medium, high)
5. Start and end dates within the project timeline
6. Whether it's completed or not

Also provide:
1. A concise project title
2. A comprehensive project description
3. The overall project status (not_started, in_progress, completed, or on_hold)
4. The project priority (low, medium, high)

Format your response as JSON that can be directly used to create a project in our database.
`;
  };
  
  const mockAIResponse = (data: ProjectPromptData): string => {
    // This is a simplified mock response
    // In production, this would be the actual response from an AI service
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const daySpan = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.floor(daySpan / data.numTasks);
    
    // Generate task titles based on the description
    const words = data.description.split(' ').filter(word => word.length > 3);
    
    // Create mock tasks
    const tasks = [];
    for (let i = 0; i < data.numTasks; i++) {
      const taskStartDate = new Date(startDate);
      taskStartDate.setDate(startDate.getDate() + i * taskDuration);
      
      const taskEndDate = new Date(taskStartDate);
      taskEndDate.setDate(taskStartDate.getDate() + taskDuration - 1);
      
      // Generate a somewhat meaningful task title
      const wordIndex = i % words.length;
      const taskTitle = `${i + 1}. ${words[wordIndex] || 'Task'} ${i + 1}`;
      
      tasks.push({
        title: taskTitle,
        description: `This is a task that involves ${words[wordIndex] || 'work'} as part of the project.`,
        status: 'todo',
        priority: i === 0 ? 'high' : i === data.numTasks - 1 ? 'low' : 'medium',
        startDate: taskStartDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
        completed: false,
        assignedTo: null,
        orderIndex: i,
        parentId: null
      });
    }
    
    // Create a shorter project title by extracting keywords
    let projectTitle = '';
    if (words.length > 0) {
      // Take only up to 3 words max
      const keyWords = words.slice(0, Math.min(3, words.length));
      projectTitle = keyWords.join(' ');
      // Capitalize first letter
      projectTitle = projectTitle.charAt(0).toUpperCase() + projectTitle.slice(1);
      
      // Keep title very short (12 chars max)
      if (projectTitle.length > 12) {
        projectTitle = projectTitle.substring(0, 12) + '...';
      }
    } else {
      projectTitle = 'New Project';
    }
    
    // Create the project structure
    const project = {
      title: projectTitle,
      description: data.description,
      status: 'not_started',
      priority: 'medium',
      startDate: data.startDate,
      endDate: data.endDate,
      tasks: tasks
    };
    
    return JSON.stringify(project);
  };
  
  const parseAIResponse = (response: string) => {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 10,
            overflow: 'hidden',
            width: '100%',
            height: { xs: '100vh', sm: '80vh' },
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            '& .MuiPaper-root': {
              width: '100%',
              maxWidth: '100%',
              m: 0,
            },
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          borderBottom: '1px solid', 
          borderColor: 'divider', 
          pb: 2,
          flexShrink: 0
        }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI-Assisted Project Creation
          </Typography>
          <Chip 
            label="AI Powered" 
            size="small" 
            color="primary" 
            sx={{ 
              borderRadius: 1, 
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              '& .MuiChip-label': { fontWeight: 600 }
            }} 
          />
        </DialogTitle>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <DialogContent 
            sx={{ 
              p: 3,
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Describe your project in detail. The AI will analyze your description and generate a complete project plan with tasks and timeline.
              </Typography>
              
              <TextField
                label="Project Description"
                value={promptData.description}
                onChange={(e) => setPromptData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={5}
                fullWidth
                required
                placeholder="Describe your project in detail. What are the goals? What needs to be accomplished? What are the key deliverables?"
              />
              
              <Box>
                <Typography gutterBottom>
                  Number of Tasks: {promptData.numTasks}
                </Typography>
                <Slider
                  value={promptData.numTasks}
                  onChange={(_, value) => setPromptData(prev => ({ ...prev, numTasks: value as number }))}
                  step={1}
                  marks
                  min={1}
                  max={10}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Project Timeline
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={promptData.startDate}
                  onChange={(e) => setPromptData(prev => ({ ...prev, startDate: e.target.value }))}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="End Date"
                  type="date"
                  value={promptData.endDate}
                  onChange={(e) => setPromptData(prev => ({ ...prev, endDate: e.target.value }))}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            justifyContent: 'space-between',
            position: 'relative',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
            flexShrink: 0
          }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !promptData.description.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                },
                px: 3,
              }}
            >
              {loading ? 'Generating Project...' : 'Generate AI Project'}
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
          AI-Generated project created successfully!
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