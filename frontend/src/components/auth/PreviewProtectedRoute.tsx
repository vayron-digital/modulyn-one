import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PreviewProtectedRouteProps {
  children: React.ReactNode;
  requirePaid?: boolean; // If true, requires paid subscription
}

export default function PreviewProtectedRoute({ children, requirePaid = true }: PreviewProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDevelopment = window.location.hostname === '192.168.1.249' || window.location.hostname === 'localhost';

    if (isDevelopment) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has a profile with tenant_id
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // If requirePaid is false, allow access for any authenticated user
        if (!requirePaid) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // If user has tenant_id, they have full access
        if (profile?.tenant_id) {
          setHasAccess(true);
        } else {
          // User doesn't have tenant_id, so they're in preview mode
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, requirePaid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/preview" replace />;
  }

  return <>{children}</>;
}
