import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

interface UseAuthLoadingReturn {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canAccess: (requiredRole?: 'admin' | 'user') => boolean;
  retryAuth: () => void;
}

export const useAuthLoading = (): UseAuthLoadingReturn => {
  const { user, loading, error, login } = useAuth();

  const isAuthenticated = !loading && !!user;
  const isAdmin = isAuthenticated && user?.is_admin;

  const canAccess = useCallback((requiredRole?: 'admin' | 'user') => {
    if (loading) return false;
    if (!user) return false;
    
    if (requiredRole === 'admin') {
      return user.is_admin;
    }
    
    return true;
  }, [user, loading]);

  const retryAuth = useCallback(() => {
    // This could trigger a re-authentication attempt
    // For now, we'll just reload the page to reinitialize auth
    window.location.reload();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    canAccess,
    retryAuth
  };
}; 