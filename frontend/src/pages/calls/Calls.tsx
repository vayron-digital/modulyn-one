import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { useLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  Tag,
  Star,
  StarOff,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PhoneCall,
  CheckSquare,
  XSquare,
  DollarSign as DollarSignIcon,
  Home,
  Save,
  Loader2,
  LayoutGrid,
  List,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogDescription } from '../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { DialogRoot } from '../../components/ui/dialog';
import { isValidUUID } from '../../lib/utils';

interface Call {
  id: string;
  user_id: string;
  lead_id: string;
  call_type: string;
  call_date: string;
  duration: number;
  outcome: string;
  notes: string;
  created_at: string;
  updated_at: string;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  user?: {
    full_name: string;
  };
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const CALL_TYPES = [
  'Cold Call',
  'Follow Up',
  'Consultation',
  'Property Viewing',
  'Negotiation',
  'Closing'
];

const OUTCOMES = [
  'Scheduled',
  'Completed',
  'No Answer',
  'Busy',
  'Wrong Number',
  'Not Interested',
  'Call Back Later'
];

const TABS = [
  { label: 'All Calls', type: null },
  { label: 'Scheduled', type: 'Scheduled' },
  { label: 'Completed', type: 'Completed' },
  { label: 'No Answer', type: 'No Answer' },
  { label: 'Not Interested', type: 'Not Interested' },
];

const DEFAULT_FILTER_PRESETS = [
  {
    name: 'Today\'s Calls',
    filters: {
      call_type: ['Consultation', 'Follow Up'],
      date: new Date().toISOString().split('T')[0]
    }
  },
  {
    name: 'High Priority',
    filters: {
      call_type: ['Property Viewing', 'Negotiation', 'Closing']
    }
  },
  {
    name: 'Follow Ups',
    filters: {
      call_type: ['Follow Up']
    }
  }
];

const Calls: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setHeader } = useLayout();
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    call_type: '',
    outcome: '',
    dateRange: '',
    agent: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'created_at', direction: 'desc'});
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'cards' | 'table'>('timeline');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    noAnswer: 0
  });
  const [savingFilter, setSavingFilter] = useState(false);
  const [filterName, setFilterName] = useState('');

  const [newCall, setNewCall] = useState({
    lead_id: '',
    call_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    call_type: 'Cold Call',
    duration: 0,
    outcome: '',
    notes: ''
  });

  useEffect(() => {
    setHeader({
      title: '',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Call Management' }
      ],
      tabs: [],
    });
  }, [setHeader]);

  useEffect(() => {
    fetchCalls();
    fetchStats();
    fetchLeads();
  }, [page, sort, filters, dateRange, activeTab]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats for user:', user?.id);
      
      const { data, error } = await supabase
        .from('calls')
        .select('outcome')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching stats:', error);
        // Set default stats if API fails
        setStats({
          total: 0,
          completed: 0,
          scheduled: 0,
          noAnswer: 0
        });
        return;
      }

      const calls = data || [];
      console.log('Stats data:', calls);
      
      setStats({
        total: calls.length,
        completed: calls.filter(call => call.outcome === 'Completed').length,
        scheduled: calls.filter(call => call.outcome === 'Scheduled').length,
        noAnswer: calls.filter(call => call.outcome === 'No Answer').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        total: 0,
        completed: 0,
        scheduled: 0,
        noAnswer: 0
      });
    }
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      console.log('Fetching calls for user:', user?.id);

      // First, let's get the calls without joins to see if the basic query works
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (callsError) {
        console.error('Error fetching calls:', callsError);
        throw callsError;
      }

      console.log('Basic calls data:', callsData);

      // Now let's get the leads data separately
      const leadIds = callsData?.map(call => call.lead_id).filter(Boolean) || [];
      let leadsData = [];
      
      if (leadIds.length > 0) {
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, first_name, last_name, email, phone')
          .in('id', leadIds);

        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        } else {
          leadsData = leads || [];
        }
      }

      // Combine the data
      const combinedData = callsData?.map(call => ({
        ...call,
        lead: leadsData.find(lead => lead.id === call.lead_id) || null,
        user: { full_name: user?.user_metadata?.full_name || 'Current User' }
      })) || [];

      console.log('Combined calls data:', combinedData);
      setCalls(combinedData);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async () => {
    try {
      // Validate required fields
      if (!newCall.lead_id || !newCall.call_type || !newCall.outcome) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('calls')
        .insert([
          {
            lead_id: newCall.lead_id,
            call_date: newCall.call_date,
            call_type: newCall.call_type,
            duration: newCall.duration || 0,
            outcome: newCall.outcome,
            notes: newCall.notes || '',
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewCall({
        lead_id: '',
        call_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
        call_type: 'Cold Call',
        duration: 0,
        outcome: '',
        notes: ''
      });
      fetchCalls();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Call logged successfully',
      });
    } catch (error: any) {
      console.error('Error adding call:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to log call',
        variant: 'destructive'
      });
    }
  };

  const handleEditCall = async () => {
    if (!selectedCall) return;

    try {
      const { error } = await supabase
        .from('calls')
        .update({
          lead_id: selectedCall.lead_id,
          call_date: selectedCall.call_date,
          call_type: selectedCall.call_type,
          notes: selectedCall.notes
        })
        .eq('id', selectedCall.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedCall(null);
      fetchCalls();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Call updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!confirm('Are you sure you want to delete this call?')) return;

    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCalls();
      await fetchStats();
      toast({
        title: 'Success',
        description: 'Call deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'start'|'end') => {
    setDateRange(prev => ({
      ...prev,
      [which]: e.target.value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const saveFilterPreset = async () => {
    if (!filterName) return;
    setSavingFilter(true);
    try {
      const { error } = await supabase
        .from('filter_presets')
        .insert([{
          user_id: user?.id,
          name: filterName,
          type: 'calls',
          filters: {
            ...filters,
            dateRange
          }
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Filter preset saved successfully',
      });
      setFilterName('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingFilter(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-6">
      {/* Hero Section with Floating Stats */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input
                  placeholder="Search calls, leads, outcomes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddModal(true)} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
          <Plus className="h-4 w-4 mr-2" />
          New Call
        </Button>
            </div>
      </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Total Calls</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-300 mt-1">All time calls</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Phone className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  <p className="text-xs text-slate-300 mt-1">+{((stats.completed / stats.total) * 100).toFixed(1)}% success rate</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CheckSquare className="h-6 w-6 text-emerald-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Scheduled</p>
                  <p className="text-3xl font-bold text-white">{stats.scheduled}</p>
                  <p className="text-xs text-slate-300 mt-1">Upcoming calls</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">No Answer</p>
                  <p className="text-3xl font-bold text-white">{stats.noAnswer}</p>
                  <p className="text-xs text-slate-300 mt-1">Missed calls</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <XSquare className="h-6 w-6 text-red-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-1vw mx-auto px-6 py-8 space-y-8">

      {/* 🚀 ENHANCED CALL HISTORY - PREMIUM INTERFACE */}
      <div className="space-y-6">
        {/* Enhanced Call History Interface */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Call History & Analytics</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive call tracking and performance insights</p>
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-slate-100/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className={viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-600'}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-600'}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600'}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Advanced Filters */}
            <div className="mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Call Type</Label>
                  <Select value={filters.call_type} onValueChange={(value) => setFilters({...filters, call_type: value})}>
                    <SelectTrigger className="bg-white/70">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {CALL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
      </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Outcome</Label>
                  <Select value={filters.outcome} onValueChange={(value) => setFilters({...filters, outcome: value})}>
                    <SelectTrigger className="bg-white/70">
                      <SelectValue placeholder="All outcomes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All outcomes</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="Follow Up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
        </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Date Range</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                    <SelectTrigger className="bg-white/70">
                      <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="quarter">This quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Agent</Label>
                  <Select value={filters.agent} onValueChange={(value) => setFilters({...filters, agent: value})}>
                    <SelectTrigger className="bg-white/70">
                      <SelectValue placeholder="All agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All agents</SelectItem>
                      {Array.from(new Set(calls.map(c => c.user?.full_name).filter(Boolean))).map(agent => (
                        <SelectItem key={agent} value={agent || ''}>{agent}</SelectItem>
              ))}
            </SelectContent>
          </Select>
                </div>
              </div>
            </div>

            {/* Dynamic View Content */}
            {viewMode === 'timeline' && (
              <div className="space-y-4">
                {calls.map((call, index) => (
                  <div key={call.id} className="relative">
                    {index > 0 && (
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent"></div>
                    )}
                    <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-xl border border-slate-200/30 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                                {call.lead?.first_name?.[0]}{call.lead?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                {call.lead?.first_name} {call.lead?.last_name}
                              </h4>
                              <p className="text-xs text-slate-500">{call.lead?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              {call.call_type}
                            </Badge>
                            <Badge 
                              variant={call.outcome === 'Completed' ? 'default' : 'secondary'}
                              className={call.outcome === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}
                            >
                              {call.outcome}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {format(new Date(call.call_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {format(new Date(call.call_date), 'h:mm a')} ({call.duration}m)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{call.user?.full_name || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {call.notes && (
                          <div className="bg-slate-50/50 rounded-lg p-3">
                            <p className="text-sm text-slate-700">{call.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-slate-200/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCall(call);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCall(call.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
          </Button>
        </div>
      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calls.map((call) => (
                  <Card key={call.id} className="bg-white/60 border-slate-200/30 hover:bg-white/80 transition-all duration-200 hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {call.lead?.first_name?.[0]}{call.lead?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {call.lead?.first_name} {call.lead?.last_name}
                            </h4>
                            <p className="text-xs text-slate-500">{call.lead?.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                            {call.call_type}
                          </Badge>
                          <Badge 
                            variant={call.outcome === 'Completed' ? 'default' : 'secondary'}
                            className={`text-xs ${call.outcome === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                          >
                            {call.outcome}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Date:</span>
                          <span className="font-medium text-slate-900">
                            {format(new Date(call.call_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Time:</span>
                          <span className="font-medium text-slate-900">
                            {format(new Date(call.call_date), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Duration:</span>
                          <span className="font-medium text-slate-900">{call.duration}m</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Agent:</span>
                          <span className="font-medium text-slate-900">{call.user?.full_name || 'Unknown'}</span>
                        </div>
                        
                        {call.notes && (
                          <div className="pt-2 border-t border-slate-200/30">
                            <p className="text-xs text-slate-600 line-clamp-2">{call.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCall(call);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCall(call.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700">Lead</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date & Time</TableHead>
                      <TableHead className="font-semibold text-slate-700">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700">Outcome</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Agent</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                      <TableRow key={call.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                {call.lead?.first_name?.[0]}{call.lead?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                        <div>
                              <div className="text-sm font-semibold text-slate-900">
                            {call.lead?.first_name} {call.lead?.last_name}
                          </div>
                              <div className="text-xs text-slate-500">{call.lead?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                          <div className="text-sm text-slate-900">
                            {format(new Date(call.call_date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(call.call_date), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        {call.call_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                          <Badge 
                            variant={call.outcome === 'Completed' ? 'default' : 'secondary'}
                            className={call.outcome === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}
                          >
                            {call.outcome}
                          </Badge>
                    </TableCell>
                    <TableCell>
                          <div className="text-sm text-slate-900 max-w-xs truncate">{call.notes || 'No notes'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">{call.user?.full_name || 'Unknown'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCall(call);
                            setShowEditModal(true);
                          }}
                              className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCall(call.id)}
                              className="hover:bg-red-50 hover:text-red-600"
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
        </CardContent>
      </Card>
      </div>
      </div>

      {/* Enhanced Add Call Modal */}
      <DialogRoot open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-lg max-h-[90vh] z-[500] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Log New Call</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Quick call logging for better productivity
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
            {/* Quick Actions Bar */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Quick Actions</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewCall({ ...newCall, call_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm') })}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewCall({ ...newCall, call_type: 'Follow Up' })}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Follow Up
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Lead Selection */}
              <div className="space-y-2">
                <Label htmlFor="lead" className="text-sm font-semibold text-slate-700 flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  Lead *
                </Label>
              <Select
                value={newCall.lead_id}
                onValueChange={(value) => setNewCall({ ...newCall, lead_id: value })}
              >
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                  <SelectContent className="z-[600]">
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                            {lead.first_name?.[0]}{lead.last_name?.[0]}
                          </div>
                          <span>{lead.first_name} {lead.last_name}</span>
                        </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              {/* Call Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold text-slate-700 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-slate-500" />
                  Call Type *
                </Label>
              <Select
                value={newCall.call_type}
                onValueChange={(value) => setNewCall({ ...newCall, call_type: value })}
              >
                  <SelectTrigger className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                  <SelectContent className="z-[600]">
                  {CALL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            type === 'Cold Call' ? 'bg-red-400' :
                            type === 'Follow Up' ? 'bg-blue-400' :
                            type === 'Consultation' ? 'bg-green-400' :
                            type === 'Property Viewing' ? 'bg-purple-400' :
                            'bg-slate-400'
                          }`} />
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-slate-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                  Date & Time *
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newCall.call_date}
                  onChange={(e) => setNewCall({ ...newCall, call_date: e.target.value })}
                  className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold text-slate-700 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-slate-500" />
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="480"
                  placeholder="5"
                  value={newCall.duration || ''}
                  onChange={(e) => setNewCall({ ...newCall, duration: parseInt(e.target.value) || 0 })}
                  className="bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center">
                <CheckSquare className="h-4 w-4 mr-2 text-slate-500" />
                Call Outcome *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Completed', 'No Answer', 'Busy', 'Follow Up'].map((outcome) => (
                  <Button
                    key={outcome}
                    variant={newCall.outcome === outcome ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewCall({ ...newCall, outcome })}
                    className={`justify-start ${
                      newCall.outcome === outcome 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      outcome === 'Completed' ? 'bg-green-400' :
                      outcome === 'No Answer' ? 'bg-red-400' :
                      outcome === 'Busy' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`} />
                    {outcome}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4 space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-slate-500" />
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                className="min-h-[60px] max-h-[120px] bg-white/70 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Add call notes, key points discussed, or follow-up actions..."
              />
            </div>

            {/* Quick Notes Templates */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {['Interested in property', 'Needs follow-up', 'Not interested', 'Requested brochure', 'Scheduled viewing'].map((template) => (
                  <Button
                    key={template}
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewCall({ ...newCall, notes: newCall.notes ? `${newCall.notes}\n• ${template}` : `• ${template}` })}
                    className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {template}
                  </Button>
                ))}
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
                  className="border-slate-200 hover:border-slate-300"
                >
              Cancel
            </Button>
                <Button 
                  onClick={handleAddCall}
                  disabled={!newCall.lead_id || !newCall.call_type || !newCall.outcome}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Call
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Enhanced Edit Call Modal */}
      <DialogRoot open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 max-w-md">
          <DialogHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Edit className="h-5 w-5 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">Edit Call</DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 mt-2">
              Update call details and notes
            </DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="lead" className="text-sm font-semibold text-slate-700">Lead</Label>
                <Select
                  value={selectedCall.lead_id}
                  onValueChange={(value) => setSelectedCall({ ...selectedCall, lead_id: value })}
                >
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-slate-700">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={selectedCall.call_date}
                  onChange={(e) => setSelectedCall({ ...selectedCall, call_date: e.target.value })}
                  className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold text-slate-700">Call Type</Label>
                <Select
                  value={selectedCall.call_type}
                  onValueChange={(value) => setSelectedCall({ ...selectedCall, call_type: value })}
                >
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Notes</Label>
                <Textarea
                  id="notes"
                  value={selectedCall.notes}
                  onChange={(e) => setSelectedCall({ ...selectedCall, notes: e.target.value })}
                  className="min-h-[100px] bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Update call notes, outcomes, or follow-up actions..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="bg-slate-50/50 border-t border-slate-200/50 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              className="border-slate-200 hover:border-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCall}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg hover:shadow-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};

export default Calls; 