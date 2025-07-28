import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Key,
  Briefcase
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  profile_image_url?: string;
  permissions?: string[];
  department?: string;
  position?: string;
  last_login?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

const ROLES = [
  { value: 'owner', label: 'Tenancy Owner', description: 'Full system access' },
  { value: 'admin', label: 'Administrator', description: 'Manage users and teams' },
  { value: 'manager', label: 'Manager', description: 'Team management and reporting' },
  { value: 'agent', label: 'Agent', description: 'Basic user access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
];

const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'User Management', granted: false },
  { id: 'team_management', name: 'Team Management', description: 'Manage team structure and hierarchy', category: 'User Management', granted: false },
  { id: 'role_assignment', name: 'Role Assignment', description: 'Assign roles and permissions to users', category: 'User Management', granted: false },
  
  // Data Access
  { id: 'view_all_leads', name: 'View All Leads', description: 'Access to all leads in the system', category: 'Data Access', granted: false },
  { id: 'edit_all_leads', name: 'Edit All Leads', description: 'Modify any lead information', category: 'Data Access', granted: false },
  { id: 'delete_leads', name: 'Delete Leads', description: 'Remove leads from the system', category: 'Data Access', granted: false },
  
  // Reports & Analytics
  { id: 'view_reports', name: 'View Reports', description: 'Access to all reports and analytics', category: 'Reports', granted: false },
  { id: 'export_data', name: 'Export Data', description: 'Export data in various formats', category: 'Reports', granted: false },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access to advanced analytics', category: 'Reports', granted: false },
  
  // System Settings
  { id: 'system_settings', name: 'System Settings', description: 'Modify system-wide settings', category: 'System', granted: false },
  { id: 'integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'System', granted: false },
  { id: 'backup_restore', name: 'Backup & Restore', description: 'Manage data backup and restoration', category: 'System', granted: false },
];

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'agent',
    department: '',
    position: '',
    permissions: [] as string[]
  });
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);
  const [newPassword, setNewPassword] = useState('');

  const isOwner = user?.role === 'owner' || user?.is_admin;
  const isAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [isAdmin]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch permissions for each user
      const membersWithPermissions = await Promise.all(
        (data || []).map(async (member) => {
          const { data: userPermissions } = await supabase
            .from('user_permissions')
            .select('permissions')
            .eq('user_id', member.id)
            .single();

          return {
            ...member,
            permissions: userPermissions?.permissions || []
          };
        })
      );

      setTeamMembers(membersWithPermissions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      setLoading(true);
      
      // Create user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        password: tempPassword,
        email_confirm: true
      });
      
      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: inviteData.email,
          role: inviteData.role,
          is_admin: inviteData.role === 'admin' || inviteData.role === 'owner',
          full_name: inviteData.email.split('@')[0], // Temporary name
          department: inviteData.department,
          position: inviteData.position
        });

      if (profileError) throw profileError;

      // Set permissions if any
      if (inviteData.permissions.length > 0) {
        const { error: permissionError } = await supabase
          .from('user_permissions')
          .insert({
            user_id: authUser.user.id,
            permissions: inviteData.permissions
          });

        if (permissionError) throw permissionError;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteData.email}`,
      });

      setInviteData({ email: '', role: 'agent', department: '', position: '', permissions: [] });
      setShowInviteModal(false);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      const grantedPermissions = permissions.filter(p => p.granted).map(p => p.id);
      
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: selectedMember.id,
          permissions: grantedPermissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });

      setShowPermissionModal(false);
      setSelectedMember(null);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.admin.updateUserById(
        selectedMember.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setShowPasswordModal(false);
      setSelectedMember(null);
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          is_admin: newRole === 'admin' || newRole === 'owner',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You need administrator privileges to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage team members, roles, and permissions</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.is_admin).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'manager').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={member.profile_image_url} />
                          <AvatarFallback>{member.full_name?.[0] || member.email[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select value={member.role} onValueChange={(value) => handleUpdateRole(member.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.department || '-'}</div>
                      <div className="text-sm text-gray-500">{member.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowPermissionModal(true);
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowPasswordModal(true);
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(member.id, member.status)}
                        >
                          {member.status === 'active' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      <DialogRoot open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@company.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invite-department">Department</Label>
              <Input
                id="invite-department"
                value={inviteData.department}
                onChange={(e) => setInviteData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Sales, Marketing, etc."
              />
            </div>
            <div>
              <Label htmlFor="invite-position">Position</Label>
              <Input
                id="invite-position"
                value={inviteData.position}
                onChange={(e) => setInviteData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Manager, Agent, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button 
              onClick={handleInviteMember}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Permissions Modal */}
      <DialogRoot open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedMember?.full_name}</DialogTitle>
            <DialogDescription>Configure what this user can access and modify</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(
              permissions.reduce((acc, permission) => {
                if (!acc[permission.category]) acc[permission.category] = [];
                acc[permission.category].push(permission);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([category, perms]) => (
              <div key={category}>
                <h3 className="font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  {perms.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                      <Switch
                        checked={permission.granted}
                        onCheckedChange={(checked: boolean) => {
                          setPermissions(prev => 
                            prev.map(p => p.id === permission.id ? { ...p, granted: checked } : p)
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionModal(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdatePermissions}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Change Password Modal */}
      <DialogRoot open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password - {selectedMember?.full_name}</DialogTitle>
            <DialogDescription>Set a new password for this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button 
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
} 