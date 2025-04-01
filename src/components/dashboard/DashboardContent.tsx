import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Unassigned', value: 8, color: '#64B5F6' },
  { name: 'In Progress', value: 8, color: '#9575CD' },
  { name: 'Completed', value: 10, color: '#81C784' },
];

const assigneeData = [
  { name: 'Sumon Sayem', percentage: 40, tasks: 12 },
  { name: 'Salman Hira', percentage: 28, tasks: 8 },
  { name: 'Imran Khan', percentage: 15, tasks: 5 },
  { name: 'Unassigned', percentage: 13, tasks: 4 },
];

const taskData = [
  { id: 1, name: 'Task 1', assignee: 'Sumon Sayem', status: 'Completed', date: '2024-02-20' },
  { id: 2, name: 'Task 2', assignee: 'Salman Hira', status: 'In Progress', date: '2024-02-21' },
  { id: 3, name: 'Task 3', assignee: 'Imran Khan', status: 'Unassigned', date: '2024-02-22' },
];

export const DashboardContent: React.FC = () => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <TaskIcon />
          </Box>
          <Box>
            <Typography variant="h6">8</Typography>
            <Typography color="textSecondary">Unassigned Tasks</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'warning.light',
              color: 'warning.main',
            }}
          >
            <TimeIcon />
          </Box>
          <Box>
            <Typography variant="h6">8</Typography>
            <Typography color="textSecondary">In Progress</Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.main',
            }}
          >
            <CompletedIcon />
          </Box>
          <Box>
            <Typography variant="h6">10</Typography>
            <Typography color="textSecondary">Completed Tasks</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2, height: 400, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Task Distribution
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Task by Assignee
          </Typography>
          {assigneeData.map((item) => (
            <Box key={item.name} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{item.name}</Typography>
                <Typography>{item.percentage}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Task Table */}
      <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taskData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{task.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}; 