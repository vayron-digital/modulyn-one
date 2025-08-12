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
import { Plus, Mail, Phone, UserPlus, Building, Shield, Users, Crown, Star, Target, TrendingUp, Activity, Calendar, Eye, Edit, Search, Filter, RefreshCw, LayoutGrid, List, Download, Upload } from 'lucide-react';
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
      {/* Page Header - Matching Dashboard/Leads pattern */}
      <div className="space-y-2">
        <nav className="text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Team Management</span>
        </nav>
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
        <p className="text-gray-600">Manage your team members and hierarchy</p>
      </div>

      {/* Stats Cards - Matching Dashboard pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+12.5%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-blue-100 h-1 mt-2 rounded-full">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+5.2%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-green-100 h-1 mt-2 rounded-full">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Managers</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.managers}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+22.1%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-purple-100 h-1 mt-2 rounded-full">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+5.2%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-orange-100 h-1 mt-2 rounded-full">
              <div className="bg-orange-500 h-1 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar - Matching Leads pattern */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search team members, emails, roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Member
        </Button>
      </div>

      {/* View Options - Matching Leads pattern */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button variant="outline" size="sm">
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="text-sm text-gray-500">
            • {totalItems} members Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Content - Matching Leads pattern */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
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