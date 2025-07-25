import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
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
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { motion } from 'framer-motion';
import { DataTable } from '../../components/ui/DataTable';
import { cn, isValidUUID } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { dashboardApi } from '../../lib/api';

// Import optimized hooks
import { 
  useLeads, 
  useDebouncedLeads, 
  useCreateLead, 
  useUpdateLead, 
  useDeleteLead,
  useLeadActivities,
  type Lead,
  type LeadFilters
} from '../../hooks/useLeads';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { VirtualizedList } from '../../components/ui/VirtualizedList';

interface PropertyRequirements {
  type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  min_bathrooms: number | null;
  preferred_locations: string[];
  amenities: string[];
}

interface FilterPreset {
  name: string;
  filters: {
    status?: string[];
    min_budget?: number;
    next_followup_date?: string;
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadgeColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-green-100 text-green-800',
    'proposal': 'bg-purple-100 text-purple-800',
    'negotiation': 'bg-orange-100 text-orange-800',
    'closed_won': 'bg-green-100 text-green-800',
    'closed_lost': 'bg-red-100 text-red-800',
    'dumped': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const LeadsOptimized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Performance monitoring
  const { startRender, trackDataFetch, getPerformanceReport } = usePerformanceMonitor({
    componentName: 'Leads Page',
    logToConsole: import.meta.env.DEV
  });

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'created_at', direction: 'desc'});
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<{start: string|null, end: string|null}>({start: null, end: null});
  const [activeFilters, setActiveFilters] = useState<{[key: string]: any}>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [kpis, setKpis] = useState<any>(null);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [live, setLive] = useState(false);

  // Debounced search
  const {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    handleSearchChange,
    clearSearch,
    isValidSearch
  } = useDebouncedSearch({
    delay: 300,
    minLength: 2
  });

  // Build filters object
  const filters: LeadFilters = useMemo(() => ({
    search: debouncedSearchTerm,
    status: activeTab === 0 ? undefined : [TABS[activeTab].type],
    assigned_to: activeFilters.assigned_to,
    dateRange: dateRange.start && dateRange.end ? { start: dateRange.start, end: dateRange.end } : undefined,
    page,
    limit: 50,
    sort
  }), [debouncedSearchTerm, activeTab, activeFilters, dateRange, page, sort]);

  // Use optimized leads hook
  const {
    data: leadsData,
    isLoading,
    error,
    refetch
  } = useLeads(filters);

  const leads = leadsData?.leads || [];
  const totalCount = leadsData?.totalCount || 0;
  const totalPages = leadsData?.totalPages || 1;

  // Mutations
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();

  // Performance monitoring
  React.useEffect(() => {
    startRender();
    const report = getPerformanceReport();
    if (import.meta.env.DEV && report.shouldVirtualize) {
      console.log('💡 Consider using virtualization for better performance');
    }
  }, [leads.length]);

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  // Handle lead creation
  const handleCreateLead = async (leadData: Partial<Lead>) => {
    try {
      await trackDataFetch(
        createLeadMutation.mutateAsync(leadData),
        'create lead'
      );
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lead',
        variant: 'destructive',
      });
    }
  };

  // Handle lead update
  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      await trackDataFetch(
        updateLeadMutation.mutateAsync({ id, updates }),
        'update lead'
      );
      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead',
        variant: 'destructive',
      });
    }
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId: string) => {
    try {
      await trackDataFetch(
        deleteLeadMutation.mutateAsync(leadId),
        'delete lead'
      );
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
      setSelected(prev => prev.filter(id => id !== leadId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  // Virtualized list renderer
  const renderLeadItem = (lead: Lead, index: number) => (
    <motion.div
      key={lead.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">
              {lead.first_name} {lead.last_name}
            </h3>
            <p className="text-sm text-gray-500">{lead.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusBadgeColor(lead.status)}>
            {lead.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center space-x-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="h-3 w-3 text-gray-400" />
          <span>{getCurrencyDisplay(lead.budget || 0)}</span>
        </div>
      </div>
    </motion.div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load leads: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            {totalCount} leads • {isSearching ? 'Searching...' : 'Ready'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate('/leads/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchInput}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <ToggleGroup value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
          <ToggleGroupItem value="list">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Virtualized List */}
      {viewMode === 'list' && (
        <VirtualizedList
          items={leads}
          height={600}
          itemHeight={120}
          renderItem={renderLeadItem}
          className="border rounded-lg"
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead, index) => renderLeadItem(lead, index))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsOptimized; 