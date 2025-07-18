import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, UserGroupIcon, HomeIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalLeads: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen: string | null;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    totalLeads: 0
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    const subscription = setupRealtimeSubscription();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setupRealtimeSubscription = () => {
    return supabase
      .channel('presence')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'presence' 
      }, (payload) => {
        console.log('Presence update:', payload);
        updateUserPresence(payload);
      })
      .subscribe();
  };

  const updateUserPresence = (payload: any) => {
    setUsers(currentUsers => {
      return currentUsers.map(user => {
        if (user.id === payload.new.user_id) {
          return {
            ...user,
            is_online: payload.new.is_online,
            last_seen: payload.new.last_seen
          };
        }
        return user;
      });
    });

    // Update active users count
    setStats(currentStats => ({
      ...currentStats,
      activeUsers: users.filter(u => u.is_online).length
    }));
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall statistics
      const { data: statsData, error: statsError } = await supabase
        .from('profiles')
        .select('id, role, is_active')
        .eq('is_active', true);

      if (statsError) {
        console.error('Error fetching profiles:', statsError);
        throw statsError;
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id');

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      // Fetch user profiles with presence
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_active
        `)
        .order('full_name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Fetch presence data separately
      const { data: presenceData, error: presenceError } = await supabase
        .from('presence')
        .select('*')
        .in('user_id', usersData.map(user => user.id));

      if (presenceError) {
        console.error('Error fetching presence:', presenceError);
        throw presenceError;
      }

      // Transform user data to include online status
      const transformedUsers = usersData.map(user => {
        const presence = presenceData?.find(p => p.user_id === user.id);
        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active ?? true,
          is_online: presence?.is_online ?? false,
          last_seen: presence?.last_seen || null
        };
      });

      setStats({
        totalUsers: statsData.length,
        activeUsers: transformedUsers.filter(user => user.is_online).length,
        totalProperties: propertiesData.length,
        totalLeads: leadsData.length
      });

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      setError(error.message || 'An error occurred while fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatLastActive = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card dark:bg-card-dark rounded-lg shadow p-6 text-foreground dark:text-foreground-dark">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
              <UserGroupIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">Total Users</p>
              <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-card dark:bg-card-dark rounded-lg shadow p-6 text-foreground dark:text-foreground-dark">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">Active Users</p>
              <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-card dark:bg-card-dark rounded-lg shadow p-6 text-foreground dark:text-foreground-dark">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">Total Properties</p>
              <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        <div className="bg-card dark:bg-card-dark rounded-lg shadow p-6 text-foreground dark:text-foreground-dark">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">Total Leads</p>
              <p className="text-2xl font-semibold text-foreground dark:text-foreground-dark">{stats.totalLeads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-card dark:bg-card-dark rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-foreground dark:text-foreground-dark">Active Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground dark:text-muted-foreground-dark">Real-time status of all users</p>
        </div>
        <div className="border-t border-border dark:border-border-dark">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark">
              <thead className="bg-background dark:bg-background-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_online
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${
                          user.is_online ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastActive(user.last_seen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard; 