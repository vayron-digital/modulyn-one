import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debounce from 'lodash.debounce';
import LeadDetailsSidebar from '../../components/LeadDetailsSidebar';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  Home,
  LayoutGrid,
  List,
  Pencil,
  Trash,
  ArrowRight,
  Shuffle,
  MessageCircle,
  Target,
  Users,
  PieChart,
  LineChart,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon,
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
  Zap,
  Award,
  Briefcase,
  Globe,
  Heart,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { PropertyStatus, PROPERTY_STATUSES } from '../../utils/propertyStatuses';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectWithSearch } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/ui/DataTable';
import FilterBar from '../../components/ui/FilterBar';
import { cn, isValidUUID, safeLower } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { dashboardApi } from '../../lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import LeadsNavigation from '../../components/LeadsNavigation';
import { useLayout } from '../../components/layout/DashboardLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { mockLeads } from '../../mocks/leads';

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
  score?: number;
  tags?: string[];
  socialProfiles?: SocialProfile[];
  customFields?: Record<string, any>;
}

interface SocialProfile {
  platform: string;
  username: string;
  url: string;
}

interface LeadPipeline {
  stage: string;
  title: string;
  leads: Lead[];
  metrics: {
    count: number;
    conversionRate: number;
    avgTimeInStage: number;
    totalValue: number;
  };
}

interface FilterPreset {
  name: string;
  filters: {
    status?: string[];
    min_budget?: number;
    next_followup_date?: string;
  };
}

