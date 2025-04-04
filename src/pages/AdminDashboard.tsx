import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { adminService } from '../services/adminService';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        await loadUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setEditForm({
      username: '',
      email: '',
      role: '',
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await adminService.updateUser(selectedUser.id, editForm);
      await loadUsers();
      handleDialogClose();
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error">Please log in to access the admin dashboard.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 