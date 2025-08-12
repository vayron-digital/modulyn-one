import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  User,
  Clock,
  CheckSquare,
  MoreHorizontal,
  LayoutGrid,
  List,
  Zap,
  Star,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MessageCircle,
  TrendingUp,
  Users,
  Activity,
  Sparkles,
  Rocket,
  Award,
  Settings,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { format } from 'date-fns';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import FilterBar from '../../components/ui/FilterBar';
import useDebounce from '../../hooks/useDebounce';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    full_name: string;
    email: string;
  };
}

const Tasks = () => {
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    due_date: ''
  });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  const debouncedSearch = useDebounce(search, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'on_hold', label: 'On Hold' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Users' },
        ...users.map(user => ({ value: user.id, label: user.full_name }))
      ]
    },
    {
      key: 'due_date',
      label: 'Due Date',
      type: 'date' as const
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (value: string, row: Task) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-slate-900">{row.title}</div>
            <div className="text-sm text-slate-500 truncate max-w-xs">
              {row.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
          in_progress: { label: 'In Progress', variant: 'default' as const, icon: Play },
          completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
          cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
          on_hold: { label: 'On Hold', variant: 'warning' as const, icon: Pause }
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
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
      key: 'priority',
      label: 'Priority',
      render: (value: string) => {
        const priorityConfig = {
          low: { label: 'Low', variant: 'secondary' as const, color: 'text-slate-600' },
          medium: { label: 'Medium', variant: 'default' as const, color: 'text-blue-600' },
          high: { label: 'High', variant: 'warning' as const, color: 'text-orange-600' },
          urgent: { label: 'Urgent', variant: 'destructive' as const, color: 'text-red-600' }
        };
        
        const config = priorityConfig[value as keyof typeof priorityConfig] || priorityConfig.low;
        
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (value: string, row: Task) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {row.assigned_user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-slate-600">
            {row.assigned_user?.full_name || 'Unassigned'}
          </span>
        </div>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: string) => {
        if (!value) return <span className="text-slate-400">No due date</span>;
        
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {format(dueDate, 'MMM dd, yyyy')}
            {isOverdue && <span className="ml-1">(Overdue)</span>}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      )
    }
  ];

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!assigned_to(id, full_name, email)
        `, { count: 'exact' });

      // Apply search
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      // Apply filters
      if (debouncedFilters.status) {
        query = query.eq('status', debouncedFilters.status);
      }
      if (debouncedFilters.priority) {
        query = query.eq('priority', debouncedFilters.priority);
      }
      if (debouncedFilters.assigned_to) {
        query = query.eq('assigned_to', debouncedFilters.assigned_to);
      }
      if (debouncedFilters.due_date) {
        query = query.eq('due_date', debouncedFilters.due_date);
      }

      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTasks(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));

      // Calculate stats
      if (data) {
        const total = data.length;
        const pending = data.filter(t => t.status === 'pending').length;
        const inProgress = data.filter(t => t.status === 'in_progress').length;
        const completed = data.filter(t => t.status === 'completed').length;
        const overdue = data.filter(t => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date();
        }).length;

        setStats({ total, pending, inProgress, completed, overdue });
      }

    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedFilters, sortColumn, sortDirection, currentPage, toast]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  // Handle task actions
  const handleViewTask = (task: Task) => {
    // Navigate to task details or show modal
    toast({
      title: "Task Details",
      description: task.title
    });
  };

  const handleEditTask = (task: Task) => {
    navigate(`/tasks/edit/${task.id}`);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully"
      });

      fetchTasks();
      setShowDeleteModal(false);
      setTaskToDelete(null);

    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', selectedTasks);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedTasks.length} tasks deleted successfully`
      });

      setSelectedTasks([]);
      fetchTasks();

    } catch (err) {
      console.error('Error deleting tasks:', err);
      toast({
        title: "Error",
        description: "Failed to delete tasks",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return <LoadingState />;
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Authentication Error</h3>
          <p className="text-slate-600">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Tasks"
        subtitle="Manage your tasks and track progress"
        icon={<CheckSquare className="h-6 w-6 text-green-600" />}
        stats={[
          {
            label: 'Total Tasks',
            value: stats.total,
            change: 8,
            trend: 'up'
          },
          {
            label: 'Pending',
            value: stats.pending,
            change: 3,
            trend: 'up'
          },
          {
            label: 'In Progress',
            value: stats.inProgress,
            change: 5,
            trend: 'up'
          },
          {
            label: 'Completed',
            value: stats.completed,
            change: 12,
            trend: 'up'
          }
        ]}
        actions={[
          {
            label: 'New Task',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/tasks/new'),
            variant: 'default'
          },
          {
            label: 'Import',
            icon: <Activity className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Import feature will be available soon" }),
            variant: 'outline'
          },
          {
            label: 'Export',
            icon: <Target className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Export feature will be available soon" }),
            variant: 'outline'
          }
        ]}
        search={{
          placeholder: "Search tasks...",
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
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            {selectedTasks.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedTasks.length})
              </Button>
            )}
          </div>
        }
      >
        <FilterBar
          filters={filterOptions}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={() => setFilters({
            status: '',
            priority: '',
            assigned_to: '',
            due_date: ''
          })}
          onClearFilter={(key) => handleFilterChange(key, '')}
        />
      </PageHeader>

      {/* Tasks Table */}
      <DataTable
        data={tasks}
        columns={columns}
        loading={loading}
        emptyMessage="No tasks found"
        onRowClick={handleViewTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        selectable={true}
        selectedRows={selectedTasks}
        onSelectionChange={setSelectedTasks}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks; 