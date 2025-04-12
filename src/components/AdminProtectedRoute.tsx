import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminAuthService } from '../services/adminAuthService';
import { LoadingSpinner } from './common/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const admin = await adminAuthService.getCurrentAdmin();
        setIsAdmin(!!admin);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  if (loading || isAdmin === null) {
    return <LoadingSpinner message="Checking admin privileges..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 