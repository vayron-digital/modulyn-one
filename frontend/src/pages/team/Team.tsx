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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    managers: 0,
    newThisMonth: 0
  });

  // Filter options
  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'agent', label: 'Agent' },
        { value: 'support', label: 'Support' }
      ]
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Departments' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'support', label: 'Support' },
        { value: 'operations', label: 'Operations' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'full_name',
      label: 'Team Member',
      render: (value: string, row: TeamMember) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {row.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">{row.full_name}</div>
            <div className="text-sm text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => {
        const roleConfig = {
          admin: { label: 'Admin', variant: 'destructive' as const, icon: Crown },
          manager: { label: 'Manager', variant: 'default' as const, icon: Shield },
          agent: { label: 'Agent', variant: 'secondary' as const, icon: Users },
          support: { label: 'Support', variant: 'outline' as const, icon: Activity }
        };
        
        const config = roleConfig[value as keyof typeof roleConfig] || roleConfig.agent;
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center space-x-1">
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        );
      }
    },
    {
      key: 'department',
      label: 'Department',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          active: { label: 'Active', variant: 'success' as const },
          inactive: { label: 'Inactive', variant: 'secondary' as const },
          pending: { label: 'Pending', variant: 'warning' as const }
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.inactive;
        
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'reports_to',
      label: 'Reports To',
      render: (value: string, row: TeamMember) => (
        <div className="text-sm text-slate-600">
          {row.manager?.full_name || 'No Manager'}
        </div>
      )
    },
    {
      key: 'joined_date',
      label: 'Joined',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
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

    } catch (err) {
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

  // Handle sort changes
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortColumn(key);
    setSortDirection(direction);
  };

  // Handle member actions
  const handleViewMember = (member: TeamMember) => {
    navigate(`/team/${member.id}`);
  };

  const handleEditMember = (member: TeamMember) => {
    navigate(`/team/edit/${member.id}`);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member deleted successfully"
      });

      fetchTeamMembers();
      setShowDeleteModal(false);
      setMemberToDelete(null);

    } catch (err) {
      console.error('Error deleting team member:', err);
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive"
      });
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', selectedMembers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedMembers.length} team members deleted successfully`
      });

      setSelectedMembers([]);
      fetchTeamMembers();

    } catch (err) {
      console.error('Error deleting team members:', err);
      toast({
        title: "Error",
        description: "Failed to delete team members",
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
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Team</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Team Management"
        subtitle="Manage your team members and hierarchy"
        icon={<Users className="h-6 w-6 text-blue-600" />}
        stats={[
          {
            label: 'Total Members',
            value: stats.total,
            change: 3,
            trend: 'up'
          },
          {
            label: 'Active Members',
            value: stats.active,
            change: 2,
            trend: 'up'
          },
          {
            label: 'Managers',
            value: stats.managers,
            change: 1,
            trend: 'up'
          },
          {
            label: 'New This Month',
            value: stats.newThisMonth,
            change: 5,
            trend: 'up'
          }
        ]}
        actions={[
          {
            label: 'Add Member',
            icon: <UserPlus className="h-4 w-4" />,
            onClick: () => navigate('/team/add'),
            variant: 'default'
          },
          {
            label: 'Invite',
            icon: <Mail className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Invite feature will be available soon" }),
            variant: 'outline'
          }
        ]}
        search={{
          placeholder: "Search team members...",
          value: search,
          onChange: setSearch
        }}
        filters={
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            {selectedMembers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete ({selectedMembers.length})
              </Button>
            )}
          </div>
        }
      />

      {/* Team Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {viewMode === 'table' ? (
            <DataTable
              data={teamMembers}
              columns={columns}
              loading={loading}
              emptyMessage="No team members found"
              onRowClick={handleViewMember}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              selectable={true}
              selectedRows={selectedMembers}
              onSelectionChange={setSelectedMembers}
              sortable={true}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              pagination={{
                currentPage,
                totalPages,
                pageSize: 10,
                totalItems,
                onPageChange: setCurrentPage
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <Avatar className="h-16 w-16 mx-auto">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                              {member.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-slate-900">{member.full_name}</h3>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>

                          <div className="space-y-2">
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {member.department}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone || 'No phone'}</span>
                          </div>

                          <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(member.joined_date).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMember(member);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMember(member);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Team Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Hierarchy View</h3>
                <p className="text-slate-600">Team hierarchy visualization will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Performance Metrics</h3>
                <p className="text-slate-600">Performance tracking and analytics will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{memberToDelete?.full_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team; 