
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleProtectedRouteProps {
    allowedRoles: UserRole[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const userHasRequiredRole = profile && allowedRoles.includes(profile.role);

  if (!userHasRequiredRole) {
      // Redirect them to the landing page if they don't have access
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;