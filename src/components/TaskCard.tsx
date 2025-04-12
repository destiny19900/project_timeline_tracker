import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  level?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  level = 0,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleToggleComplete = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleComplete(task.id, event.target.checked);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          ml: level * 2,
          backgroundColor: 'background.paper',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Checkbox
              checked={task.completed}
              onChange={handleToggleComplete}
              color="primary"
              sx={{
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary',
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
            {task.subtasks && task.subtasks.length > 0 && (
              <IconButton onClick={handleToggleExpand} size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {task.subtasks?.map((subtask: Task) => (
              <TaskCard
                key={subtask.id}
                task={subtask}
                onToggleComplete={onToggleComplete}
                level={level + 1}
              />
            ))}
          </CardContent>
        </Collapse>
      </Card>
    </motion.div>
  );
}; 