// Constants
const LEAD_STAGES: LeadPipeline[] = [
  { stage: 'new', title: 'New Leads', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'contacted', title: 'Contacted', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'qualified', title: 'Qualified', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'proposal', title: 'Proposal Sent', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'negotiation', title: 'Negotiation', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'closed_won', title: 'Closed Won', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
  { stage: 'closed_lost', title: 'Closed Lost', leads: [], metrics: { count: 0, conversionRate: 0, avgTimeInStage: 0, totalValue: 0 } },
];

const LEAD_SOURCES = [
  { label: 'Website', value: 'website', icon: Globe },
  { label: 'Referral', value: 'referral', icon: Users },
  { label: 'Social Media', value: 'social', icon: MessageCircle },
  { label: 'Direct', value: 'direct', icon: Phone },
  { label: 'Other', value: 'other', icon: MoreHorizontal },
];

const LEAD_STATUSES = [
  { label: 'New Lead', value: 'new', color: 'bg-blue-100 text-blue-800' },
  { label: 'Contacted', value: 'contacted', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Qualified', value: 'qualified', color: 'bg-green-100 text-green-800' },
  { label: 'Proposal Sent', value: 'proposal', color: 'bg-purple-100 text-purple-800' },
  { label: 'Negotiation', value: 'negotiation', color: 'bg-orange-100 text-orange-800' },
  { label: 'Closed Won', value: 'closed_won', color: 'bg-emerald-100 text-emerald-800' },
  { label: 'Closed Lost', value: 'closed_lost', color: 'bg-red-100 text-red-800' },
];

const TABS = [
  { status: 'all', label: 'All Leads' },
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'qualified', label: 'Qualified' },
  { status: 'proposal', label: 'Proposal' },
  { status: 'negotiation', label: 'Negotiation' },
  { status: 'closed_won', label: 'Closed Won' },
  { status: 'closed_lost', label: 'Closed Lost' },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusBadgeColor = (status: string) => {
  const statusConfig = LEAD_STATUSES.find(s => s.value === status);
  return statusConfig?.color || 'bg-gray-100 text-gray-800';
};

// Status mapping function to handle different status formats
const normalizeStatus = (status: string): string => {
  if (!status) return 'new';
  const statusLower = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    'new lead': 'new',
    'new leads': 'new',
    'fresh': 'new',
    'initial': 'new',
    'new': 'new',
    'active': 'new', // Map old enum value
    'contact': 'contacted',
    'contacted': 'contacted',
    'reached out': 'contacted',
    'called': 'contacted',
    'warm': 'contacted', // Map old enum value
    'qualified': 'qualified',
    'qualification': 'qualified',
    'hot': 'qualified', // Map old enum value
    'proposal': 'proposal',
    'proposal sent': 'proposal',
    'quote': 'proposal',
    'negotiation': 'negotiation',
    'negotiating': 'negotiation',
    'discussion': 'negotiation',
    'closed won': 'closed_won',
    'won': 'closed_won',
    'converted': 'closed_won',
    'sold': 'closed_won',
    'closed': 'closed_won', // Map old enum value
    'closed lost': 'closed_lost',
    'closed_lost': 'closed_lost',
    'lost': 'closed_lost',
    'rejected': 'closed_lost',
    'not interested': 'closed_lost',
    'dumped': 'dumped' // Keep dumped as is
  };
  return statusMap[statusLower] || status;
};

const Leads = () => {
  const { setHeader } = useLayout();
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Performance optimizations
  const [dataCache, setDataCache] = useState<Map<string, any>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipeline, setPipeline] = useState<LeadPipeline[]>(LEAD_STAGES);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' as 'asc' | 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<'status' | 'assign' | 'dump' | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [quickViewLead, setQuickViewLead] = useState<Lead | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLoading, setDragLoading] = useState<string | null>(null);

  // Debounced search
  const debouncedSearchTerm = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Cache key generator
  const getCacheKey = useCallback((params: any) => {
    return JSON.stringify({
      userId: user?.id,
      searchTerm,
      activeFilters,
      sort,
      page,
      pageSize,
      ...params
    });
  }, [user?.id, searchTerm, activeFilters, sort, page, pageSize]);

  // Check if data is fresh (less than 5 minutes old)
  const isDataFresh = useCallback((timestamp: number) => {
    return Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
  }, []);

  // Effects
  useEffect(() => {
    setHeader({
      title: '',
      breadcrumbs: [],
      tabs: [],
    });
  }, [setHeader]);

  // Keyboard support for drag operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDragging) {
        setIsDragging(false);
        setDragLoading(null);
        console.log('Drag operation cancelled by Escape key');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDragging]);

  // Optimized data fetching with caching
  useEffect(() => {
    if (!user) return;

    const cacheKey = getCacheKey({ type: 'leads' });
    const cachedData = dataCache.get(cacheKey);
    
    // Use cached data if it's fresh
    if (cachedData && isDataFresh(cachedData.timestamp)) {
      setLeads(cachedData.leads);
      setPipeline(cachedData.pipeline);
      setKpis(cachedData.kpis);
      setTotalLeads(cachedData.totalLeads);
      setTotalPages(cachedData.totalPages);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    fetchLeads();
  }, [user, searchTerm, activeFilters, sort, page, pageSize, refreshKey]);

  // Fetch profiles only once on mount
  useEffect(() => {
    if (user && profiles.length === 0) {
    fetchProfiles();
    checkAdminStatus();
    }
  }, [user]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear cache on unmount to prevent memory leaks
      setDataCache(new Map());
    };
  }, []);

  // Optimized search handler
  const handleSearchChange = useCallback((value: string) => {
    debouncedSearchTerm(value);
  }, [debouncedSearchTerm]);

  // Memoized filtered leads for better performance
  const filteredLeads = useMemo(() => {
    if (!leads.length) return [];
    
    return leads.filter(lead => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          lead.first_name?.toLowerCase().includes(searchLower) ||
          lead.last_name?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [leads, searchTerm]);

  // Functions
  const fetchLeads = useCallback(async () => {
    try {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setLoading(true);
      setError(null);
      
      if (!user) return;

      const isDevelopment = window.location.hostname === '192.168.1.249' || window.location.hostname === 'localhost';

      if (isDevelopment) {
        setLeads(mockLeads);
        setTotalLeads(mockLeads.length);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      // Fetch all leads for kanban view (no pagination)
      let allLeadsQuery = supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles!leads_assigned_to_fkey (
            full_name
          )
        `)
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .is('dumped_at', null);

      // Apply filters to all leads query
      if (activeFilters.status && activeFilters.status !== 'ALL') {
        allLeadsQuery = allLeadsQuery.eq('status', activeFilters.status);
      }
      if (activeFilters.source && activeFilters.source !== 'ALL') {
        allLeadsQuery = allLeadsQuery.eq('source', activeFilters.source);
      }
      if (activeFilters.agent && activeFilters.agent !== 'ALL') {
        allLeadsQuery = allLeadsQuery.eq('assigned_to', activeFilters.agent);
      }
      if (searchTerm) {
        allLeadsQuery = allLeadsQuery.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Apply sorting to all leads query
      allLeadsQuery = allLeadsQuery.order(sort.key, { ascending: sort.direction === 'asc' });

      const { data: allLeadsData, error: allLeadsError } = await allLeadsQuery;

      // Check if request was aborted during the query
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (allLeadsError) {
        console.error('Supabase error:', allLeadsError);
        throw new Error(allLeadsError.message || 'Database connection error');
      }

      const allLeads = allLeadsData || [];
      
      // Debug: Log the status values we're getting
      console.log('All leads fetched:', allLeads.length);
      console.log('Lead statuses:', [...new Set(allLeads.map(lead => lead.status))]);
      
      // Update pipeline with all leads
      const updatedPipeline = LEAD_STAGES.map(stage => {
        const stageLeads = allLeads.filter(lead => normalizeStatus(lead.status) === stage.stage);
        console.log(`Stage "${stage.stage}": ${stageLeads.length} leads`);
        return {
        ...stage,
          leads: stageLeads,
          metrics: calculateStageMetrics(stageLeads)
        };
      });
      
      // If no leads are showing in any stage, create a fallback stage for leads with unknown statuses
      const totalLeadsInStages = updatedPipeline.reduce((sum, stage) => sum + stage.leads.length, 0);
      console.log(`Total leads in pipeline stages: ${totalLeadsInStages} out of ${allLeads.length} total leads`);
      
      if (totalLeadsInStages === 0 && allLeads.length > 0) {
        console.log('No leads matched expected stages, creating fallback stage');
        const unknownStatusLeads = allLeads.filter(lead => !LEAD_STAGES.some(stage => normalizeStatus(lead.status) === stage.stage));
        if (unknownStatusLeads.length > 0) {
          const fallbackStage: LeadPipeline = {
            stage: 'unknown',
            title: 'Other Statuses',
            leads: unknownStatusLeads,
            metrics: calculateStageMetrics(unknownStatusLeads)
          };
          updatedPipeline.push(fallbackStage);
        }
      }
      
      // Calculate KPIs with all leads
      const calculatedKpis = calculateKPIs(allLeads);

      // For table view, apply pagination to the filtered results
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const paginatedLeads = allLeads.slice(from, to);
      
      // Cache the results
      const cacheKey = getCacheKey({ type: 'leads' });
      const cacheData = {
        leads: paginatedLeads,
        pipeline: updatedPipeline,
        kpis: calculatedKpis,
        totalLeads: allLeads.length,
        totalPages: Math.ceil(allLeads.length / pageSize),
        timestamp: Date.now()
      };
      
      setDataCache(prev => new Map(prev).set(cacheKey, cacheData));
      
      // Update state
      setLeads(paginatedLeads);
      setPipeline(updatedPipeline);
      setKpis(calculatedKpis);
      setTotalLeads(allLeads.length);
      setTotalPages(Math.ceil(allLeads.length / pageSize));
      setLastFetchTime(Date.now());
      
    } catch (err: any) {
      console.error('Fetch leads error:', err);
      setError(err.message || 'Failed to fetch leads. Please try again.');
      
      // Show user-friendly error toast
      toast({
        title: "Error",
        description: err.message || 'Failed to fetch leads. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [user, searchTerm, activeFilters, sort, page, pageSize, getCacheKey, toast]);

  const calculateStageMetrics = (leads: Lead[]) => {
    const count = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.budget || 0), 0);
    const avgTimeInStage = leads.length > 0 ? 3.5 : 0; // Mock calculation
    const conversionRate = leads.length > 0 ? 15.5 : 0; // Mock calculation

    return { count, conversionRate, avgTimeInStage, totalValue };
  };

  const calculateKPIs = useCallback((leads: Lead[]) => {
    try {
    const totalLeads = leads.length;
      const closedWonLeads = leads.filter(l => normalizeStatus(l.status) === 'Closed Won');
      const newLeads = leads.filter(l => normalizeStatus(l.status) === 'New');
      const closedLostLeads = leads.filter(l => normalizeStatus(l.status) === 'Closed Lost');
      
      // Filter leads for Avg Deal Size and Pipeline Value (exclude New, Contacted, Closed Lost)
      const qualifiedLeads = leads.filter(l => {
        const status = normalizeStatus(l.status);
        return status === 'qualified' || status === 'proposal' || status === 'negotiation' || status === 'closed_won';
      });
      
      const conversionRate = totalLeads > 0 ? (closedWonLeads.length / totalLeads) * 100 : 0;
      const avgDealSize = qualifiedLeads.length > 0 ? qualifiedLeads.reduce((sum, l) => sum + (l.budget || 0), 0) / qualifiedLeads.length : 0;
      const pipelineValue = qualifiedLeads.reduce((sum, l) => sum + (l.budget || 0), 0);
      const revenueThisMonth = closedWonLeads.reduce((sum, l) => sum + (l.budget || 0), 0);

      return { 
      totalLeads, 
        conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
        avgDealSize: Math.round(avgDealSize * 100) / 100,
        pipelineValue: Math.round(pipelineValue * 100) / 100,
        newLeadsToday: newLeads.length,
        leadsConvertedThisMonth: closedWonLeads.length,
        lostLeads: closedLostLeads.length,
        revenueThisMonth: Math.round(revenueThisMonth * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      return {
        totalLeads: 0,
        conversionRate: 0,
        avgDealSize: 0,
        pipelineValue: 0,
        newLeadsToday: 0,
        leadsConvertedThisMonth: 0,
        lostLeads: 0,
        revenueThisMonth: 0
      };
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = 'profiles';
      const cachedProfiles = dataCache.get(cacheKey);
      
      if (cachedProfiles && isDataFresh(cachedProfiles.timestamp)) {
        setProfiles(cachedProfiles.data);
        return;
      }

      const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw new Error('Failed to fetch user profiles');
      }

      const profilesData = data || [];
      
      // Cache the results
      setDataCache(prev => new Map(prev).set(cacheKey, {
        data: profilesData,
        timestamp: Date.now()
      }));
      
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    }
  }, [dataCache, isDataFresh, toast]);

  const checkAdminStatus = useCallback(async () => {
    try {
      if (!user?.id) return;

      // Check cache first
      const cacheKey = `admin_status_${user.id}`;
      const cachedStatus = dataCache.get(cacheKey);
      
      if (cachedStatus && isDataFresh(cachedStatus.timestamp)) {
        setIsAdmin(cachedStatus.isAdmin);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      const isAdminUser = profile?.is_admin || profile?.role === 'Administrator' || false;
      
      // Cache the results
      setDataCache(prev => new Map(prev).set(cacheKey, {
        isAdmin: isAdminUser,
        timestamp: Date.now()
      }));
      
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [user?.id, dataCache, isDataFresh]);

  const updateLeadStatus = async (leadId: string, newStatus: string, isDragOperation = false) => {
    try {
      console.log(`Updating lead ${leadId} status to "${newStatus}"`);
      
      // Store original state for rollback
      let originalLeads: Lead[] = [];
      let originalPipeline: LeadPipeline[] = [];
      if (isDragOperation) {
        originalLeads = [...leads];
        originalPipeline = [...pipeline];
      }
      
      // Optimistic update for better UX
      if (isDragOperation) {
        setDragLoading(leadId);
        
        // Optimistically update pipeline
    setPipeline(prevPipeline => {
      const newPipeline = [...prevPipeline];
          
          // Find and remove lead from current stage
          let movedLead: Lead | undefined;
          newPipeline.forEach(stage => {
            const leadIndex = stage.leads.findIndex(lead => lead.id === leadId);
            if (leadIndex !== -1) {
              [movedLead] = stage.leads.splice(leadIndex, 1);
            }
          });
          
      if (!movedLead) return prevPipeline;
      
          // Update lead status
          movedLead.status = newStatus;
          
          // Add to new stage
          const targetStage = newPipeline.find(stage => stage.stage === newStatus);
          if (targetStage) {
            targetStage.leads.push(movedLead);
          }
          
          // Recalculate metrics for all stages
          newPipeline.forEach(stage => {
            stage.metrics = calculateStageMetrics(stage.leads);
          });
      
      return newPipeline;
    });
      }

      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        
        // Rollback optimistic update on error
        if (isDragOperation) {
          setRefreshKey(prev => prev + 1);
        }
        
        toast({
          title: "Error",
          description: "Failed to update lead status",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus }
            : lead
        )
      );

      // Only refresh pipeline data if not a drag operation (to avoid double updates)
      if (!isDragOperation) {
        setRefreshKey(prev => prev + 1);
      }

      toast({
        title: "Success",
        description: `Lead moved to ${LEAD_STATUSES.find(s => s.value === newStatus)?.label || newStatus}`,
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      
      // Rollback optimistic update on error
      if (isDragOperation) {
        setRefreshKey(prev => prev + 1);
      }
      
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    } finally {
      if (isDragOperation) {
        setDragLoading(null);
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      setIsDragging(false);
      return;
    }

    const { source, destination, draggableId } = result;
    const sourceStageIndex = parseInt(source.droppableId);
    const destinationStageIndex = parseInt(destination.droppableId);
    
    // Reset dragging state
    setIsDragging(false);
    
    // Validate indices
    if (isNaN(sourceStageIndex) || isNaN(destinationStageIndex)) {
      console.error('Invalid stage indices:', { sourceStageIndex, destinationStageIndex });
      return;
    }
    
    if (sourceStageIndex === destinationStageIndex) return;

    const sourceStage = pipeline[sourceStageIndex];
    const destinationStage = pipeline[destinationStageIndex];
    
    if (!sourceStage || !destinationStage) {
      console.error('Invalid stages:', { sourceStage, destinationStage });
      return;
    }
    
    const lead = sourceStage.leads.find(l => l.id === draggableId);
    
    if (!lead) {
      console.error('Lead not found:', draggableId);
      return;
    }

    const newStatus = destinationStage.stage;
    console.log(`Dragging lead ${lead.id} from "${sourceStage.stage}" to "${newStatus}"`);
    
    try {
      await updateLeadStatus(lead.id, newStatus, true);
    } catch (error) {
      console.error('Error in drag operation:', error);
      // Error handling is done in updateLeadStatus
    }
  };

  // Fix onDragStart and onDragUpdate types
  const onDragStart = () => {
    setIsDragging(true);
    console.log('Drag started');
  };

  const onDragUpdate = () => {
    // No-op for now, but could add visual feedback
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleExport = () => {
    // Implementation for export functionality
    toast({ title: 'Export started', description: 'Your data is being prepared for download', variant: 'default' });
  };

  const handleDelete = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setLeadToDelete(lead);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;

    try {
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadToDelete.id)
        .single();

      if (fetchError) throw fetchError;

      if (isAdmin) {
        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadToDelete.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('dumped_leads')
          .insert([{
            ...lead,
            dumped_by: user?.id,
            dumped_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        const { error: deleteError } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadToDelete.id);

        if (deleteError) throw deleteError;
      }

      toast({
        title: 'Success',
        description: isAdmin ? 'Lead deleted permanently' : 'Lead moved to dumped leads',
        variant: 'default'
      });

      setRefreshKey(k => k + 1);
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDrawer(true);
  };

  const openDrawer = async (lead: Lead) => {
    setSelectedLead(lead);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedLead(null);
  };

  // Render functions
  const renderLeadCard = useCallback((lead: Lead, index: number) => (
    <Draggable key={lead.id} draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white rounded-2xl border border-slate-200/50 p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:scale-[1.02]",
            snapshot.isDragging && "shadow-2xl rotate-2 scale-110 z-50",
            dragLoading === lead.id && "opacity-50 pointer-events-none",
            isDragging && dragLoading !== lead.id && "pointer-events-none"
          )}
          onClick={(e) => {
            // Prevent click during drag operations
            if (isDragging || dragLoading === lead.id) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            handleLeadClick(lead);
          }}
        >
          {/* Loading overlay */}
          {dragLoading === lead.id && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Lead Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {lead.first_name?.[0]}{lead.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {lead.first_name} {lead.last_name}
                </div>
                <div className="text-xs text-slate-500">{lead.company || 'No company'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs px-2 py-1 font-semibold", getScoreColor(lead.score || 0))}>
                {lead.score || 0}
              </Badge>
              <Select
                value={lead.status}
                onValueChange={(newStatus) => updateLeadStatus(lead.id, newStatus)}
                disabled={isDragging || dragLoading === lead.id}
              >
                <SelectTrigger className="h-6 w-auto text-xs bg-slate-50 border-slate-200 hover:border-slate-300 disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lead Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Mail className="h-3 w-3" />
              <span className="truncate font-medium">{lead.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Phone className="h-3 w-3" />
              <span className="font-medium">{lead.phone}</span>
            </div>
            {lead.budget && (
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <DollarSign className="h-3 w-3" />
                <span className="font-bold text-slate-900">{formatCurrency(lead.budget)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {lead.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 font-medium">
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 font-medium">
                  +{lead.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              {lead.assigned_user && (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-slate-100 text-slate-700 font-medium">
                    {lead.assigned_user.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="font-medium">{lead.assigned_user?.full_name || 'Unassigned'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{formatDate(lead.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  ), [isDragging, dragLoading, handleLeadClick, updateLeadStatus]);

  const renderPipelineColumn = (stage: LeadPipeline, index: number) => (
    <Droppable key={stage.stage} droppableId={index.toString()}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "min-w-[350px] bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg transition-all duration-200",
            snapshot.isDraggingOver && "border-blue-400 bg-blue-50/50 shadow-xl scale-105",
            isDragging && !snapshot.isDraggingOver && "opacity-75"
          )}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">{stage.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full font-semibold text-xs">
                  {stage.metrics.count} leads
                </span>
                <span className="font-medium">{stage.metrics.conversionRate.toFixed(1)}% conversion</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-10 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              disabled={isDragging}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Leads */}
          <div className={cn(
            "space-y-4",
            // Only apply fixed height and scroll to "New Leads" column
            stage.stage === 'new' ? "h-[400px] overflow-y-auto" : "min-h-[200px]",
            snapshot.isDraggingOver && "bg-blue-50/30 rounded-lg p-2 border-2 border-dashed border-blue-300"
          )}>
            {stage.leads.map((lead, leadIndex) => renderLeadCard(lead, leadIndex))}
            {provided.placeholder}
            
            {/* Empty state */}
            {stage.leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-slate-400">
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-200">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No leads in this stage</p>
                  <p className="text-xs mt-1">Drag leads here to move them</p>
                </div>
              </div>
            )}
          </div>

          {/* Column Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200/50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                <span className="font-bold text-slate-900">Total Value: {formatCurrency(stage.metrics.totalValue)}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">Avg: {stage.metrics.avgTimeInStage.toFixed(1)} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );

  // DataTable columns
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
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
      label: 'Phone',
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
      label: 'Status',
      accessorKey: 'status',
      render: (item: any) => (
        <Select
          value={item.status}
          onValueChange={(newStatus) => updateLeadStatus(item.id, newStatus)}
        >
          <SelectTrigger className="w-32" onClick={e => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      accessorKey: 'source',
      render: (item: any) => (
        <span className="capitalize">{item.source}</span>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      accessorKey: 'budget',
      render: (item: any) => (
        <span className="font-medium">{formatCurrency(item.budget || 0)}</span>
      ),
    },
    ...(isAdmin ? [
      {
        key: 'agent',
        label: 'Agent',
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
      label: 'Created',
      accessorKey: 'created_at',
      render: (item: any) => formatDate(item.created_at),
    },
    {
      key: 'actions',
      label: 'Actions',
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
  ], [isAdmin, profiles, toast, setRefreshKey]);

  // Filters
  const filters = [
    { key: 'status', label: 'Status', type: 'select', options: LEAD_STATUSES.map(s => ({ label: s.label, value: s.value })) },
    { key: 'source', label: 'Source', type: 'select', options: LEAD_SOURCES.map(s => ({ label: s.label, value: s.value })) },
    { key: 'agent', label: 'Agent', type: 'select', options: profiles.filter(p => p.id).map(p => ({ label: p.full_name, value: p.id })) },
  ];

  // Error boundary
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl opacity-80"></div>
            <AlertCircle className="relative w-10 h-10 text-red-600 mx-auto mt-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Error Loading Leads</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setError(null);
                setRefreshKey(prev => prev + 1);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-slate-200 hover:border-slate-300"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with skeleton
  if (loading && isInitialLoad) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* KPI skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
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
      message="Loading leads..."
    >
      <div className="min-h-screen bg-surface-secondary">

        {/* Premium Header Section */}
        <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-heading mb-1">Lead Management</h1>
                <p className="text-sm text-text-secondary">Manage and nurture your sales pipeline</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search leads, emails, companies..."
                    defaultValue={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 w-80 bg-surface-primary border border-fields-border rounded-lg focus-visible:ring-primary-default/30"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-lg"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button 
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="rounded-lg"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => navigate('/leads/new')} 
                  className=""
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Lead
                </Button>
              </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Leads Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{kpis?.totalLeads || 0}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Leads</p>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+2.1%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{kpis?.conversionRate?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-slate-600 font-medium">Conversion Rate</p>
                  </div>
                </div>
              </div>

              {/* Avg Deal Size Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+8.3%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(kpis?.avgDealSize || 0)}</p>
                    <p className="text-sm text-slate-600 font-medium">Avg Deal Size</p>
                  </div>
                </div>
              </div>

              {/* Pipeline Value Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+15.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(kpis?.pipelineValue || 0)}</p>
                    <p className="text-sm text-slate-600 font-medium">Pipeline Value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium View Controls */}
        <div className="bg-surface-primary border-b border-fields-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-surface-secondary rounded-lg p-1 border border-fields-border">
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className={viewMode === 'kanban' 
                    ? '' 
                    : 'text-text-secondary hover:text-text-heading'
                  }
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Pipeline
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' 
                    ? '' 
                    : 'text-text-secondary hover:text-text-heading'
                  }
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' 
                    ? '' 
                    : 'text-text-secondary hover:text-text-heading'
                  }
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
              
              {/* Additional Actions */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90 shadow-lg rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  className="bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90 shadow-lg rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-surface-secondary rounded-full px-3 py-1 border border-fields-border">
                <div className="w-2 h-2 bg-states-success rounded-full"></div>
                <span className="text-sm font-medium text-text-secondary">{totalLeads} leads</span>
              </div>
              <div className="text-text-secondary text-sm">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Enhanced Filters Panel */}
        {showFilters && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filters.map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{f.label}</label>
                  <Select
                    value={activeFilters[f.key] || ''}
                    onValueChange={v => setActiveFilters(a => ({ ...a, [f.key]: v }))}
                  >
                  <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300">
                    <SelectValue placeholder={`Select ${f.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="ALL">All {f.label}</SelectItem>
                      {f.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setRefreshKey(k => k + 1)} size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setActiveFilters({})} size="sm">
              Clear All
            </Button>
            </div>
          </div>
        )}

      {/* Main Content with Enhanced Layout */}
      <div className="p-6">
        {viewMode === 'kanban' && (
          <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
            {/* Global drag indicator */}
            {isDragging && (
              <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm font-medium">Dragging lead...</span>
              </div>
            )}
            
            <div className="flex space-x-8 overflow-x-auto pb-6">
              {pipeline.map((stage, index) => renderPipelineColumn(stage, index))}
            </div>
            {pipeline.every(stage => stage.leads.length === 0) && (
              <div className="text-center py-12">
                <div className="bg-white/70 backdrop-blur-sm border-slate-200/50 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-slate-400 mb-4">
                    <Users className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads in pipeline</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {leads.length > 0 
                      ? "Your leads don't match the expected status values. Check the console for debugging info."
                      : "No leads found. Create your first lead to get started!"
                    }
                  </p>
                  <Button onClick={() => navigate('/leads/add')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </div>
            )}
          </DragDropContext>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {leads.map(lead => (
              <Card key={lead.id} className="hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                          {lead.first_name?.[0]}{lead.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{lead.first_name} {lead.last_name}</h3>
                        <p className="text-sm text-slate-600">{lead.email}</p>
                        <p className="text-xs text-slate-500">{lead.company || 'No company'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <SelectWithSearch
                        value={lead.status}
                        onValueChange={(newStatus) => updateLeadStatus(lead.id, newStatus)}
                        placeholder="Select status"
                        searchPlaceholder="Search statuses..."
                        items={LEAD_STATUSES.map(status => ({
                          value: status.value,
                          label: status.label,
                          description: `Change lead status to ${status.label}`,
                          icon: <div className={`w-3 h-3 rounded-full ${getStatusBadgeColor(status.value)}`} />
                        }))}
                      />
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">{formatCurrency(lead.budget || 0)}</span>
                        <p className="text-xs text-slate-500">Budget</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'table' && (
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={leads.map(lead => ({ ...lead, _rowKey: lead.id })) as any}
                  loading={loading}
                  onSort={(key, direction) => setSort({ key, direction })}
                  sortKey={sort.key}
                  sortDirection={sort.direction}
                  onRowClick={(lead) => handleLeadClick(lead as Lead)}
                  selectedRows={selected}
                  onSelectionChange={(newSelected) => setSelected(newSelected)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {viewMode === 'table' && (
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalLeads)} of {totalLeads} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Lead Details Sidebar */}
      {showDrawer && selectedLead && (
        <LeadDetailsSidebar
          lead={selectedLead}
          isOpen={showDrawer}
          onClose={closeDrawer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your lead and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LoadingState>
  );
};

export default Leads; 