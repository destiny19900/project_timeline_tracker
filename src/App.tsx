import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { AppContent } from './components/AppContent';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import { ResetPassword } from './components/auth/ResetPassword';
import { UserProfile } from './components/user/UserProfile';
import { NewProject } from './components/projects/NewProject';
import { AuthCallback } from './components/auth/AuthCallback';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardContent } from './components/dashboard/DashboardContent';
import { Dashboard } from './components/Dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Projects } from './pages/Projects';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
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
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="new-project" element={<NewProject />} />
                          <Route path="projects" element={<Projects />} />
                          <Route path="/tasks" element={<DashboardContent />} />
                          <Route path="/team" element={<DashboardContent />} />
                          <Route path="/documents" element={<DashboardContent />} />
                          <Route path="/clients" element={<DashboardContent />} />
                          {/* Redirect any unknown paths to dashboard */}
                          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                        </Routes>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/app/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Redirect any unknown paths to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
