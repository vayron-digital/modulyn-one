import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import {
  Phone, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  PhoneCall,
  PhoneMissed,
  PhoneOutgoing,
  MessageSquare,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  AlertCircle,
  CheckSquare,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

interface ColdCall {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  source?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  outcome?: string;
  comments?: string;
  agent_id: string;
  agent?: {
    full_name: string;
    profile_image_url?: string;
  };
  follow_up_date?: string;
  follow_up_notes?: string;
  call_duration?: number;
  call_attempts: number;
  is_converted: boolean;
  converted_by?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

interface AgentStats {
  agent_id: string;
  agent_name: string;
  total_calls: number;
  completed_calls: number;
  conversion_rate: number;
  avg_call_duration: number;
  today_calls: number;
  is_online: boolean;
  last_seen: string;
}

const CALL_OUTCOMES = [
  { value: 'interested', label: 'Interested', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'call_back', label: 'Call Back Later', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'no_answer', label: 'No Answer', color: 'bg-gray-100 text-gray-800', icon: PhoneMissed },
  { value: 'wrong_number', label: 'Wrong Number', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  { value: 'busy', label: 'Busy', color: 'bg-blue-100 text-blue-800', icon: PhoneCall },
  { value: 'voicemail', label: 'Voicemail', color: 'bg-purple-100 text-purple-800', icon: MessageSquare }
];

const PRIORITY_LEVELS = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
];

export default function ColdCalls() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calls, setCalls] = useState<ColdCall[]>([]);
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ColdCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('calls');

  // Form states
  const [newCall, setNewCall] = useState({
    phone: '',
    name: '',
    email: '',
    source: '',
    priority: 'medium' as const,
    comments: ''
  });

  const [outcomeForm, setOutcomeForm] = useState({
    outcome: '',
    comments: '',
    call_duration: 0,
    follow_up_date: '',
    follow_up_notes: ''
  });

  const [followUpForm, setFollowUpForm] = useState({
    follow_up_date: '',
    follow_up_notes: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    fetchCalls();
    fetchAgentStats();
    const cleanup = setupRealtimeSubscription();
    
    return cleanup;
  }, []);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('cold_calls_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cold_calls' }, () => {
        fetchCalls();
        fetchAgentStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presence' }, () => {
        fetchAgentStats();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cold_calls')
        .select(`
          *,
          agent:profiles!agent_id(full_name, profile_image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (error: any) {
      console.error('Error fetching calls:', error);
      toast({
        title: "Error",
        description: "Failed to load cold calls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentStats = async () => {
    try {
      // Get all agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .eq('role', 'agent');

      if (agentsError) throw agentsError;

      // Get presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('presence')
        .select('*');

      if (presenceError) throw presenceError;

      // Calculate stats for each agent
      const agentStats = await Promise.all(
        agentsData.map(async (agent) => {
          const { data: agentCalls, error: callsError } = await supabase
            .from('cold_calls')
            .select('*')
            .eq('agent_id', agent.id);

          if (callsError) throw callsError;

          const totalCalls = agentCalls?.length || 0;
          const completedCalls = agentCalls?.filter(call => call.status === 'completed').length || 0;
          const convertedCalls = agentCalls?.filter(call => call.is_converted).length || 0;
          const todayCalls = agentCalls?.filter(call => 
            new Date(call.created_at).toDateString() === new Date().toDateString()
          ).length || 0;

          const avgDuration = agentCalls?.length > 0 
            ? agentCalls.reduce((sum, call) => sum + (call.call_duration || 0), 0) / agentCalls.length
            : 0;

          const presence = presenceData?.find(p => p.user_id === agent.id);
          const isOnline = presence?.status === 'online';
          const lastSeen = presence?.last_seen || '';

          return {
            agent_id: agent.id,
            agent_name: agent.full_name,
            total_calls: totalCalls,
            completed_calls: completedCalls,
            conversion_rate: totalCalls > 0 ? (convertedCalls / totalCalls) * 100 : 0,
            avg_call_duration: avgDuration,
            today_calls: todayCalls,
            is_online: isOnline,
            last_seen: lastSeen
          };
        })
      );

      setAgents(agentStats);
    } catch (error: any) {
      console.error('Error fetching agent stats:', error);
    }
  };

  const handleAddCall = async () => {
    try {
      if (!newCall.phone.trim()) {
        toast({
          title: "Validation Error",
          description: "Phone number is required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cold_calls')
        .insert([{
          ...newCall,
          agent_id: user?.id,
          status: 'pending',
          call_attempts: 0
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setNewCall({ phone: '', name: '', email: '', source: '', priority: 'medium', comments: '' });
      fetchCalls();
      toast({
        title: "Success",
        description: "Cold call added successfully",
      });
    } catch (error: any) {
      console.error('Error adding call:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateOutcome = async () => {
    if (!selectedCall || !outcomeForm.outcome) return;

    try {
      const updates: any = {
        outcome: outcomeForm.outcome,
        status: 'completed',
        call_duration: outcomeForm.call_duration,
        comments: outcomeForm.comments,
        updated_at: new Date().toISOString()
      };

      if (outcomeForm.follow_up_date) {
        updates.follow_up_date = outcomeForm.follow_up_date;
        updates.follow_up_notes = outcomeForm.follow_up_notes;
      }

      const { error } = await supabase
        .from('cold_calls')
        .update(updates)
        .eq('id', selectedCall.id);

      if (error) throw error;

      setShowOutcomeModal(false);
      setSelectedCall(null);
      setOutcomeForm({ outcome: '', comments: '', call_duration: 0, follow_up_date: '', follow_up_notes: '' });
      fetchCalls();
      toast({
        title: "Success",
        description: "Call outcome updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating outcome:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFollowUp = async () => {
    if (!selectedCall || !followUpForm.follow_up_date) return;

    try {
      const { error } = await supabase
        .from('cold_calls')
        .update({
          follow_up_date: followUpForm.follow_up_date,
          follow_up_notes: followUpForm.follow_up_notes,
          priority: followUpForm.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCall.id);

      if (error) throw error;

      setShowFollowUpModal(false);
      setSelectedCall(null);
      setFollowUpForm({ follow_up_date: '', follow_up_notes: '', priority: 'medium' });
      fetchCalls();
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully",
      });
    } catch (error: any) {
      console.error('Error scheduling follow-up:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConvertToLead = async (callId: string) => {
    try {
      const call = calls.find(c => c.id === callId);
      if (!call) return;

      // Create lead from cold call
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([{
          first_name: call.name?.split(' ')[0] || 'Unknown',
          last_name: call.name?.split(' ').slice(1).join(' ') || 'Lead',
          email: call.email,
          phone: call.phone,
          source: call.source || 'cold_call',
          status: 'new',
          assigned_to: call.agent_id,
          notes: `Converted from cold call. ${call.comments || ''}`,
          created_by: call.agent_id
        }])
        .select()
        .single();

      if (leadError) throw leadError;

      // Mark cold call as converted
      const { error: updateError } = await supabase
        .from('cold_calls')
        .update({
          is_converted: true,
          converted_by: user?.id,
          converted_at: new Date().toISOString()
        })
        .eq('id', callId);

      if (updateError) throw updateError;

      fetchCalls();
      toast({
        title: "Success",
        description: "Cold call converted to lead successfully",
      });
    } catch (error: any) {
      console.error('Error converting to lead:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !searchTerm || 
      call.phone.includes(searchTerm) ||
      call.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || call.agent_id === agentFilter;
    const matchesOutcome = outcomeFilter === 'all' || call.outcome === outcomeFilter;

    return matchesSearch && matchesStatus && matchesAgent && matchesOutcome;
  });

  const getOutcomeConfig = (outcome: string) => {
    return CALL_OUTCOMES.find(o => o.value === outcome) || CALL_OUTCOMES[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[2];
  };

  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const conversionRate = totalCalls > 0 ? (calls.filter(c => c.is_converted).length / totalCalls) * 100 : 0;
  const todayCalls = calls.filter(c => 
    new Date(c.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline font-bold text-gray-900 dark:text-white tracking-tight">Cold Calling Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">Track cold calls, outcomes, and team performance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Cold Call
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCalls}</p>
                </div>
              <Phone className="h-8 w-8 text-blue-500" />
                  </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCalls}</p>
                </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Calls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCalls}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calls">Cold Calls</TabsTrigger>
          <TabsTrigger value="agents">Team Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Cold Calls Tab */}
        <TabsContent value="calls" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search by phone, name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
          </div>
                <div>
                  <Label>Agent</Label>
                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {agents.map(agent => (
                        <SelectItem key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
        </div>
                <div>
                  <Label>Outcome</Label>
                  <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      {CALL_OUTCOMES.map(outcome => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          {outcome.label}
                        </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
              </div>
            </CardContent>
          </Card>

          {/* Calls List */}
          <Card>
            <CardHeader>
              <CardTitle>Cold Calls ({filteredCalls.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading calls...</p>
                </div>
              ) : filteredCalls.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cold calls found</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first cold call</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cold Call
                      </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCalls.map((call) => (
                    <div key={call.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={call.agent?.profile_image_url} />
                            <AvatarFallback>{call.agent?.full_name?.[0] || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {call.name || 'Unknown Contact'}
                              </h3>
                              <Badge className={getPriorityConfig(call.priority).color}>
                                {getPriorityConfig(call.priority).label}
                              </Badge>
                              {call.is_converted && (
                                <Badge className="bg-green-100 text-green-800">
                                  Converted
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {call.phone} • {call.agent?.full_name}
                            </p>
                            {call.email && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{call.email}</p>
                            )}
                          </div>
          </div>
                        <div className="flex items-center space-x-2">
                          {call.outcome ? (
                            <Badge className={getOutcomeConfig(call.outcome).color}>
                              {getOutcomeConfig(call.outcome).label}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Outcome</Badge>
                          )}
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCall(call);
                                setShowOutcomeModal(true);
                              }}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCall(call);
                                setShowFollowUpModal(true);
                              }}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            {!call.is_converted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConvertToLead(call.id)}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}
                    </div>
                        </div>
                      </div>
                      {call.comments && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{call.comments}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Attempts: {call.call_attempts}</span>
                        <span>Created: {format(new Date(call.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Calls</span>
                          <span className="font-medium">{agent.total_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          <span className="font-medium">{agent.completed_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                          <span className="font-medium">{agent.conversion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Today's Calls</span>
                          <span className="font-medium">{agent.today_calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</span>
                          <span className="font-medium">{Math.round(agent.avg_call_duration)}m</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{agent.completed_calls}/{agent.total_calls}</span>
                        </div>
                        <Progress value={agent.total_calls > 0 ? (agent.completed_calls / agent.total_calls) * 100 : 0} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Outcome Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CALL_OUTCOMES.map((outcome) => {
                    const count = calls.filter(c => c.outcome === outcome.value).length;
                    const percentage = totalCalls > 0 ? (count / totalCalls) * 100 : 0;
                    return (
                      <div key={outcome.value} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <outcome.icon className="h-4 w-4" />
                          <span className="text-sm">{outcome.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Calls</span>
                    <span className="font-medium">
                      {calls.filter(c => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(c.created_at) > weekAgo;
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Conversion</span>
                    <span className="font-medium">
                      {calls.filter(c => {
                        const monthAgo = new Date();
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return new Date(c.created_at) > monthAgo && c.is_converted;
                      }).length}
                    </span>
                    </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Call Duration</span>
                    <span className="font-medium">
                      {Math.round(calls.reduce((sum, c) => sum + (c.call_duration || 0), 0) / Math.max(calls.length, 1))}m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Call Modal */}
      <DialogRoot open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cold Call</DialogTitle>
            <DialogDescription>Add a new cold call to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={newCall.phone}
                onChange={(e) => setNewCall({ ...newCall, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                value={newCall.name}
                onChange={(e) => setNewCall({ ...newCall, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCall.email}
                onChange={(e) => setNewCall({ ...newCall, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={newCall.source}
                onChange={(e) => setNewCall({ ...newCall, source: e.target.value })}
                placeholder="Website, Referral, etc."
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newCall.priority} onValueChange={(value: any) => setNewCall({ ...newCall, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={newCall.comments}
                onChange={(e) => setNewCall({ ...newCall, comments: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCall}>
              Add Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Outcome Modal */}
      <DialogRoot open={showOutcomeModal} onOpenChange={setShowOutcomeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Call Outcome</DialogTitle>
            <DialogDescription>Record the outcome of the cold call</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Outcome *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CALL_OUTCOMES.map((outcome) => (
                  <Button
                    key={outcome.value}
                    variant={outcomeForm.outcome === outcome.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOutcomeForm({ ...outcomeForm, outcome: outcome.value })}
                    className="justify-start"
                  >
                    <outcome.icon className="h-4 w-4 mr-2" />
                    {outcome.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Call Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={outcomeForm.call_duration}
                onChange={(e) => setOutcomeForm({ ...outcomeForm, call_duration: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={outcomeForm.comments}
                onChange={(e) => setOutcomeForm({ ...outcomeForm, comments: e.target.value })}
                placeholder="Call notes and details..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={outcomeForm.follow_up_date}
                onChange={(e) => setOutcomeForm({ ...outcomeForm, follow_up_date: e.target.value })}
              />
            </div>
            {outcomeForm.follow_up_date && (
              <div>
                <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                <Textarea
                  id="follow_up_notes"
                  value={outcomeForm.follow_up_notes}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, follow_up_notes: e.target.value })}
                  placeholder="What to follow up on..."
                  rows={2}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOutcomeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOutcome} disabled={!outcomeForm.outcome}>
              Update Outcome
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Follow-up Modal */}
      <DialogRoot open={showFollowUpModal} onOpenChange={setShowFollowUpModal}>
        <DialogContent className="max-w-md">
              <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>Schedule a follow-up for this cold call</DialogDescription>
              </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="follow_up_date">Follow-up Date *</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={followUpForm.follow_up_date}
                onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
              <Textarea
                id="follow_up_notes"
                value={followUpForm.follow_up_notes}
                onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_notes: e.target.value })}
                placeholder="What to follow up on..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={followUpForm.priority} onValueChange={(value: any) => setFollowUpForm({ ...followUpForm, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                </div>
              <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleFollowUp} disabled={!followUpForm.follow_up_date}>
              Schedule Follow-up
                  </Button>
              </DialogFooter>
            </DialogContent>
      </DialogRoot>
    </div>
  );
} 