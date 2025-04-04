import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 