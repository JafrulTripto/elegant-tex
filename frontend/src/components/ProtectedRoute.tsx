import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component to handle route protection based on authentication status
 * 
 * @param requireAuth - If true, user must be authenticated to access the route
 * @param requireAdmin - If true, user must have admin role to access the route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth = true,
  requireAdmin = false,
}) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin role is required and user is not admin, redirect to unauthorized
  if (
    requireAdmin &&
    (!authState.user ||
      !authState.user.roles.some((role: string) => role === 'ROLE_ADMIN'))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated but tries to access login/register pages, redirect to dashboard
  if (!requireAuth && authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all conditions are met, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
