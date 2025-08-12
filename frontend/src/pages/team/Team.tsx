import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { Plus, Mail, Phone, UserPlus, Building, Shield, Users, Crown, Star, Target, TrendingUp, Activity, Calendar, Eye, Edit } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayout } from '../../components/layout/DashboardLayout';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  reports_to: string | null;
  avatar_url: string | null;
  phone: string | null;
  joined_date: string;
  status: string;
  team_id: string;
  manager?: {
    full_name: string;
    email: string;
  };
  subordinates?: TeamMember[];
}

const Team = () => {
  const { user } = useAuth();
  const { setHeader } = useLayout();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    managers: 0,
    newThisMonth: 0
  });

  // Set up header
  useEffect(() => {
    setHeader({
      title: 'Team Management',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Team' }
      ],
      tabs: [
        { label: 'All Members', href: '/team', active: true },
        { label: 'Hierarchy', href: '/team/hierarchy' },
        { label: 'Analytics', href: '/team/analytics' }
      ]
    });
  }, [setHeader]);

  // Table columns configuration
  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (value: string, row: TeamMember) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{value.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'manager' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (value: string) => <span className="text-sm">{value || '—'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (value: any) => (
        <span className="text-sm">{value?.full_name || '—'}</span>
      )
    },
    {
      key: 'joined_date',
      label: 'Joined',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply search
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the data to add manager information if reports_to exists
      const processedData = (data || []).map(member => {
        const manager = data?.find(m => m.id === member.reports_to);
        return {
          ...member,
          manager: manager ? {
            full_name: manager.full_name,
            email: manager.email
          } : null
        };
      });

      setTeamMembers(processedData);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));

      // Calculate stats
      if (processedData) {
        const total = processedData.length;
        const active = processedData.filter(m => m.status === 'active').length;
        const managers = processedData.filter(m => m.role === 'manager').length;
        const newThisMonth = processedData.filter(m => {
          const joinedDate = new Date(m.joined_date);
          const now = new Date();
          return joinedDate.getMonth() === now.getMonth() && 
                 joinedDate.getFullYear() === now.getFullYear();
        }).length;

        setStats({ total, active, managers, newThisMonth });
      }

    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortColumn, sortDirection, currentPage]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    // Handle delete logic here
  };

  const confirmDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedMember.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member deleted successfully"
      });

      fetchTeamMembers();
      setSelectedMember(null);

    } catch (err: any) {
      console.error('Error deleting team member:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete team member",
        variant: "destructive"
      });
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleViewMember = (member: TeamMember) => {
    navigate(`/team/${member.id}`);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedMember.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member deleted successfully"
      });

      setSelectedMember(null);
      fetchTeamMembers();

    } catch (err: any) {
      console.error('Error deleting team member:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete team member",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading team members</div>
          <Button onClick={fetchTeamMembers}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">
              Leadership team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Recent additions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your team members and their roles
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={teamMembers}
            columns={columns}
            search={search}
            onSearchChange={setSearch}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              pageSize: 10,
              onPageChange: setCurrentPage
            }}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            selectable={true}
            selectedRows={selectedMember ? [selectedMember.id] : []}
            onSelectionChange={(ids) => {
              const member = teamMembers.find(m => m.id === ids[0]);
              setSelectedMember(member || null);
            }}
            sortable={true}
            onSort={handleSort}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team. They will receive an invitation email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Full name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                defaultValue={selectedMember?.full_name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                defaultValue={selectedMember?.email}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select defaultValue={selectedMember?.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select defaultValue={selectedMember?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditModal(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team; 