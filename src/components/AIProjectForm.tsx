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
import { aiService } from '../services/aiService';
import { ProjectPromptData } from '../types/ai';

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
      // Call the OpenAI service to generate a project based on the prompt
      const aiResponse = await callAIService(promptData);
      
      // Process the AI response into a valid project structure
      const projectData = await parseAIResponse(aiResponse);
      
      // Ensure all tasks have status "todo" and completed=false
      if (projectData.tasks && projectData.tasks.length > 0) {
        projectData.tasks = projectData.tasks.map(task => ({
          ...task,
          status: 'todo',
          completed: false
        }));
      }
      
      // Save the project to the database
      const createdProject = await projectService.createProject({
        ...projectData,
        userId: user.id
      });
      
      console.log('AI Project created successfully:', createdProject);
      
      setSuccess(true);
      
      // Close the form and navigate directly to the new project
      onClose();
      if (onSuccess) onSuccess();
      
      // Navigate to the specific project page
      navigate(`/app/projects/${createdProject.id}`);
    } catch (err) {
      console.error('Error creating AI project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project with AI');
    } finally {
      setLoading(false);
    }
  };
  
  const callAIService = async (promptData: ProjectPromptData): Promise<string> => {
    try {
      return await aiService.generateProject(promptData);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate project with AI. Please check your API key configuration.');
    }
  };
  
  const parseAIResponse = async (response: string) => {
    try {
      return await aiService.parseAIResponse(response);
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