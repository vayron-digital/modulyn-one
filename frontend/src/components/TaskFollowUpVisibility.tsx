import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar, 
  TrendingUp,
  Eye,
  Filter,
  Search,
  RefreshCw,
  User,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  lead_id?: string;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_user?: {
    full_name: string;
    profile_image_url?: string;
  };
  created_user?: {
    full_name: string;
    profile_image_url?: string;
  };
  created_at: string;
  updated_at: string;
}

interface AgentActivity {
  agent_id: string;
  agent_name: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  today_tasks: number;
  completion_rate: number;
  is_online: boolean;
  last_seen: string;
  current_task?: string;
}

export default function TaskFollowUpVisibility() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agentActivity, setAgentActivity] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchAgentActivity();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('task_activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
        fetchAgentActivity();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presence' }, () => {
        fetchAgentActivity();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          lead:leads(first_name, last_name, email),
          assigned_user:profiles!assigned_to(full_name, profile_image_url),
          created_user:profiles!created_by(full_name, profile_image_url)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentActivity = async () => {
    try {
      // Get all agents
      const { data: agents, error: agentsError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .eq('role', 'agent');

      if (agentsError) throw agentsError;

      // Get presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('presence')
        .select('*');

      if (presenceError) throw presenceError;

      // Calculate activity for each agent
      const activity = await Promise.all(
        agents.map(async (agent) => {
          const { data: agentTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', agent.id);

          if (tasksError) throw tasksError;

          const totalTasks = agentTasks?.length || 0;
          const completedTasks = agentTasks?.filter(t => t.status === 'completed').length || 0;
          const overdueTasks = agentTasks?.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
          ).length || 0;
          const todayTasks = agentTasks?.filter(t => 
            t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()
          ).length || 0;

          const presence = presenceData?.find(p => p.user_id === agent.id);
          const isOnline = presence?.status === 'online';
          const lastSeen = presence?.last_seen || '';

          return {
            agent_id: agent.id,
            agent_name: agent.full_name,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            overdue_tasks: overdueTasks,
            today_tasks: todayTasks,
            completion_rate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            is_online: isOnline,
            last_seen: lastSeen,
            current_task: agentTasks?.find(t => t.status === 'in_progress')?.title
          };
        })
      );

      setAgentActivity(activity);
    } catch (error: any) {
      console.error('Error fetching agent activity:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    if (filter === 'today') return task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'in_progress') return task.status === 'in_progress';
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length;
  const todayTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task & Follow-Up Visibility</h2>
          <p className="text-gray-600 dark:text-gray-400">Track team tasks and follow-ups in real-time</p>
        </div>
        <Button onClick={() => fetchTasks()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayTasks}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Activity</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentActivity.map((agent) => (
                    <div key={agent.agent_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{agent.agent_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{agent.agent_name}</span>
                            <div className={`w-2 h-2 rounded-full ${agent.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </div>
                          {agent.current_task && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Working on: {agent.current_task}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{agent.completed_tasks}/{agent.total_tasks}</div>
                        <div className="text-xs text-gray-500">{agent.completion_rate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'completed', label: 'Completed', count: completedTasks, color: 'bg-green-500' },
                    { status: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'bg-blue-500' },
                    { status: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: 'bg-yellow-500' },
                    { status: 'overdue', label: 'Overdue', count: overdueTasks, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <span className="text-sm text-gray-500">
                          ({totalTasks > 0 ? ((item.count / totalTasks) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Activity Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentActivity.map((agent) => (
                  <Card key={agent.agent_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar>
                          <AvatarFallback>{agent.agent_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{agent.agent_name}</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${agent.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.is_online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                          <span className="font-medium">{agent.total_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          <span className="font-medium">{agent.completed_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                          <span className="font-medium text-red-600">{agent.overdue_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Today's Tasks</span>
                          <span className="font-medium">{agent.today_tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                          <span className="font-medium">{agent.completion_rate.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{agent.completed_tasks}/{agent.total_tasks}</span>
                        </div>
                        <Progress value={agent.completion_rate} />
                      </div>

                      {agent.current_task && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Currently working on:</strong> {agent.current_task}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All Tasks
                </Button>
                <Button
                  variant={filter === 'overdue' ? 'default' : 'outline'}
                  onClick={() => setFilter('overdue')}
                >
                  Overdue
                </Button>
                <Button
                  variant={filter === 'today' ? 'default' : 'outline'}
                  onClick={() => setFilter('today')}
                >
                  Today
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => setFilter('in_progress')}
                >
                  In Progress
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                  <p className="text-gray-500">No tasks match the current filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={task.assigned_user?.profile_image_url} />
                            <AvatarFallback>{task.assigned_user?.full_name?.[0] || 'T'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.lead && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Lead: {task.lead.first_name} {task.lead.last_name}
                              </p>
                            )}
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.assigned_user?.full_name}
                          </p>
                          {task.due_date && (
                            <p className={`text-sm ${
                              new Date(task.due_date) < new Date() && task.status !== 'completed'
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}>
                              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 