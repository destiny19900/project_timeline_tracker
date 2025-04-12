import React from 'react';
import { Box, Typography, Paper, Checkbox, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const TaskCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  width: '100%',
}));

export const ProjectTimeline: React.FC<{ project: any; onTaskToggle: (taskId: string, completed: boolean) => void }> = ({
  project,
  onTaskToggle,
}) => {

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        {project.name} Timeline
      </Typography>
      
      <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
        {project.tasks?.map((task: any) => (
          <Grid item xs={12} key={task.id} sx={{ width: '100%', padding: { xs: 0, sm: 1 } }}>
            <TaskCard sx={{ 
              borderRadius: { xs: 0, sm: 1 },
              mb: { xs: 2, sm: 0 },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => onTaskToggle(task.id, e.target.checked)}
                  sx={{ mt: 0.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                  {task.description && (
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </TaskCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 