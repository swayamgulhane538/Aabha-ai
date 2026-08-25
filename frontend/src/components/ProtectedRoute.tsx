import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated) {
        await loadUser();
      }
      setIsInitializing(false);
    };
    initAuth();
  }, [isAuthenticated, loadUser]);

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner message="Verifying authentication credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || 'PATIENT').toUpperCase();
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

  // Super Admin can access all areas. Otherwise check role membership.
  const hasAccess = userRole === 'ADMIN' || normalizedAllowed.includes(userRole);

  if (!hasAccess) {
    switch (userRole) {
      case 'PATIENT': return <Navigate to="/patient" replace />;
      case 'CAREGIVER': return <Navigate to="/caregiver" replace />;
      case 'ADMIN': return <Navigate to="/admin" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};
