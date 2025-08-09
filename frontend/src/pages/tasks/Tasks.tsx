import React, { useState, useEffect } from 'react';
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
  Settings
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from '@hello-pangea/dnd';

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
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  title_template: string;
  description_template: string;
  estimated_duration: number;
  priority: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TaskDependency {
  id: string;
  parent_task_id: string;
  child_task_id: string;
  created_at: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Call {
  id: string;
  lead_id: string;
  call_date: string;
  outcome: string;
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const TASK_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'Cancelled',
  'On Hold'
];

const TASK_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

const PAGE_SIZE = 10;

const Tasks = () => {
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { toast } = useToast();
  const { setHeader } = useLayout();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    assignedTo: 'All',
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'due_date', direction: 'asc'});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
    assigned_to: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [taskDependencies, setTaskDependencies] = useState<TaskDependency[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  // New task state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    due_date: '',
    due_time: '',
    assigned_to: 'unassigned'
  });

  // Set header with breadcrumbs
  useEffect(() => {
    setHeader({
      title: '',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Task Management' }
      ],
      tabs: [],
    });
  }, [setHeader]);

  useEffect(() => {
    fetchTasks();
    fetchProfiles();
    fetchStats();
    fetchTaskTemplates();
    fetchLeads();
    fetchCalls();
    fetchTaskDependencies();
  }, [page, search, filters, sort]);

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      status: 'Not Started',
      priority: 'Medium',
      due_date: '',
      due_time: '',
      assigned_to: 'unassigned',
    });
  };

  const handleAddTask = async () => {
    try {
      // Validate required fields
      if (!newTask.title || !newTask.status || !newTask.priority) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // First, get the user's profile to get the tenant_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Error',
          description: 'Failed to get user profile',
          variant: 'destructive'
        });
        return;
      }

      // Combine date and time
      let dueDate = null;
      if (newTask.due_date) {
        if (newTask.due_time) {
          dueDate = `${newTask.due_date}T${newTask.due_time}`;
        } else {
          dueDate = `${newTask.due_date}T00:00`;
        }
      }

      // Format the data properly for database
      const taskData = {
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status === 'Not Started' ? 'pending' :
                newTask.status === 'In Progress' ? 'in_progress' :
                newTask.status === 'Completed' ? 'completed' :
                newTask.status === 'Cancelled' ? 'cancelled' :
                newTask.status === 'On Hold' ? 'on_hold' : 'pending',
        priority: newTask.priority.toLowerCase(),
        due_date: dueDate,
        assigned_to: newTask.assigned_to === 'unassigned' ? null : newTask.assigned_to,
        created_by: user?.id,
        tenant_id: profile.tenant_id
      };

      console.log('Inserting task data:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Task created successfully:', data);

      setShowAddModal(false);
      resetNewTask();
      fetchTasks();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  const handleEditTask = async () => {
    console.log('handleEditTask called');
    console.log('selectedTask:', selectedTask);
    
    if (!selectedTask) {
      console.log('No selectedTask, returning');
      return;
    }

    try {
      console.log('Updating task with data:', {
        title: selectedTask.title,
        description: selectedTask.description,
        status: getDbStatus(selectedTask.status),
        priority: selectedTask.priority.toLowerCase(),
        due_date: selectedTask.due_date,
        assigned_to: selectedTask.assigned_to,
      });

      const { error } = await supabase
        .from('tasks')
        .update({
          title: selectedTask.title,
          description: selectedTask.description,
          status: getDbStatus(selectedTask.status),
          priority: selectedTask.priority.toLowerCase(),
          due_date: selectedTask.due_date,
          assigned_to: selectedTask.assigned_to,
        })
        .eq('id', selectedTask.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task updated successfully');
      setShowEditModal(false);
      setSelectedTask(null);
      fetchTasks();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchTasks();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, due_date');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      const tasks = data || [];
      const today = new Date();
      
      setStats({
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length,
        overdue: tasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate < today && task.status !== 'completed';
        }).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status !== 'All') {
        query = query.eq('status', filters.status.toLowerCase().replace(' ', '_'));
      }
      if (filters.priority !== 'All') {
        query = query.eq('priority', filters.priority.toLowerCase());
      }
      if (filters.assignedTo !== 'All') {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      // Apply search
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sort.key, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      setTasks((data || []) as Task[]);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelected(prev => 
      prev.length === tasks.length ? [] : tasks.map(t => t.id)
    );
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Not Started': 'bg-slate-100 text-slate-700 border-slate-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
      'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'Low': 'bg-slate-100 text-slate-700 border-slate-200',
      'Medium': 'bg-blue-100 text-blue-700 border-blue-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Urgent': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <Play className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      case 'On Hold': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Low': return <StarOff className="h-4 w-4" />;
      case 'Medium': return <Star className="h-4 w-4" />;
      case 'High': return <Zap className="h-4 w-4" />;
      case 'Urgent': return <AlertCircle className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  // Quick status update function
  const handleQuickStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const dbStatus = getDbStatus(newStatus);
      const { error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: dbStatus }
          : task
      ));

      fetchStats();
      toast({
        title: 'Success',
        description: 'Task status updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  // Helper function to map database status to display status
  const getDisplayStatus = (dbStatus: string) => {
    switch (dbStatus) {
      case 'pending': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'on_hold': return 'On Hold';
      default: return 'Not Started';
    }
  };

  // Helper function to map display status to database status
  const getDbStatus = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Not Started': return 'pending';
      case 'In Progress': return 'in_progress';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      case 'On Hold': return 'on_hold';
      default: return 'pending';
    }
  };

  // Fetch task templates
  const fetchTaskTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTaskTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching task templates:', error);
    }
  };

  // Fetch leads for templates
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
    }
  };

  // Fetch calls for templates
  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id, 
          lead_id, 
          call_date, 
          outcome,
          lead:leads(id, first_name, last_name, email, phone)
        `)
        .order('call_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error: any) {
      console.error('Error fetching calls:', error);
    }
  };

  // Fetch task dependencies
  const fetchTaskDependencies = async () => {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*');

      if (error) throw error;
      setTaskDependencies(data || []);
    } catch (error: any) {
      console.error('Error fetching task dependencies:', error);
    }
  };

  // Apply template to create task
  const applyTemplate = (template: TaskTemplate | null, lead?: Lead, call?: any) => {
    let title = template?.title_template || '';
    let description = template?.description_template || '';

    // Replace placeholders
    if (lead) {
      const leadName = `${lead.first_name} ${lead.last_name}`;
      title = title.replace(/\{\{lead_name\}\}/g, leadName);
      description = description.replace(/\{\{lead_name\}\}/g, leadName);
    }

    if (call) {
      const callDate = format(new Date(call.call_date), 'MMM dd, yyyy');
      title = title.replace(/\{\{call_date\}\}/g, callDate);
      description = description.replace(/\{\{call_date\}\}/g, callDate);
    }

    setNewTask({
      title,
      description,
      status: 'Not Started',
      priority: template?.priority ? template.priority.charAt(0).toUpperCase() + template.priority.slice(1) : 'Medium',
      due_date: '',
      due_time: '',
      assigned_to: 'unassigned'
    });

    setShowTemplatesModal(false);
    setShowAddModal(true);
  };

  // Create task instantly from template
  const createTaskFromTemplate = async (template: TaskTemplate | null, lead?: Lead, call?: any) => {
    try {
      setIsCreatingTask(true);
      
      // If no template provided, create a default one
      if (!template) {
        const defaultTemplate: TaskTemplate = {
          id: 'default',
          name: 'Quick Task',
          description: 'Create a quick task',
          template_type: 'custom',
          title_template: lead ? `Follow-up with ${lead.first_name} ${lead.last_name}` : 
                         call && call.lead ? `Follow-up call with ${call.lead.first_name} ${call.lead.last_name}` : 
                         'New Task',
          description_template: 'Quick task created from suggested tasks',
          estimated_duration: 30,
          priority: 'medium',
          created_by: user?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        template = defaultTemplate;
      }
      
      let title = template.title_template;
      let description = template.description_template || '';

      // Replace placeholders
      if (lead) {
        const leadName = `${lead.first_name} ${lead.last_name}`;
        title = title.replace(/\{\{lead_name\}\}/g, leadName);
        description = description.replace(/\{\{lead_name\}\}/g, leadName);
      }

      if (call) {
        const callDate = format(new Date(call.call_date), 'MMM dd, yyyy');
        title = title.replace(/\{\{call_date\}\}/g, callDate);
        description = description.replace(/\{\{call_date\}\}/g, callDate);
      }

      // Get user's profile for tenant_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Error',
          description: 'Failed to get user profile',
          variant: 'destructive'
        });
        return;
      }

      // Create task data
      const taskData = {
        title,
        description,
        status: 'pending',
        priority: template.priority.toLowerCase(),
        due_date: null,
        assigned_to: null,
        created_by: user?.id,
        tenant_id: profile.tenant_id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Task created from template:', data);

      // Refresh data
      fetchTasks();
      fetchStats();

      toast({
        title: 'Success',
        description: `Task "${title}" created successfully!`,
      });

      setShowTemplatesModal(false);
    } catch (error: any) {
      console.error('Error creating task from template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    const taskId = draggableId;

    try {
      const dbStatus = getDbStatus(newStatus);
      const { error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: dbStatus } : task
      ));

      fetchStats();
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  // Add task dependency
  const addTaskDependency = async (parentTaskId: string, childTaskId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .insert([{
          parent_task_id: parentTaskId,
          child_task_id: childTaskId
        }]);

      if (error) throw error;

      fetchTaskDependencies();
      toast({
        title: 'Success',
        description: 'Task dependency added',
      });
    } catch (error: any) {
      console.error('Error adding task dependency:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task dependency',
        variant: 'destructive'
      });
    }
  };

  // Remove task dependency
  const removeTaskDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;

      fetchTaskDependencies();
      toast({
        title: 'Success',
        description: 'Task dependency removed',
      });
    } catch (error: any) {
      console.error('Error removing task dependency:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove task dependency',
        variant: 'destructive'
      });
    }
  };

  // Get child tasks for a task
  const getChildTasks = (taskId: string) => {
    return taskDependencies
      .filter(dep => dep.parent_task_id === taskId)
      .map(dep => tasks.find(task => task.id === dep.child_task_id))
      .filter(Boolean) as Task[];
  };

  // Get parent tasks for a task
  const getParentTasks = (taskId: string) => {
    return taskDependencies
      .filter(dep => dep.child_task_id === taskId)
      .map(dep => tasks.find(task => task.id === dep.parent_task_id))
      .filter(Boolean) as Task[];
  };

  if (loading) return <FullScreenLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadingState
      loading={authLoading}
      error={authError}
      type="page"
      message="Loading tasks..."
    >
      <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-primary pt-20">
        {/* Hero Section with Floating KPIs */}
        <div className="relative bg-gradient-to-r from-obsidian-veil via-charcoal-tint to-obsidian-veil text-text-on-dark mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <h1 className="text-4xl text-text-on-dark font-bold tracking-tighter">Task Central</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-states-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-text-on-dark font-semibold tracking-wide">Live Updates</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input
                    placeholder="Search tasks, priorities..."
                    value={search}
                    onChange={handleSearchInput}
                    className="pl-12 w-96 bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20 backdrop-blur-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
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

            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-surface-primary/20 via-surface-primary/10 to-surface-secondary/20 backdrop-blur-xl rounded-2xl p-6 border border-surface-primary/30 hover:border-primary-default/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-on-dark/80 text-sm font-medium mb-2">Total Tasks</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-text-on-dark">{stats.total}</p>
                      <span className="text-xs text-states-success">+12%</span>
                    </div>
                    <p className="text-xs text-text-on-dark/60 mt-1">This month</p>
                  </div>
                  <div className="p-3 bg-primary-default/20 rounded-xl">
                    <Target className="h-6 w-6 text-primary-default" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-states-success/20 via-states-success/10 to-states-success/5 backdrop-blur-xl rounded-2xl p-6 border border-states-success/30 hover:border-states-success/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-on-dark/80 text-sm font-medium mb-2">Completed</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-states-success">{stats.completed}</p>
                      <span className="text-xs text-states-success">↗ 8%</span>
                    </div>
                    <p className="text-xs text-text-on-dark/60 mt-1">Success rate: 94%</p>
                  </div>
                  <div className="p-3 bg-states-success/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-states-success" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-decorative-default/20 via-decorative-default/10 to-decorative-tint/20 backdrop-blur-xl rounded-2xl p-6 border border-decorative-default/30 hover:border-decorative-default/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-on-dark/80 text-sm font-medium mb-2">In Progress</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-decorative-default">{stats.inProgress}</p>
                      <span className="text-xs text-decorative-default">Active</span>
                    </div>
                    <p className="text-xs text-text-on-dark/60 mt-1">Avg. 2.3 days</p>
                  </div>
                  <div className="p-3 bg-decorative-default/20 rounded-xl">
                    <Activity className="h-6 w-6 text-decorative-default" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-states-error/20 via-states-error/10 to-states-error/5 backdrop-blur-xl rounded-2xl p-6 border border-states-error/30 hover:border-states-error/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-on-dark/80 text-sm font-medium mb-2">Overdue</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-states-error">{stats.overdue}</p>
                      <span className="text-xs text-states-error">Critical</span>
                    </div>
                    <p className="text-xs text-text-on-dark/60 mt-1">Needs attention</p>
                  </div>
                  <div className="p-3 bg-states-error/20 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-states-error" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-surface-primary/70 backdrop-blur-xl rounded-2xl p-6 mx-6 -mt-6 mb-6 border border-surface-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* View Mode Controls */}
            <div className="flex items-center space-x-4">
              <div className="bg-surface-secondary/30 rounded-xl p-1 backdrop-blur-sm">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-primary-default text-primary-on-primary shadow-lg' : 'text-text-secondary hover:text-text-heading hover:bg-surface-secondary/50'}
                >
                  <List className="h-4 w-4 mr-2" />
                  List View
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className={viewMode === 'kanban' ? 'bg-primary-default text-primary-on-primary shadow-lg' : 'text-text-secondary hover:text-text-heading hover:bg-surface-secondary/50'}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-surface-primary/50 backdrop-blur-sm border-surface-secondary/50 hover:bg-surface-secondary/30 text-text-secondary hover:text-text-heading"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </div>

            {/* Action Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplatesModal(true)}
                className="bg-gradient-to-r from-decorative-tint/20 to-decorative-default/20 border-decorative-default/30 hover:from-decorative-tint/30 hover:to-decorative-default/30 text-decorative-default hover:text-decorative-shade"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-surface-primary/50 backdrop-blur-sm border-surface-secondary/50 hover:bg-surface-secondary/30 text-text-secondary hover:text-text-heading"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-primary-default to-primary-tint hover:from-primary-tint hover:to-primary-shade text-primary-on-primary border-none shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Filters */}
      {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    {TASK_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Priorities</SelectItem>
                    {TASK_PRIORITIES.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.assignedTo} onValueChange={(value) => handleFilterChange('assignedTo', value)}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50">
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Assignees</SelectItem>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg overflow-hidden">
          {viewMode === 'list' && (
            <div className="overflow-x-auto pb-8">
          <Table>
            <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700">
                  <input
                    type="checkbox"
                        checked={selected.length === tasks.length && tasks.length > 0}
                    onChange={handleSelectAll}
                        className="rounded border-slate-300"
                  />
                </TableHead>
                    <TableHead className="font-semibold text-slate-700">Task</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Priority</TableHead>
                    <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
                    <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(task.id)}
                      onChange={() => handleSelect(task.id)}
                          className="rounded border-slate-300"
                    />
                  </TableCell>
                  <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{task.title}</div>
                          <div className="text-sm text-slate-500 truncate max-w-xs">{task.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={getDisplayStatus(task.status)}
                      onValueChange={(value) => handleQuickStatusUpdate(task.id, value)}
                    >
                      <SelectTrigger className="w-auto border-0 p-0 h-auto bg-transparent">
                        <Badge className={`${getStatusBadgeColor(task.status)} border cursor-pointer hover:opacity-80`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{getDisplayStatus(task.status)}</span>
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="z-[600]">
                        {TASK_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                status === 'Not Started' ? 'bg-slate-400' :
                                status === 'In Progress' ? 'bg-blue-400' :
                                status === 'Completed' ? 'bg-green-400' :
                                status === 'Cancelled' ? 'bg-red-400' :
                                'bg-yellow-400'
                              }`} />
                              <span>{status}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                        <Badge className={`${getPriorityBadgeColor(task.priority)} border`}>
                          {getPriorityIcon(task.priority)}
                          <span className="ml-1">{task.priority}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {task.due_date ? (
                        <div>
                          <div className="font-medium">
                            {format(new Date(task.due_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(task.due_date), 'h:mm a')}
                          </div>
                        </div>
                      ) : 'No due date'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {profiles.find(p => p.id === task.assigned_to)?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-600">
                        {profiles.find(p => p.id === task.assigned_to)?.full_name || 'Unassigned'}
                      </span>
                      {/* Dependency indicators */}
                      {(getChildTasks(task.id).length > 0 || getParentTasks(task.id).length > 0) && (
                        <div className="flex items-center space-x-1">
                          {getChildTasks(task.id).length > 0 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              <Link className="h-3 w-3 mr-1" />
                              {getChildTasks(task.id).length}
                            </Badge>
                          )}
                          {getParentTasks(task.id).length > 0 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              <Unlink className="h-3 w-3 mr-1" />
                              {getParentTasks(task.id).length}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask({
                            ...task,
                            status: getDisplayStatus(task.status),
                            priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                          });
                          setShowEditModal(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask({
                            ...task,
                            status: getDisplayStatus(task.status),
                            priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                          });
                          setShowDependenciesModal(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <Card key={task.id} className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-slate-900 mb-2">{task.title}</CardTitle>
                          <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Select
                            value={getDisplayStatus(task.status)}
                            onValueChange={(value) => handleQuickStatusUpdate(task.id, value)}
                          >
                            <SelectTrigger className="w-auto border-0 p-0 h-auto bg-transparent">
                              <Badge className={`${getStatusBadgeColor(task.status)} border cursor-pointer hover:opacity-80`}>
                                {getStatusIcon(task.status)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent className="z-[600]">
                              {TASK_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      status === 'Not Started' ? 'bg-slate-400' :
                                      status === 'In Progress' ? 'bg-blue-400' :
                                      status === 'Completed' ? 'bg-green-400' :
                                      status === 'Cancelled' ? 'bg-red-400' :
                                      'bg-yellow-400'
                                    }`} />
                                    <span>{status}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Badge className={`${getPriorityBadgeColor(task.priority)} border`}>
                            {getPriorityIcon(task.priority)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <User className="h-4 w-4 mr-2" />
                          {profiles.find(p => p.id === task.assigned_to)?.full_name || 'Unassigned'}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask({
                                  ...task,
                                  status: getDisplayStatus(task.status),
                                  priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                                });
                                setShowEditModal(true);
                              }}
                              className="h-8 px-3 text-xs hover:bg-slate-100"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-xs hover:bg-slate-100"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-8 px-3 text-xs hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
        </CardContent>
      </Card>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'kanban' && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {TASK_STATUSES.map((status) => (
                    <div key={status} className="bg-slate-50/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{status}</h3>
                        <Badge className="bg-slate-200 text-slate-700">
                          {tasks.filter(task => task.status === getDbStatus(status)).length}
                        </Badge>
                      </div>
                      <Droppable droppableId={status}>
                        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-3 min-h-[200px] ${
                              snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''
                            }`}
                          >
                            {tasks
                              .filter(task => task.status === getDbStatus(status))
                              .map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`${
                                        snapshot.isDragging ? 'rotate-2 shadow-xl' : ''
                                      }`}
                                    >
                                      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-3">
                                          <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-slate-900">{task.title}</h4>
                                            <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                                            <div className="flex items-center justify-between">
                                              <Badge className={`${getPriorityBadgeColor(task.priority)} border text-xs`}>
                                                {getPriorityIcon(task.priority)}
                                              </Badge>
                                              <span className="text-xs text-slate-500">
                                                {task.due_date ? (
                                                  <div>
                                                    <div>{format(new Date(task.due_date), 'MMM dd')}</div>
                                                    <div>{format(new Date(task.due_date), 'h:mm a')}</div>
                                                  </div>
                                                ) : 'No due date'}
                                              </span>
                                            </div>
                                            {/* Dependency indicators */}
                                            {(getChildTasks(task.id).length > 0 || getParentTasks(task.id).length > 0) && (
                                              <div className="flex items-center space-x-1 pt-1 border-t border-slate-200/50">
                                                {getChildTasks(task.id).length > 0 && (
                                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                                    <Link className="h-3 w-3 mr-1" />
                                                    {getChildTasks(task.id).length}
                                                  </Badge>
                                                )}
                                                {getParentTasks(task.id).length > 0 && (
                                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                                    <Unlink className="h-3 w-3 mr-1" />
                                                    {getParentTasks(task.id).length}
                                                  </Badge>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </div>
            </DragDropContext>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, tasks.length)} of {tasks.length} tasks
            </div>
            <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
                onClick={() => setPage(page - 1)}
            disabled={page === 1}
                className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={pageNum === page 
                      ? "bg-blue-600 text-white" 
                      : "bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70"
                    }
                  >
                    {pageNum}
          </Button>
                ))}
              </div>
          <Button
            variant="outline"
            size="sm"
                onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
                className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70"
          >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <DialogRoot open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-lg max-h-[90vh] z-[500] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Create New Task</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Add a new task to your workflow
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                className="hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-6">
            <div className="space-y-4">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-slate-500" />
                  Task Title *
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title..."
                  className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2 text-slate-500" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description..."
                  className="min-h-[80px] bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Play className="h-4 w-4 mr-2 text-slate-500" />
                    Status *
                  </Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                  >
                    <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="z-[600]">
                      {TASK_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'Not Started' ? 'bg-slate-400' :
                              status === 'In Progress' ? 'bg-blue-400' :
                              status === 'Completed' ? 'bg-green-400' :
                              status === 'Cancelled' ? 'bg-red-400' :
                              'bg-yellow-400'
                            }`} />
                            <span>{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-slate-500" />
                    Priority *
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="z-[600]">
                      {TASK_PRIORITIES.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              priority === 'Low' ? 'bg-slate-400' :
                              priority === 'Medium' ? 'bg-blue-400' :
                              priority === 'High' ? 'bg-orange-400' :
                              'bg-red-400'
                            }`} />
                            <span>{priority}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date and Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    Due Date
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_time" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-500" />
                    Due Time
                  </Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={newTask.due_time}
                    onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
                    className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-sm font-semibold text-slate-700 flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  Assign To
                </Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                >
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="z-[600]">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                            {profile.full_name?.[0]}
                          </div>
                          <span>{profile.full_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/50 border-t border-slate-200/50 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTask}
                  disabled={!newTask.title || !newTask.status || !newTask.priority}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit Task Modal */}
      <DialogRoot open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-lg max-h-[90vh] z-[500] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                  <Edit className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Edit Task</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Update task details
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditModal(false)}
                className="hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-6">
            {selectedTask && (
              <div className="space-y-4">
                {/* Task Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-slate-500" />
                    Task Title *
                  </Label>
                  <Input
                    id="edit-title"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                    placeholder="Enter task title..."
                    className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Task Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-sm font-semibold text-slate-700 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-slate-500" />
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={selectedTask.description}
                    onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                    placeholder="Enter task description..."
                    className="min-h-[80px] bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Play className="h-4 w-4 mr-2 text-slate-500" />
                      Status *
                    </Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) => setSelectedTask({ ...selectedTask, status: value })}
                    >
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="z-[600]">
                        {TASK_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                status === 'Not Started' ? 'bg-slate-400' :
                                status === 'In Progress' ? 'bg-blue-400' :
                                status === 'Completed' ? 'bg-green-400' :
                                status === 'Cancelled' ? 'bg-red-400' :
                                'bg-yellow-400'
                              }`} />
                              <span>{status}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-priority" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-slate-500" />
                      Priority *
                    </Label>
                    <Select
                      value={selectedTask.priority}
                      onValueChange={(value) => setSelectedTask({ ...selectedTask, priority: value })}
                    >
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="z-[600]">
                        {TASK_PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                priority === 'Low' ? 'bg-slate-400' :
                                priority === 'Medium' ? 'bg-blue-400' :
                                priority === 'High' ? 'bg-orange-400' :
                                'bg-red-400'
                              }`} />
                              <span>{priority}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date and Assignee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-due_date" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                      Due Date
                    </Label>
                    <Input
                      id="edit-due_date"
                      type="date"
                      value={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                      onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                      className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-assigned_to" className="text-sm font-semibold text-slate-700 flex items-center">
                      <User className="h-4 w-4 mr-2 text-slate-500" />
                      Assign To
                    </Label>
                    <Select
                      value={selectedTask.assigned_to || 'unassigned'}
                      onValueChange={(value) => setSelectedTask({ ...selectedTask, assigned_to: value === 'unassigned' ? null : value })}
                    >
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="z-[600]">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                                {profile.full_name?.[0]}
                              </div>
                              <span>{profile.full_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-slate-50/50 border-t border-slate-200/50 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Update Task button clicked');
                    console.log('Button disabled check:', {
                      title: selectedTask?.title,
                      status: selectedTask?.status,
                      priority: selectedTask?.priority,
                      isDisabled: !selectedTask?.title || !selectedTask?.status || !selectedTask?.priority
                    });
                    handleEditTask();
                  }}
                  disabled={!selectedTask?.title || !selectedTask?.status || !selectedTask?.priority}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Task
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Task Templates Modal */}
      <DialogRoot open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-4xl max-h-[90vh] z-[500] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200/50 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Suggested Tasks</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Choose from smart task templates or create custom ones
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTemplatesModal(false)}
                className="hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-6">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="templates">Task Templates</TabsTrigger>
                <TabsTrigger value="leads">Lead Follow-ups</TabsTrigger>
                <TabsTrigger value="calls">Call Follow-ups</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {taskTemplates.map((template) => (
                    <Card key={template.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-slate-900 mb-2">{template.name}</CardTitle>
                            <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span>{template.estimated_duration} min</span>
                              <Badge className={`${getPriorityBadgeColor(template.priority)} border`}>
                                {template.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Title:</strong> {template.title_template}
                          </div>
                          {template.description_template && (
                            <div className="text-sm">
                              <strong>Description:</strong> {template.description_template}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => applyTemplate(template)}
                              variant="outline"
                              className="flex-1 bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                            <Button
                              onClick={() => createTaskFromTemplate(template)}
                              disabled={isCreatingTask}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreatingTask ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add as Task
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {taskTemplates.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      <div className="bg-white/70 backdrop-blur-sm border-slate-200/50 rounded-lg p-6">
                        <p className="text-lg font-medium mb-2">No task templates available</p>
                        <p className="text-sm">Task templates will appear here once they're created</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="leads" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => (
                    <Card key={lead.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                              {lead.first_name} {lead.last_name}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mb-2">{lead.email}</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-slate-600">{lead.phone}</p>
                              <Button
                                onClick={() => {
                                  const template = taskTemplates.find(t => t.template_type === 'lead_followup') || null;
                                  if (template) {
                                    createTaskFromTemplate(template, lead);
                                  } else {
                                    createTaskFromTemplate(null, lead);
                                  }
                                }}
                                disabled={isCreatingTask}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCreatingTask ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Quick Add Task
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {taskTemplates
                            .filter(template => template.template_type === 'lead_followup')
                            .map((template) => (
                              <div key={template.id} className="flex space-x-2">
                                <Button
                                  onClick={() => applyTemplate(template, lead)}
                                  variant="outline"
                                  className="flex-1 justify-start bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {template.name}
                                </Button>
                                <Button
                                  onClick={() => createTaskFromTemplate(template, lead)}
                                  disabled={isCreatingTask}
                                  className="flex-1 justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isCreatingTask ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add as Task
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          {taskTemplates.filter(template => template.template_type === 'lead_followup').length === 0 && (
                            <div className="text-center py-4 text-slate-500">
                              <p className="text-sm">No lead follow-up templates available</p>
                              <p className="text-xs mt-1">Use the "Quick Add Task" button above to create a task</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calls" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calls.map((call) => (
                    <Card key={call.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                              Call with {call.lead?.first_name} {call.lead?.last_name}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mb-2">
                              {format(new Date(call.call_date), 'MMM dd, yyyy h:mm a')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${
                                call.outcome === 'Completed' ? 'bg-green-100 text-green-800' :
                                call.outcome === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              } border`}>
                                {call.outcome}
                              </Badge>
                              <Button
                                onClick={() => {
                                  const template = taskTemplates.find(t => t.template_type === 'call_followup') || null;
                                  if (template) {
                                    createTaskFromTemplate(template, call.lead, call);
                                  } else {
                                    createTaskFromTemplate(null, call.lead, call);
                                  }
                                }}
                                disabled={isCreatingTask}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCreatingTask ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Quick Add Task
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {taskTemplates
                            .filter(template => template.template_type === 'call_followup')
                            .map((template) => (
                              <div key={template.id} className="flex space-x-2">
                                <Button
                                  onClick={() => applyTemplate(template, call.lead, call)}
                                  variant="outline"
                                  className="flex-1 justify-start bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {template.name}
                                </Button>
                                <Button
                                  onClick={() => createTaskFromTemplate(template, call.lead, call)}
                                  disabled={isCreatingTask}
                                  className="flex-1 justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isCreatingTask ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add as Task
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          {taskTemplates.filter(template => template.template_type === 'call_followup').length === 0 && (
                            <div className="text-center py-4 text-slate-500">
                              <p className="text-sm">No call follow-up templates available</p>
                              <p className="text-xs mt-1">Use the "Quick Add Task" button above to create a task</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="bg-slate-50/50 border-t border-slate-200/50 pt-4 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setShowTemplatesModal(false)}
              className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Task Dependencies Modal */}
      <DialogRoot open={showDependenciesModal} onOpenChange={setShowDependenciesModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-2xl max-h-[90vh] z-[500] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <Link className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Task Dependencies</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Manage parent-child relationships between tasks
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDependenciesModal(false)}
                className="hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-6">
            {selectedTask && (
              <div className="space-y-6">
                {/* Current Task Info */}
                <div className="bg-slate-50/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Current Task</h3>
                  <div className="text-sm text-slate-600">
                    <strong>{selectedTask.title}</strong>
                    <p className="mt-1">{selectedTask.description}</p>
                  </div>
                </div>

                {/* Parent Tasks */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 flex items-center">
                    <Unlink className="h-4 w-4 mr-2" />
                    Parent Tasks ({getParentTasks(selectedTask.id).length})
                  </h3>
                  {getParentTasks(selectedTask.id).length > 0 ? (
                    <div className="space-y-2">
                      {getParentTasks(selectedTask.id).map((parentTask) => (
                        <Card key={parentTask.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-sm text-slate-900">{parentTask.title}</h4>
                                <p className="text-xs text-slate-600">{parentTask.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const dependency = taskDependencies.find(dep => 
                                    dep.parent_task_id === parentTask.id && dep.child_task_id === selectedTask.id
                                  );
                                  if (dependency) {
                                    removeTaskDependency(dependency.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Unlink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No parent tasks</p>
                  )}
                </div>

                {/* Child Tasks */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 flex items-center">
                    <Link className="h-4 w-4 mr-2" />
                    Child Tasks ({getChildTasks(selectedTask.id).length})
                  </h3>
                  {getChildTasks(selectedTask.id).length > 0 ? (
                    <div className="space-y-2">
                      {getChildTasks(selectedTask.id).map((childTask) => (
                        <Card key={childTask.id} className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-sm text-slate-900">{childTask.title}</h4>
                                <p className="text-xs text-slate-600">{childTask.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const dependency = taskDependencies.find(dep => 
                                    dep.parent_task_id === selectedTask.id && dep.child_task_id === childTask.id
                                  );
                                  if (dependency) {
                                    removeTaskDependency(dependency.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Unlink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No child tasks</p>
                  )}
                </div>

                {/* Add New Dependency */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Add New Dependency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Add as Parent</Label>
                      <Select onValueChange={(value) => {
                        if (value && value !== selectedTask.id) {
                          addTaskDependency(value, selectedTask.id);
                        }
                      }}>
                        <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                          <SelectValue placeholder="Select parent task" />
                        </SelectTrigger>
                        <SelectContent>
                          {tasks
                            .filter(task => task.id !== selectedTask.id)
                            .map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Add as Child</Label>
                      <Select onValueChange={(value) => {
                        if (value && value !== selectedTask.id) {
                          addTaskDependency(selectedTask.id, value);
                        }
                      }}>
                        <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                          <SelectValue placeholder="Select child task" />
                        </SelectTrigger>
                        <SelectContent>
                          {tasks
                            .filter(task => task.id !== selectedTask.id)
                            .map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-slate-50/50 border-t border-slate-200/50 pt-4 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDependenciesModal(false)}
              className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-white/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
    </LoadingState>
  );
};

export default Tasks; 