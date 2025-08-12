import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Check,
  X,
  DollarSign,
  Phone,
  Mail,
  UserPlus,
  PhoneCall,
  CheckSquare,
  XSquare,
  Home,
  LayoutGrid,
  List,
  Pencil,
  Trash,
  Shuffle,
  MessageCircle,
  Users,
  PieChart,
  LineChart,
  RefreshCw,
  Save,
  Share2,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Shield,
  Crown,
  Sparkles,
  Rocket,
  Award,
  Briefcase,
  Globe,
  Heart,
  Settings,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { useLayout } from '../../components/layout/DashboardLayout';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const Tasks = () => {
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { setHeader } = useLayout();
  const { toast } = useToast();

  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    due_date: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Set up header
  useEffect(() => {
    setHeader({
      title: 'Task Management',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tasks' }
      ],
      tabs: [
        { label: 'All Tasks', href: '/tasks', active: true },
        { label: 'My Tasks', href: '/tasks/my' },
        { label: 'Completed', href: '/tasks/completed' }
      ]
    });
  }, [setHeader]);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (value: string, row: Task) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${
              row.priority === 'urgent' ? 'bg-red-500' :
              row.priority === 'high' ? 'bg-orange-500' :
              row.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.description?.substring(0, 50)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'assigned_user',
      label: 'Assigned To',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {value?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{value?.full_name || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: string) => {
        const priorityConfig = {
          urgent: { label: 'Urgent', variant: 'destructive' as const },
          high: { label: 'High', variant: 'default' as const },
          medium: { label: 'Medium', variant: 'secondary' as const },
          low: { label: 'Low', variant: 'outline' as const }
        };
        const config = priorityConfig[value as keyof typeof priorityConfig] || priorityConfig.medium;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
          in_progress: { label: 'In Progress', variant: 'default' as const, icon: Activity },
          completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle },
          cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle }
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
      key: 'due_date',
      label: 'Due Date',
      render: (value: string) => {
        const dueDate = new Date(value);
        const now = new Date();
        const isOverdue = dueDate < now && value !== 'completed';
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {format(dueDate, 'MMM dd, yyyy')}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
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
    // Navigate to task details or show modal
    toast({
      title: "Edit Task",
      description: `Editing task: ${task.title}`
    });
  };

  const handleDeleteTask = (task: Task) => {
    // setSelectedTask(task); // This state is not used for deletion in the new code
    // setShowDeleteModal(true); // This state is not used for deletion in the new code
    toast({
      title: "Delete Task",
      description: `Deleting task: ${task.title}`
    });
  };

  const confirmDeleteTask = async () => {
    // This function is not used in the new code
    // if (!taskToDelete) return;

    // try {
    //   const { error } = await supabase
    //     .from('tasks')
    //     .delete()
    //     .eq('id', taskToDelete.id);

    //   if (error) throw error;

    //   toast({
    //     title: "Success",
    //     description: "Task deleted successfully"
    //   });

    //   fetchTasks();
    //   setShowDeleteModal(false);
    //   setTaskToDelete(null);

    // } catch (err) {
    //   console.error('Error deleting task:', err);
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete task",
    //     variant: "destructive"
    //   });
    // }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    // This function is not used in the new code
    // if (selectedTasks.length === 0) return;

    // try {
    //   const { error } = await supabase
    //     .from('tasks')
    //     .delete()
    //     .in('id', selectedTasks);

    //   if (error) throw error;

    //   toast({
    //     title: "Success",
    //     description: `${selectedTasks.length} tasks deleted successfully`
    //   });

    //   setSelectedTasks([]);
    //   fetchTasks();

    // } catch (err) {
    //   console.error('Error deleting tasks:', err);
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete tasks",
    //     variant: "destructive"
    //   });
    // }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading tasks</div>
          <Button onClick={fetchTasks}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      <div className="relative bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl text-text-on-dark mb-8">
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <h1 className="text-4xl text-text-on-dark font-bold tracking-tighter">Task Management</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 w-96 bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20 backdrop-blur-sm"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="bg-gradient-to-r from-primary-default to-primary-tint hover:from-primary-tint hover:to-primary-shade text-primary-on-primary shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* KPI Cards */}
          </div>
        </div>
      </div>

      <div className="max-w-1vw mx-auto px-6 py-8 space-y-8">
      {/* Main Content - Matching Leads pattern */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            data={tasks}
            columns={columns}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              pageSize: 10,
              onPageChange: setCurrentPage
            }}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            selectable={true}
            selectedRows={[]}
            onSelectionChange={() => {}}
            sortable={true}
            onSort={handleSort}
            loading={loading}
          />
        </CardContent>
      </Card>
      </div>

      {/* Add Task Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Task title"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Task description"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned_to" className="text-right">
                Assign To
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task information and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                defaultValue={selectedTask?.title}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                defaultValue={selectedTask?.description}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select defaultValue={selectedTask?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <Select defaultValue={selectedTask?.priority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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

export default Tasks; 