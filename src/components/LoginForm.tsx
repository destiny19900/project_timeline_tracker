import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../store/slices/authSlice';
import authService, { LoginData } from '../services/authService';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      authService.setToken(response.token);
      dispatch(setUser(response.user));
      dispatch(setToken(response.token));
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          mx: 'auto',
          mt: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Welcome Back
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Button
              onClick={() => navigate('/signup')}
              sx={{
                color: '#3b82f6',
                '&:hover': { color: '#2563eb' },
              }}
            >
              Sign Up
            </Button>
          </Typography>
        </form>
      </Paper>
    </motion.div>
  );
};

export default LoginForm; 