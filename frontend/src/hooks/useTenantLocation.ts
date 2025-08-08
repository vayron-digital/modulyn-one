import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTenantLocation() {
  const [primaryLocation, setPrimaryLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTenantLocation() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user's profile to find tenant_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!profile?.tenant_id) {
          setPrimaryLocation('Other');
          setLoading(false);
          return;
        }

        // Get tenant's primary location
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('primary_location')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError) {
          throw tenantError;
        }

        setPrimaryLocation(tenant?.primary_location || 'Other');
      } catch (err: any) {
        console.error('Error fetching tenant location:', err);
        setError(err.message);
        setPrimaryLocation('Other'); // Default fallback
      } finally {
        setLoading(false);
      }
    }

    fetchTenantLocation();
  }, [user]);

  return {
    primaryLocation,
    loading,
    error,
  };
} 