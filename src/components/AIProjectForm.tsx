import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Slider,
  Divider,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/projectService';
import { aiService } from '../services/aiService';
import { ProjectPromptData, AIUsageLimits } from '../types/ai';
import { format } from 'date-fns';

// Explicitly define the expected structure for project creation
// This matches the actual expected input for projectService.createProject
interface ProjectInput {
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string | null;
  endDate: string | null;
  userId: string;
  tasks: Array<{
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high';
    startDate: string | null;
    endDate: string | null;
    completed: boolean;
    orderIndex: number;
    parentId: string | null;
    assignedTo: string | null;
  }>;
}

interface AIProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
  const [usageLimitInfo, setUsageLimitInfo] = useState<AIUsageLimits | null>(null);
  const [promptData, setPromptData] = useState<ProjectPromptData>({
    description: '',
    numTasks: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  
  // Check usage limits when the component mounts and when the user changes
  useEffect(() => {
    if (user) {
      const checkLimits = async () => {
        try {
          const limits = await aiService.checkUsageLimit(user.id);
          setUsageLimitInfo(limits);
        } catch (error) {
          console.error('Error checking AI usage limits:', error);
        }
      };
      
      checkLimits();
    }
  }, [user, open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Collect validation errors instead of throwing on the first error
      const validationErrors: string[] = [];
      
      // Validate dates
      const start = new Date(promptData.startDate);
      const end = new Date(promptData.endDate);
      
      if (isNaN(start.getTime())) {
        validationErrors.push("Start date is invalid. Please enter a valid date in YYYY-MM-DD format.");
      }
      
      if (isNaN(end.getTime())) {
        validationErrors.push("End date is invalid. Please enter a valid date in YYYY-MM-DD format.");
      }
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        validationErrors.push("Start date must be before end date. Please adjust your project timeline.");
      }

      // Validate description
      if (!promptData.description.trim()) {
        validationErrors.push("Project description is required. Please describe what you want to accomplish.");
      } else {
        if (promptData.description.trim().length < 10) {
          validationErrors.push("Project description must be at least 10 characters long. Please provide more details about your project.");
        }
        
        if (promptData.description.trim().length > 5000) {
          validationErrors.push("Project description is too long. Please limit your description to 5000 characters.");
        }
      }
      
      // Validate task count
      if (promptData.numTasks < 1 || promptData.numTasks > 20) {
        validationErrors.push("Number of tasks must be between 1 and 20. Please adjust the task slider.");
      }
      
      // If we have validation errors, show them and stop
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.length === 1 
          ? validationErrors[0] 
          : "Please fix the following issues:\n• " + validationErrors.join("\n• ");
        
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      // Check usage limit
      const limits = await aiService.checkUsageLimit(user.id);
      setUsageLimitInfo(limits);
      
      if (limits.hasReachedLimit) {
        const resetMessage = limits.resetTime 
          ? `You can create more projects on ${format(limits.resetTime, 'MMM dd, yyyy')}.`
          : 'You can create more projects in about a week.';
        setError(`You've reached the limit of 10 AI-generated projects per week. ${resetMessage}`);
        setLoading(false);
        return;
      }
      
      // Continue with API calls and processing only if validation passes
      
      // Call the OpenAI service to generate a project based on the prompt
      const aiResponse = await callAIService(promptData);
      
      // Process the AI response into a valid project structure
      const aiResponseData = await parseAIResponse(aiResponse);
      
      // Prepare project data for creation
      const projectInput: ProjectInput = {
        title: aiResponseData.title,
        description: aiResponseData.description,
        status: aiResponseData.status,
        priority: aiResponseData.priority,
        startDate: aiResponseData.startDate,
        endDate: aiResponseData.endDate,
        userId: user.id,
        tasks: (aiResponseData.tasks || []).map((task: any, index: number) => ({
          title: task.title,
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          startDate: task.startDate,
          endDate: task.endDate,
          completed: task.completed === undefined ? false : task.completed,
          orderIndex: task.orderIndex ?? index,
          parentId: task.parentId || null,
          assignedTo: null
        }))
      };
      
      // Save the project to the database with type assertion
      // This is safe because ProjectInput matches the expected structure
      const createdProject = await projectService.createProject(projectInput as any);
      
      // Record that the user has generated a project
      await aiService.recordProjectGeneration(user.id, createdProject.id);
      
      // Update the usage info
      const updatedLimits = await aiService.checkUsageLimit(user.id);
      setUsageLimitInfo(updatedLimits);
      
      console.log('AI Project created successfully:', createdProject);
      
      setSuccess(true);
      
      // Close the form and navigate directly to the new project
      onClose();
      if (onSuccess) onSuccess();
      
      // Navigate to the specific project page
      navigate(`/app/projects/${createdProject.id}`);
    } catch (err) {
      console.error('Error creating AI project:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Failed to create project with AI. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const callAIService = async (promptData: ProjectPromptData): Promise<string> => {
    try {
      return await aiService.generateProject(promptData);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Extract meaningful error messages
      if (error instanceof Error) {
        // Handle specific validation errors
        if (error.message.startsWith('Please correct the following:')) {
          throw error; // Already formatted for user display
        } else if (error.message.includes('Invalid project data')) {
          throw new Error(error.message); // Already a user-friendly validation error
        } else if (error.message.includes('OpenAI API key is invalid')) {
          throw new Error('AI service authentication failed. Please contact support.');
        } else if (error.message.includes('OpenAI rate limit exceeded')) {
          throw new Error('AI service is temporarily unavailable due to high demand. Please try again in a few minutes.');
        } else if (error.message.includes('OpenAI service is currently unavailable')) {
          throw new Error('AI service is temporarily unavailable. Please try again later.');
        } else if (error.message.includes('OpenAI API error')) {
          throw new Error('Error communicating with AI service. Please check your internet connection and try again.');
        } else if (error.message.includes('not configured')) {
          throw new Error('AI service is not properly configured. Please contact support.');
        }
      }
      
      throw new Error('Unable to generate project with AI. Please try again later.');
    }
  };
  
  const parseAIResponse = async (response: string) => {
    try {
      return await aiService.parseAIResponse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to parse') || error.message.includes('Invalid AI response')) {
          throw new Error('The AI generated an invalid response. Please try again with a more detailed and specific project description.');
        } else if (error.message.includes('JSON')) {
          throw new Error('Error processing the AI response format. Please try again with a clearer project description.');
        } else if (error.message.includes('validation')) {
          throw new Error('The generated project data was incomplete. Please provide more details in your description and try again.');
        }
      }
      
      throw new Error('Error processing AI response. Please try a different project description.');
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
            {usageLimitInfo && (
              <Paper
                elevation={0}
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                  <Typography variant="subtitle2">
                    AI Project Generation Limit
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={((10 - usageLimitInfo.remaining) / 10) * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: 'background.default',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: usageLimitInfo.remaining > 3 
                          ? 'success.main' 
                          : usageLimitInfo.remaining > 0 
                            ? 'warning.main' 
                            : 'error.main',
                      }
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {usageLimitInfo.hasReachedLimit 
                    ? `You've reached the limit of 10 AI-generated projects per week. You can create more projects on ${usageLimitInfo.resetTime ? format(usageLimitInfo.resetTime, 'MMM dd, yyyy') : 'in about a week'}.`
                    : `You have ${usageLimitInfo.remaining} of 10 AI project generations remaining this week.`
                  }
                </Typography>
              </Paper>
            )}
            
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
                disabled={usageLimitInfo?.hasReachedLimit}
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
                  max={20}
                  valueLabelDisplay="auto"
                  disabled={usageLimitInfo?.hasReachedLimit}
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
                  disabled={usageLimitInfo?.hasReachedLimit}
                />
                
                <TextField
                  label="End Date"
                  type="date"
                  value={promptData.endDate}
                  onChange={(e) => setPromptData(prev => ({ ...prev, endDate: e.target.value }))}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  disabled={usageLimitInfo?.hasReachedLimit}
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
              disabled={loading || !promptData.description.trim() || usageLimitInfo?.hasReachedLimit}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                },
                px: 3,
              }}
            >
              {loading 
                ? 'Generating Project...' 
                : usageLimitInfo?.hasReachedLimit 
                  ? 'Weekly Limit Reached' 
                  : 'Generate AI Project'
              }
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
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            boxShadow: 3,
            '& .MuiAlert-message': {
              whiteSpace: 'pre-line'  // This allows line breaks in error messages
            }
          }}
          variant="filled"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {error?.includes(':') ? 'Validation Error' : 'Error'}
          </Typography>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}; 