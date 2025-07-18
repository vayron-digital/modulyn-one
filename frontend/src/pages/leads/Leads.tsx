import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debounce from 'lodash.debounce';
import LeadDetailsSidebar from '../../components/LeadDetailsSidebar';
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
  DollarSign,
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
  LayoutGrid,
  List,
  Pencil,
  Trash,
  ArrowRight,
  Shuffle,
  MessageCircle,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { PropertyStatus, PROPERTY_STATUSES } from '../../utils/propertyStatuses';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/ui/DataTable';
import { FilterBar } from '../../components/ui/FilterBar';
import { cn, isValidUUID, safeLower } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { dashboardApi } from '../../lib/api';

interface PropertyRequirements {
  type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  min_bathrooms: number | null;
  preferred_locations: string[];
  amenities: string[];
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
  country: string;
  budget: number;
  preferred_contact_method: string;
  assigned_to: string;
  last_contact_date: string;
  follow_up_date: string;
  created_by: string;
  assigned_user: {
    full_name: string;
  } | null;
  nationality: string;
  preferred_location: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  preferred_bathrooms: number;
  preferred_area: string;
  preferred_amenities?: string;
  next_followup_date?: string;
  dumped_at?: string;
  dumped_by?: string;
}

const TABS = [
  { label: 'All Clients', status: null },
  { label: 'Leads', status: 'new' },
  { label: 'Ongoing', status: 'active' },
  { label: 'Payment Back', status: 'payment_back' },
  { label: 'Closed', status: 'closed' },
];

const PAGE_SIZE = 10;

const leadsData = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Theresa Webb',
    phone: '01796-329869',
    caseRef: 'CC/80564',
    opened: '22/10/2022',
    doa: '22/10/2022',
    source: 'Google',
    provider: 'CC/DGM',
    services: ['Salvage', 'S&R', 'Hire', 'VD'],
    amount: '$230.00',
  },
  // ...repeat for demo
];
while (leadsData.length < 8) leadsData.push({ ...leadsData[0], name: 'Wade Warren', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' });

interface FilterPreset {
  name: string;
  filters: {
    status?: string[];
    min_budget?: number;
    next_followup_date?: string;
  };
}

const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Hot Leads',
    filters: {
      status: ['new', 'active'],
      min_budget: 1000000
    }
  },
  {
    name: 'Follow Up Today',
    filters: {
      next_followup_date: new Date().toISOString().split('T')[0]
    }
  },
  {
    name: 'High Value',
    filters: {
      min_budget: 2000000
    }
  }
];

const LEAD_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const LEAD_SOURCES = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Social Media', value: 'social' },
  { label: 'Direct', value: 'direct' },
  { label: 'Other', value: 'other' },
];

const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: LEAD_STATUSES,
  },
  {
    key: 'source',
    label: 'Source',
    type: 'select' as const,
    options: LEAD_SOURCES,
  },
  {
    key: 'search',
    label: 'Search',
    type: 'text' as const,
    placeholder: 'Search by name, email, or phone',
  },
  {
    key: 'date_from',
    label: 'Date From',
    type: 'date' as const,
  },
  {
    key: 'date_to',
    label: 'Date To',
    type: 'date' as const,
  },
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-white text-black border border-black';
    case 'active':
      return 'bg-white text-black border border-black';
    case 'closed':
      return 'bg-white text-black border border-black';
    default:
      return 'bg-white text-black border border-black';
  }
};

