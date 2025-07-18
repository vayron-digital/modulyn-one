import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserGroupIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen: string | null;
}

interface PresenceData {
  user_id: string;
  online_at: string;
  presence_ref: string;
}

function UsersManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchUsers();
    const subscription = setupRealtimeSubscription();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setupRealtimeSubscription = () => {
    // Subscribe to presence changes
    const presenceChannel = supabase.channel('presence');
    
    // Handle presence changes
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        updateUsersPresence(presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
        updateUsersPresence(presenceChannel.presenceState());
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        updateUsersPresence(presenceChannel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await presenceChannel.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return presenceChannel;
  };

  const updateUsersPresence = (presenceState: any) => {
    setUsers(currentUsers => {
      return currentUsers.map(user => {
        // Find the user's presence in any of the presence arrays
        const userPresence = Object.values(presenceState).flat().find(
          (p: any) => p.user_id === user.id
        );
        
        return {
          ...user,
          is_online: !!userPresence,
          last_seen: (userPresence && typeof userPresence === 'object' && 'online_at' in userPresence && typeof userPresence.online_at === 'string') ? userPresence.online_at : user.last_seen
        };
      });
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (usersError) throw usersError;

      const transformedUsers = usersData.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active ?? true,
        is_online: false, // Will be updated by presence tracking
        last_seen: null // Will be updated by presence tracking
      }));

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!editingUser.full_name) newErrors.full_name = 'Name is required';
    if (!editingUser.role) newErrors.role = 'Role is required';
    return newErrors;
  };

  const handleUpdateUser = async (user: any) => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active
        })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(currentUsers =>
        currentUsers.map(u =>
          u.id === user.id ? user : u
        )
      );
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      setUsers(currentUsers =>
        currentUsers.map(user =>
          user.id === userId ? { ...user, is_active: false } : user
        )
      );
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => navigate('/admin/users/add')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage user accounts and permissions</p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editingUser);
              }}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="full_name">Name</Label>
                    <Input
                      id="full_name"
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      required
                    />
                    {errors.full_name && <div className="text-red-500 text-xs mt-1">{errors.full_name}</div>}
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editingUser.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === 'active' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default UsersManagement; 