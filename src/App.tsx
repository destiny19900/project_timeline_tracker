import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import { ResetPassword } from './components/auth/ResetPassword';
import { UserProfile } from './components/user/UserProfile';
import { NewProject } from './components/projects/NewProject';
import { AuthCallback } from './components/auth/AuthCallback';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Team from './pages/Team';
import { ThemeContext } from './providers/ThemeProvider';
import { lightTheme, darkTheme } from './styles/theme';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

const App: React.FC = () => {
  const themeContext = React.useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/app/new-project" element={<NewProject />} />

                {/* Protected routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Outlet />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/app/dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="new-project" element={<NewProject />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:projectId" element={<ProjectDetails />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="team" element={<Team />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