const Leads = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{start: string|null, end: string|null}>({start: null, end: null});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'created_at', direction: 'desc'});
  const location = useLocation();
  const [editing, setEditing] = useState<{id: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [bulkAction, setBulkAction] = useState<'status'|'assign'|'dump'|null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const [presetName, setPresetName] = useState('');
  const [drawerLead, setDrawerLead] = useState<Lead|null>(null);
  const [drawerActivity, setDrawerActivity] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [live, setLive] = useState(false);
  const leadsChannelRef = useRef<any>(null);
  const activityChannelRef = useRef<any>(null);
  const { toast } = useToast();
  const [drawerTab, setDrawerTab] = useState('Activity');
  const [noteContent, setNoteContent] = useState<string>('');
  const editor = useEditor({
    extensions: [StarterKit],
    content: noteContent,
    onUpdate: ({ editor }) => setNoteContent(editor.getHTML()),
  });
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalLeads, setTotalLeads] = useState(0);
  const [deals, setDeals] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [dealForm, setDealForm] = useState({ title: '', amount: '', status: '' });
  const [ticketForm, setTicketForm] = useState({ subject: '', status: '' });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [stats, setStats] = useState({
    new: { count: 0, change: 0, loading: true },
    closed: { count: 0, change: 0, loading: true },
    lost: { count: 0, loading: true },
    totalClosed: { sum: 0, change: 0, loading: true },
  });

  // Add state for quick view
  const [quickViewLead, setQuickViewLead] = useState<Lead | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Debounced search
  const debouncedSetSearch = useRef(debounce((val) => setSearch(val), 300)).current;
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  // Initialize filter presets state with defaults
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(DEFAULT_FILTER_PRESETS);

  // Add filters state
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Add a dummy state to force refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    const saved = localStorage.getItem('leadsViewMode');
    return (saved as 'card' | 'list') || 'card';
  });

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem('leadsViewMode', viewMode);
  }, [viewMode]);

  const [kpis, setKpis] = useState<any>(null);

  // Move fetchLeads to top-level of Leads component
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) return;
      let query = supabase
        .from('leads')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          company,
          status,
          source,
          notes,
          created_at,
          updated_at,
          country,
          budget,
          preferred_contact_method,
          assigned_to,
          last_contact_date,
          follow_up_date,
          created_by,
          nationality,
          preferred_location,
          preferred_property_type,
          preferred_bedrooms,
          preferred_bathrooms,
          preferred_area,
          preferred_amenities,
          next_followup_date,
          dumped_at,
          dumped_by,
          assigned_user:profiles!leads_assigned_to_fkey (
            full_name
          )
        `, { count: 'exact' })
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .is('dumped_at', null);

      // Tab status
      const tabStatus = TABS[activeTab].status;
      if (tabStatus) query = query.eq('status', tabStatus);

      // Search
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Date range
      if (dateRange.start && dateRange.end) {
        query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      // Advanced filters
      if (activeFilters.status && activeFilters.status !== 'ALL' && activeFilters.status.length > 0) query = query.in('status', activeFilters.status);
      if (activeFilters.source && activeFilters.source !== 'ALL') query = query.eq('source', activeFilters.source);
      if (activeFilters.search) query = query.or(
        `first_name.ilike.%${activeFilters.search}%,last_name.ilike.%${activeFilters.search}%,email.ilike.%${activeFilters.search}%,phone.ilike.%${activeFilters.search}%`
      );
      if (activeFilters.date_from) query = query.gte('created_at', activeFilters.date_from);
      if (activeFilters.date_to) query = query.lte('created_at', activeFilters.date_to);

      // Sorting
      query = query.order(sort.key, { ascending: sort.direction === 'asc' });

      // Pagination
      query = query.range((page-1)*pageSize, page*pageSize-1);

      const { data, error, count } = await query;
      if (error) throw error;

      setLeads((data || []).map(lead => ({
        ...lead,
        assigned_user: lead.assigned_user?.[0] || null,
        nationality: lead.nationality || '',
        preferred_location: lead.preferred_location || '',
        preferred_property_type: lead.preferred_property_type || '',
        preferred_bedrooms: lead.preferred_bedrooms ?? undefined,
        preferred_bathrooms: lead.preferred_bathrooms ?? undefined,
        preferred_area: lead.preferred_area || '',
        preferred_amenities: lead.preferred_amenities || '',
        next_followup_date: lead.next_followup_date || '',
        dumped_at: lead.dumped_at || '',
        dumped_by: lead.dumped_by || '',
      })));
      setTotalPages(Math.ceil((count || 1) / pageSize));
      setTotalLeads(count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user, location.pathname, activeTab, search, dateRange, activeFilters, page, sort, refreshKey]);

  // --- Real-Time Updates for Leads Table ---
  useEffect(() => {
    if (!user) return;
    if (leadsChannelRef.current) leadsChannelRef.current.unsubscribe();

    const channel = supabase.channel('leads-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `created_by=eq.${user.id} OR assigned_to=eq.${user.id}`
        }, 
        payload => {
          setLive(true);
          setRefreshKey(k => k + 1);
          setTimeout(() => setLive(false), 1200);
        }
      )
      .subscribe();

    leadsChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [user, activeTab, search, dateRange, activeFilters, page, sort]);

  // --- Real-Time Updates for Activity Drawer ---
  useEffect(() => {
    if (!drawerOpen || !drawerLead) return;
    if (activityChannelRef.current) activityChannelRef.current.unsubscribe();

    const channel = supabase.channel('activity-realtime');
    const tables = ['calls', 'lead_notes', 'lead_status_changes'];
    
    tables.forEach(table => {
      channel.on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter: `lead_id=eq.${drawerLead.id}`
        }, 
        payload => {
          openDrawer(drawerLead);
        }
      );
    });

    channel.subscribe();
    activityChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [drawerOpen, drawerLead]);

  // Fetch deals, tickets, attachments when drawerLead changes
  useEffect(() => {
    if (!drawerLead) return;
    setSidebarLoading(true);
    Promise.all([
      supabase.from('deals').select('*').eq('lead_id', drawerLead.id),
      supabase.from('tickets').select('*').eq('lead_id', drawerLead.id),
      supabase.from('attachments').select('*').eq('lead_id', drawerLead.id),
    ]).then(([dealsRes, ticketsRes, attachmentsRes]) => {
      setDeals(dealsRes.data || []);
      setTickets(ticketsRes.data || []);
      setAttachments(attachmentsRes.data || []);
    }).finally(() => setSidebarLoading(false));
  }, [drawerLead]);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role, full_name')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.is_admin || profile?.role === 'Administrator' || false);
        setCurrentUserName(profile?.full_name || '');
      }
    };
    fetchAdminStatus();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      setStats(s => ({
        new: { ...s.new, loading: true },
        closed: { ...s.closed, loading: true },
        lost: { ...s.lost, loading: true },
        totalClosed: { ...s.totalClosed, loading: true },
      }));

      const now = new Date();
      const end = new Date(now);
      const start = new Date(now); start.setDate(now.getDate() - 7);
      const prevStart = new Date(now); prevStart.setDate(now.getDate() - 14);
      const prevEnd = new Date(now); prevEnd.setDate(now.getDate() - 7);

      const f = (d: Date) => d.toISOString().slice(0, 10);
      const userFilter = user ? `created_by.eq.${user.id},assigned_to.eq.${user.id}` : '';

      // 1. New leads last 7 days
      const { count: newCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .or(userFilter)
        .gte('created_at', f(start))
        .lte('created_at', f(end))
        .eq('status', 'New');

      const { count: prevNewCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .or(userFilter)
        .gte('created_at', f(prevStart))
        .lt('created_at', f(prevEnd))
        .eq('status', 'New');

      // 2. Closed leads last 7 days
      const { count: closedCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .or(userFilter)
        .gte('created_at', f(start))
        .lte('created_at', f(end))
        .eq('status', 'Closed');

      const { count: prevClosedCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .or(userFilter)
        .gte('created_at', f(prevStart))
        .lt('created_at', f(prevEnd))
        .eq('status', 'Closed');

      // 3. Lost leads last 7 days
      const { count: lostCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .or(userFilter)
        .gte('created_at', f(start))
        .lte('created_at', f(end))
        .eq('status', 'Lost');

      // 4. Total closed value last 7 days
      const { data: closedLeads } = await supabase
        .from('leads')
        .select('budget')
        .or(userFilter)
        .gte('created_at', f(start))
        .lte('created_at', f(end))
        .eq('status', 'Closed');

      const { data: prevClosedLeads } = await supabase
        .from('leads')
        .select('budget')
        .or(userFilter)
        .gte('created_at', f(prevStart))
        .lt('created_at', f(prevEnd))
        .eq('status', 'Closed');

      const sum = (arr: any[] = []) => arr.reduce((a, b) => a + (b.budget || 0), 0);
      const totalClosed = sum(closedLeads ?? []);
      const prevTotalClosed = sum(prevClosedLeads ?? []);

      setStats({
        new: { 
          count: newCount ?? 0, 
          change: prevNewCount ? (((newCount ?? 0) - prevNewCount) / prevNewCount) * 100 : 0, 
          loading: false 
        },
        closed: { 
          count: closedCount ?? 0, 
          change: prevClosedCount ? (((closedCount ?? 0) - prevClosedCount) / prevClosedCount) * 100 : 0, 
          loading: false 
        },
        lost: { 
          count: lostCount || 0, 
          loading: false 
        },
        totalClosed: { 
          sum: totalClosed, 
          change: prevTotalClosed ? ((totalClosed - prevTotalClosed) / prevTotalClosed) * 100 : 0, 
          loading: false 
        },
      });
    }
    fetchStats();
  }, [leads.length, user]);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await dashboardApi.getKPIs();
        if (response.data && response.data.success) {
          setKpis(response.data.data);
        }
      } catch (err) {
        // ignore for now
      }
    }
    fetchKPIs();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      if (!error) setProfiles(data || []);
    };
    fetchProfiles();
  }, []);

  // --- Export CSV logic ---
  const handleExport = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Source', 'Assigned To', 'Created At', 'Notes'];
    const rows = leads.map(lead => [
      lead.first_name,
      lead.last_name,
      lead.email,
      lead.phone,
      lead.status,
      lead.source,
      lead.assigned_user?.full_name || '',
      lead.created_at,
      lead.notes,
    ]);
    const csv = [headers, ...rows].map(row => row.map(String).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Checkbox logic ---
  const handleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };
  const handleSelectAll = () => {
    if (leads.every(lead => selected.includes(lead.id))) {
      setSelected(sel => sel.filter(id => !leads.some(lead => lead.id === id)));
    } else {
      setSelected(sel => [...sel, ...leads.filter(lead => !sel.includes(lead.id)).map(lead => lead.id)]);
    }
  };

  // --- Date picker logic (simple) ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'start'|'end') => {
    setDateRange(r => ({ ...r, [which]: e.target.value }));
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDumpLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          dumped_at: new Date().toISOString(),
          dumped_by: user?.id
        })
        .eq('id', leadId);

      if (error) throw error;
      toast({ title: 'Lead dumped successfully', variant: 'default' });
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || 'Failed to dump lead', variant: 'destructive' });
    }
  };

  // --- Inline Editing ---
  const startEdit = (id: string, field: string, value: string) => {
    setEditing({id, field});
    setEditValue(value);
  };
  const saveEdit = async (id: string, field: string) => {
    try {
      setSavingEdit(true);
      const { error } = await supabase
        .from('leads')
        .update({ [field]: editValue, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Lead updated successfully', variant: 'default' });
      setEditing(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || 'Failed to update lead', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  // --- Bulk Actions ---
  const handleBulkUpdate = async () => {
    try {
      if (!bulkValue) {
        toast({ title: 'Please select a value', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('leads')
        .update({ 
          [bulkAction === 'status' ? 'status' : 'assigned_to']: bulkValue,
          updated_at: new Date().toISOString()
        })
        .in('id', selected);

      if (error) throw error;
      toast({ title: 'Leads updated successfully', variant: 'default' });
      setBulkAction(null);
      setBulkValue('');
      setSelected([]);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || 'Failed to update leads', variant: 'destructive' });
    }
  };
  const handleBulkDump = async () => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          dumped_at: new Date().toISOString(),
          dumped_by: user?.id
        })
        .in('id', selected);

      if (error) throw error;
      toast({ title: 'Leads dumped successfully', variant: 'default' });
      setSelected([]);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      toast({ title: err.message || 'Failed to dump leads', variant: 'destructive' });
    }
  };

  // --- Advanced Filters & Presets ---
  const savePreset = () => {
    if (presetName && Object.keys(activeFilters).length > 0) {
      setFilterPresets([...filterPresets, { name: presetName, filters: activeFilters }]);
      setPresetName('');
    }
  };
  const loadPreset = (preset: any) => {
    setActiveFilters(preset.filters);
    setShowFilters(false);
  };
  const deletePreset = (name: string) => {
    // Don't allow deleting default presets
    if (DEFAULT_FILTER_PRESETS.some(p => p.name === name)) return;
    setFilterPresets(filterPresets.filter(p => p.name !== name));
  };

  // --- Activity Timeline Drawer ---
  const openDrawer = async (lead: Lead) => {
    setDrawerLead(lead);
    setDrawerOpen(true);
    setDrawerLoading(true);
    // Fetch activity (calls, notes, status changes)
    const { data: calls } = await supabase.from('calls').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false });
    const { data: notes } = await supabase.from('lead_notes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false });
    const { data: status } = await supabase.from('lead_status_changes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false });
    setDrawerActivity([
      ...(calls||[]).map(a=>({...a,type:'call'})),
      ...(notes||[]).map(a=>({...a,type:'note'})),
      ...(status||[]).map(a=>({...a,type:'status'})),
    ].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()));
    setDrawerLoading(false);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerLead(null);
    setDrawerActivity([]);
  };

  // Add fetchDeals, fetchTickets, fetchAttachments functions
  async function fetchDeals() {
    if (!drawerLead) return;
    const { data } = await supabase.from('deals').select('*').eq('lead_id', drawerLead.id);
    setDeals(data || []);
  }
  async function fetchTickets() {
    if (!drawerLead) return;
    const { data } = await supabase.from('tickets').select('*').eq('lead_id', drawerLead.id);
    setTickets(data || []);
  }
  async function fetchAttachments() {
    if (!drawerLead) return;
    const { data } = await supabase.from('attachments').select('*').eq('lead_id', drawerLead.id);
    setAttachments(data || []);
  }

  // Update the lead click handler
  const handleLeadClick = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  };

  // Update quick view handler
  const handleQuickView = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setQuickViewLead(lead);
    setShowQuickView(true);
  };

  // Add quick view modal component
  const QuickViewModal = () => {
    if (!showQuickView || !quickViewLead) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowQuickView(false)} />
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-black">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-white border border-black flex items-center justify-center">
                    <span className="text-black font-medium">
                      {quickViewLead.first_name?.[0]}{quickViewLead.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      {quickViewLead.first_name} {quickViewLead.last_name}
                    </h2>
                    <p className="text-sm text-gray-600">{quickViewLead.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="text-gray-600 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-black">Contact Information</h3>
                    <p className="text-sm text-gray-600">{quickViewLead.phone}</p>
                    <p className="text-sm text-gray-600">{quickViewLead.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black">Status</h3>
                    <Badge className={getStatusBadgeColor(quickViewLead.status)}>
                      {quickViewLead.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black">Budget</h3>
                    <p className="text-sm text-gray-600">{formatCurrency(quickViewLead.budget)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'n':
            e.preventDefault();
            navigate('/leads/new');
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 's':
            e.preventDefault();
            setShowFilters(!showFilters);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilters]);

  // Add quick actions
  const quickActions = [
    {
      label: 'Call',
      icon: PhoneCall,
      action: (lead: Lead) => {
        window.location.href = `tel:${lead.phone}`;
      }
    },
    {
      label: 'Email',
      icon: Mail,
      action: (lead: Lead) => {
        window.location.href = `mailto:${lead.email}`;
      }
    },
    {
      label: 'Schedule',
      icon: Calendar,
      action: (lead: Lead) => {
        navigate(`/scheduler?lead=${lead.id}`);
      }
    },
    {
      label: 'Add Task',
      icon: CheckSquare,
      action: (lead: Lead) => {
        navigate(`/tasks/new?lead=${lead.id}`);
      }
    }
  ];

  // Add loading skeleton component
  const LeadSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </CardContent>
    </Card>
  );

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      // Get the lead data
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (fetchError) throw fetchError;

      if (user?.is_admin) {
        // Admin can delete permanently
        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadId);

        if (deleteError) throw deleteError;
      } else {
        // Non-admin moves to dumped leads
        const { error: insertError } = await supabase
          .from('dumped_leads')
          .insert([{
            ...lead,
            dumped_by: user?.id,
            dumped_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        // Delete from active leads
        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadId);

        if (deleteError) throw deleteError;
      }

      toast({
        title: 'Success',
        description: user?.is_admin ? 'Lead deleted permanently' : 'Lead moved to dumped leads',
        variant: 'default'
      });

      fetchLeads();
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Sanitize leads: attach a guaranteed unique _rowKey to each lead
  const sanitizedLeads = leads.map((lead) => ({
    ...lead,
    _rowKey: (lead.id && lead.id !== 'undefined') ? String(lead.id) : uuidv4(),
  }));

  // Move columns array here so it can access isAdmin, profiles, toast, etc.
  const columns = [
    {
      key: 'name',
      header: 'Name',
      accessorKey: 'full_name',
      render: (item: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {item.first_name?.[0]}{item.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{item.first_name} {item.last_name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      render: (item: any) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{item.phone}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      render: (item: any) => (
        <Badge variant="default">
          {LEAD_STATUSES.find(s => s.value === item.status)?.label || item.status}
        </Badge>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      accessorKey: 'source',
      render: (item: any) => (
        <span className="capitalize">{item.source}</span>
      ),
    },
    ...(isAdmin ? [
      {
        key: 'agent',
        header: 'Agent',
        accessorKey: 'assigned_user',
        render: (item: any) => (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={item.assigned_to || ''}
            onClick={e => e.stopPropagation()}
            onChange={async (e) => {
              const newAgentId = e.target.value;
              try {
                const { error } = await supabase
                  .from('leads')
                  .update({ assigned_to: newAgentId })
                  .eq('id', item.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Agent assigned', variant: 'default' });
                setRefreshKey((k) => k + 1);
              } catch (err: any) {
                toast({ title: 'Error', description: err.message, variant: 'destructive' });
              }
            }}
          >
            <option value="">Unassigned</option>
            {profiles.filter(p => p.id).map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.full_name}</option>
            ))}
          </select>
        ),
      },
    ] : []),
    {
      key: 'created',
      header: 'Created',
      accessorKey: 'created_at',
      render: (item: any) => formatDate(item.created_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <a href={`tel:${item.phone}`} title="Call">
              <Phone className="h-4 w-4 text-green-600" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <a href={`mailto:${item.email}`} title="Email">
              <Mail className="h-4 w-4 text-blue-600" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/leads/edit/${item.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const isAdminOrMaster = user && user.role && ["admin","administrator","master"].some(r => user.role?.toLowerCase().includes(r));

  // Add advanced filters for Admin/Master
  const adminFilters = [
    { key: 'agent', label: 'Agents', type: 'select', options: profiles.filter(p => p.id).map(p => ({ label: p.full_name, value: p.id })) },
    { key: 'sub_source_name', label: 'Sub Source Name', type: 'text', placeholder: 'Sub Source Name' },
    { key: 'sub_status_name', label: 'Sub Status Name', type: 'text', placeholder: 'Sub Status Name' },
    { key: 'campaign_manager_name', label: 'Campaign Manager Name', type: 'text', placeholder: 'Campaign Manager Name' },
    { key: 'campaign_name', label: 'Campaign Name', type: 'text', placeholder: 'Campaign Name' },
    { key: 'source_name', label: 'Source Name', type: 'text', placeholder: 'Source Name' },
    { key: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Keyword' },
  ];

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6 bg-white min-h-screen p-6 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Leads</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isAdminOrMaster && (
            <Button
              onClick={() => {/* TODO: Implement import lead modal */}}
              variant="outline"
              className="border-black text-black hover:bg-gray-100 w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Lead
            </Button>
          )}
          <Button
            onClick={() => navigate('/leads/dumped')}
            variant="outline"
            className="border-black text-black hover:bg-gray-100 w-full sm:w-auto"
          >
            <Trash className="h-4 w-4 mr-2" />
            Dumped Leads
          </Button>
          <Button
            onClick={() => navigate('/leads/new')}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...(isAdminOrMaster ? adminFilters : []), ...filters].map(f => (
            <div key={f.key}>
              {f.type === 'select' ? (
                <Select
                  value={activeFilters[f.key] || ''}
                  onValueChange={v => setActiveFilters(a => ({ ...a, [f.key]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    {Array.isArray(f.options) &&
                      f.options
                        .filter(opt => {
                          const isValid =
                            opt &&
                            typeof opt === "object" &&
                            "value" in opt &&
                            typeof opt.value === "string" &&
                            opt.value.trim() !== "" &&
                            opt.value !== "undefined" &&
                            opt.value !== "null" &&
                            opt.value !== undefined &&
                            opt.value !== null;
                          if (!isValid) {
                            console.warn("Skipped invalid Select option:", opt);
                          }
                          return isValid;
                        })
                        .map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type}
                  placeholder={f.placeholder || f.label}
                  value={activeFilters[f.key] || ''}
                  onChange={e => setActiveFilters(a => ({ ...a, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setRefreshKey(k => k + 1)} className="bg-black text-white">Search</Button>
          {isAdminOrMaster && <Button onClick={handleExport} className="bg-black text-white">Export</Button>}
        </div>
      </div>

      {/* Bulk Actions */}
      {isAdminOrMaster && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={() => setBulkAction('assign')} variant="outline">Assign Agent</Button>
          {/* Add more bulk actions here as you implement them, using only allowed values: 'status', 'assign', 'dump', or null */}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white border border-black flex flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.status}
              value={tab.status || 'all'}
              className="text-xs sm:text-sm text-black data-[state=active]:bg-black data-[state=active]:text-white px-2 sm:px-4 py-1 sm:py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Closed Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.leadsConvertedThisMonth === 'number' ? kpis.leadsConvertedThisMonth : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Lost Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.lostLeads === 'number' ? kpis.lostLeads : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <XSquare className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Closed Value</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.revenueThisMonth === 'number' ? kpis.revenueThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leads List */}
      <div className="bg-white border border-black rounded-lg overflow-x-auto">
        <div className="p-2 sm:p-4 border-b border-black">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-black">Leads</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                className="bg-white text-black border-black hover:bg-gray-100 w-full sm:w-auto"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2 text-black" />
                Export
              </Button>
              <Button
                variant="outline"
                className="bg-white text-black border-black hover:bg-gray-100 w-full sm:w-auto"
                onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              >
                {viewMode === 'card' ? (
                  <List className="h-4 w-4 text-black" />
                ) : (
                  <LayoutGrid className="h-4 w-4 text-black" />
                )}
              </Button>
              <Button
                variant="outline"
                className="bg-white text-black border-black hover:bg-gray-100 w-full sm:w-auto"
                onClick={() => {
                  setLeads(prev => {
                    const arr = [...prev];
                    for (let i = arr.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [arr[i], arr[j]] = [arr[j], arr[i]];
                    }
                    return arr;
                  });
                }}
                title="Shuffle Leads"
              >
                <Shuffle className="h-4 w-4 text-black mr-2" />
                Shuffle
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2 sm:p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 min-w-[600px] sm:min-w-0">
              <DataTable
                columns={columns}
                data={sanitizedLeads}
                loading={loading}
                onSort={(key, direction) => setSort({ key, direction })}
                sortKey={sort.key}
                sortDirection={sort.direction}
                onRowClick={(lead) => handleLeadClick(lead)}
                selectedRows={selected}
                onSelectionChange={(newSelected) => setSelected(newSelected)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalLeads)} of {totalLeads} leads
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 text-black" />
          </Button>
          <Button
            variant="outline"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4 text-black" />
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal />
    </div>
  );
};

export default Leads; 