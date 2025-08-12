import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Home, Building, User, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* TOP SECTION: Premium Header with Glass Morphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  Admin Control Center
                </h1>
                <p className="text-lg text-slate-600 font-medium">
                  Oversee and manage your entire CRM ecosystem
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/users"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Users
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI Cards */}
            <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalUsers}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Users</p>
                  </div>
                </div>
            </div>
             <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.activeUsers}</p>
                    <p className="text-sm text-slate-600 font-medium">Active Users</p>
                  </div>
                </div>
            </div>
            <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Home className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalProperties}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Properties</p>
                  </div>
                </div>
            </div>
             <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalLeads}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Leads</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
      {/* Users List */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
          <p className="text-sm text-slate-600">Real-time status of all users</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.full_name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_online
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${
                          user.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`}></span>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatLastActive(user.last_seen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default AdminDashboard; 