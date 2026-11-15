import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their own viewpoint
    if (user.role === 'COMPANY_ADMIN') {
      return <Navigate to="/admin/overview" replace />;
    }
    if (user.role === 'MANAGER') {
      return <Navigate to="/manager" replace />;
    }
  }

  return <>{children}</>;
};
