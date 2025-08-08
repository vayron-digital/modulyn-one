import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SmartRedirectProps {
  defaultRoute?: string;
}

export default function SmartRedirect({ defaultRoute = '/dashboard' }: SmartRedirectProps) {
  const { user } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineRedirect = async () => {
      if (!user?.id) {
        setRedirectTo('/login');
        setLoading(false);
        return;
      }

      try {
        // Check if user has tenant_id (full access) or not (preview mode)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user profile:', error);
          setRedirectTo('/login');
          setLoading(false);
          return;
        }

        // If user has tenant_id, they have full access
        if (profile?.tenant_id) {
          setRedirectTo(defaultRoute);
        } else {
          // User doesn't have tenant_id, redirect to preview space
          setRedirectTo('/preview');
        }
      } catch (error) {
        console.error('Error determining redirect:', error);
        setRedirectTo('/login');
      } finally {
        setLoading(false);
      }
    };

    determineRedirect();
  }, [user, defaultRoute]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return redirectTo ? <Navigate to={redirectTo} replace /> : null;
}
