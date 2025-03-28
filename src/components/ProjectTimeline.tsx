import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { Project, Task } from '../store/slices/projectSlice';

interface ProjectTimelineProps {
  project: Project;
  onTaskToggle: (taskId: string, completed: boolean) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  project,
  onTaskToggle,
}) => {
  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.reduce((acc, task) => {
      const taskProgress = task.completed ? 1 : 0;
      const subtaskProgress = task.subtasks
        ? calculateProgress(task.subtasks) / task.subtasks.length
        : 0;
      return acc + (taskProgress + subtaskProgress) / 2;
    }, 0);

    return (completedTasks / tasks.length) * 100;
  };

  const progress = calculateProgress(project.tasks);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {project.description}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Project Progress
            </Typography>
            <Typography variant="body2" color="primary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'background.default',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Paper>

      <Box>
        {project.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onTaskToggle}
          />
        ))}
      </Box>
    </motion.div>
  );
}; 