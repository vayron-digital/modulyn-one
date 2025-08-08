import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from './LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, error, isAuthenticated, isAdmin, retryAuth } = useAuthLoading();
  const location = useLocation();

  return (
    <LoadingState
      loading={loading}
      error={error}
      onRetry={retryAuth}
      type="page"
      message="Authenticating..."
      showUser={true}
    >
      {!isAuthenticated ? (
        <Navigate to={fallbackPath} state={{ from: location }} replace />
      ) : requireAdmin && !isAdmin ? (
        <Navigate to="/" replace />
      ) : (
        <>{children}</>
      )}
    </LoadingState>
  );
} 