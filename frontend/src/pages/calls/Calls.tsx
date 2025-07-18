import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
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
  Loader2
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
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{start: string|null, end: string|null}>({start: null, end: null});
  const [filters, setFilters] = useState<{call_type?: string[], outcome?: string[]}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'created_at', direction: 'desc'});
  const [activeTab, setActiveTab] = useState(0);
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
    call_type: 'inbound',
    notes: ''
  });

  useEffect(() => {
    fetchCalls();
    fetchStats();
    fetchLeads();
  }, [page, sort, filters, dateRange, activeTab]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name');

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('outcome');

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(call => call.outcome === 'Completed').length,
        scheduled: data.filter(call => call.outcome === 'Scheduled').length,
        noAnswer: data.filter(call => call.outcome === 'No Answer').length
      };

      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('calls')
        .select(`
          *,
          lead:leads (
            first_name,
            last_name,
            email,
            phone
          ),
          user:users(full_name)
        `, { count: 'exact' });

      // Apply tab filter
      if (TABS[activeTab].type) {
        query = query.eq('outcome', TABS[activeTab].type);
      }

      // Apply filters
      if (filters.call_type?.length) {
        query = query.in('call_type', filters.call_type);
      }
      if (filters.outcome?.length) {
        query = query.in('outcome', filters.outcome);
      }
      if (dateRange.start) {
        query = query.gte('call_date', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('call_date', dateRange.end);
      }
      if (search) {
        query = query.or(`lead.first_name.ilike.%${search}%,lead.last_name.ilike.%${search}%,lead.email.ilike.%${search}%,lead.phone.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sort.key, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const pageSize = 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setCalls(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async () => {
    try {
      const { error } = await supabase
        .from('calls')
        .insert([
          {
            ...newCall,
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewCall({
        lead_id: '',
        call_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
        call_type: 'inbound',
        notes: ''
      });
      fetchCalls();
      fetchStats();
      toast({
        title: 'Success',
        description: 'Call logged successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calls</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Call
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-500">Successful calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-gray-500">Upcoming calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Answer</CardTitle>
            <XSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noAnswer}</div>
            <p className="text-xs text-gray-500">Missed calls</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search calls..."
            className="w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab, index) => (
                <SelectItem key={tab.label} value={index.toString()}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {call.lead?.first_name} {call.lead?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{call.lead?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {format(new Date(call.call_date), 'MMM d, yyyy h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={call.call_type === 'inbound' ? 'success' : 'default'}>
                        {call.call_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 max-w-xs truncate">{call.notes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{call.user?.full_name}</div>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCall(call.id)}
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
        </CardContent>
      </Card>

      {/* Add Call Modal */}
      <DialogRoot open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Call</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lead">Lead</Label>
              <Select
                value={newCall.lead_id}
                onValueChange={(value) => setNewCall({ ...newCall, lead_id: value })}
              >
                <SelectTrigger>
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
            <div className="grid gap-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newCall.call_date}
                onChange={(e) => setNewCall({ ...newCall, call_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Call Type</Label>
              <Select
                value={newCall.call_type}
                onValueChange={(value) => setNewCall({ ...newCall, call_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent>
                  {CALL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCall}>Save Call</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit Call Modal */}
      <DialogRoot open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Call</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="lead">Lead</Label>
                <Select
                  value={selectedCall.lead_id}
                  onValueChange={(value) => setSelectedCall({ ...selectedCall, lead_id: value })}
                >
                  <SelectTrigger>
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
              <div className="grid gap-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={selectedCall.call_date}
                  onChange={(e) => setSelectedCall({ ...selectedCall, call_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Call Type</Label>
                <Select
                  value={selectedCall.call_type}
                  onValueChange={(value) => setSelectedCall({ ...selectedCall, call_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={selectedCall.notes}
                  onChange={(e) => setSelectedCall({ ...selectedCall, notes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCall}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};

export default Calls; 