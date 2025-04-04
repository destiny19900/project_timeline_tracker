import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Switch, 
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Snackbar,
  FormGroup,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useThemeContext } from '../hooks/useTheme';

const SettingsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'visible'
}));

const SettingsCardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const SettingsCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3)
}));

const Settings: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to the backend
    setShowSnackbar(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>

      <SettingsCard>
        <SettingsCardHeader>
          <DarkModeIcon color="primary" />
          <Typography variant="h6" fontWeight={500}>
            Appearance
          </Typography>
        </SettingsCardHeader>
        <SettingsCardContent>
          <FormGroup>
            <FormControlLabel 
              control={
                <Switch 
                  checked={mode === 'dark'} 
                  onChange={toggleTheme} 
                  color="primary" 
                />
              } 
              label="Dark Mode" 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Toggle between light and dark mode. Dark mode helps reduce eye strain and save battery life.
            </Typography>
          </FormGroup>
        </SettingsCardContent>
      </SettingsCard>
      
      <SettingsCard>
        <SettingsCardHeader>
          <NotificationsIcon color="primary" />
          <Typography variant="h6" fontWeight={500}>
            Notifications
          </Typography>
        </SettingsCardHeader>
        <SettingsCardContent>
          <FormGroup>
            <FormControlLabel 
              control={
                <Switch 
                  checked={notificationsEnabled} 
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                  color="primary" 
                />
              } 
              label="Enable Notifications" 
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={emailNotifications} 
                  onChange={() => setEmailNotifications(!emailNotifications)} 
                  color="primary" 
                  disabled={!notificationsEnabled}
                />
              } 
              label="Email Notifications" 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Receive notifications about project updates, task assignments, and approaching deadlines.
            </Typography>
          </FormGroup>
        </SettingsCardContent>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader>
          <SecurityIcon color="primary" />
          <Typography variant="h6" fontWeight={500}>
            Password & Security
          </Typography>
        </SettingsCardHeader>
        <SettingsCardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Change your password
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                variant="outlined"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </SettingsCardContent>
      </SettingsCard>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 