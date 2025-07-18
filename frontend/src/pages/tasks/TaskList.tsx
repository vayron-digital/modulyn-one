import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Tag
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string;
  assigned_to: {
    id: string;
    name: string;
    avatar_url: string;
  };
  created_by: {
    id: string;
    name: string;
  };
  tags: string[];
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800'
};

export default function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_date,
          assigned_to:users!tasks_assigned_to_fkey(id, name, avatar_url),
          created_by:users!tasks_created_by_fkey(id, name),
          tags
        `)
        .order('due_date', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => navigate('/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </Select>
          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
          <Select
            value={filters.assignedTo}
            onValueChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}
          >
            <option value="">All Assignees</option>
            {/* Add user options here */}
          </Select>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                  <User className="h-4 w-4 ml-2" />
                  <span>{task.assigned_to.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {task.status}
                </Badge>
              </div>
            </div>
            {task.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 