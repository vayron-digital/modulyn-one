import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function UserStatusDebugger() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Debug - Profile error:', error);
        } else {
          setProfile(profile);
        }
      } catch (error) {
        console.error('Debug - Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h4 className="font-bold">Debug: No User</h4>
        <p className="text-sm">User is not authenticated</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h4 className="font-bold">Debug: Loading...</h4>
      </div>
    );
  }

  const shouldGoToPreview = !profile?.tenant_id;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm text-white ${shouldGoToPreview ? 'bg-blue-500' : 'bg-green-500'}`}>
      <h4 className="font-bold">Debug: User Status</h4>
      <div className="text-sm space-y-1">
        <p><strong>User ID:</strong> {user.id?.substring(0, 8)}...</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Has Tenant ID:</strong> {profile?.tenant_id ? 'Yes' : 'No'}</p>
        <p><strong>OAuth Provider:</strong> {profile?.oauth_provider || 'None'}</p>
        <p><strong>Should Redirect To:</strong> {shouldGoToPreview ? '/preview' : '/dashboard'}</p>
      </div>
    </div>
  );
}
