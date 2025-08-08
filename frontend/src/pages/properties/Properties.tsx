import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
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
  Building,
  MapPin,
  Tag,
  DollarSign,
  Home,
  Calendar,
  User,
  Check,
  X,
  Star,
  StarOff,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Pencil,
  Trash,
  Grid,
  List,
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
  Clock,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { getCurrencyDisplay } from '../../utils/currency';
import { PropertyStatus, PROPERTY_STATUSES } from '../../utils/propertyStatuses';
import { getStatusBadgeColor as getStatusColor } from '../../utils/propertyStatuses';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input, Checkbox } from '../../components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import PropertyCard from '../../components/properties/PropertyCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import PropertyList from '../../components/properties/PropertyList';
import PropertyFilters from '../../components/properties/PropertyFilters';
import PropertySort from '../../components/properties/PropertySort';
import PropertyPagination from '../../components/properties/PropertyPagination';
import useDebounce from '../../hooks/useDebounce';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { PropertyType, RESIDENTIAL_TYPES, COMMERCIAL_TYPES, ALL_PROPERTY_TYPES } from '../../utils/propertyTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPropertyTypeDisplay } from '../../utils/propertyTypesByLocation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';

interface Property {
  id: string;
  title: string;
  type: PropertyType;
  property_type_detailed?: string;
  status: string;
  price: number;
  current_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  bathroom_options?: number[];
  size_options?: number[];
  square_footage?: number;
  address: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  owner?: string;
  images?: string[];
  bedroom_options?: number[];
}

const ALL_STATUS_OPTIONS: { label: string; status: PropertyStatus | null }[] = [
  { label: 'All Properties', status: null },
  ...PROPERTY_STATUSES.CORE.map(s => ({ label: s, status: s })),
  ...PROPERTY_STATUSES.DEVELOPMENT.map(s => ({ label: s, status: s })),
  ...PROPERTY_STATUSES.TRANSACTIONAL.map(s => ({ label: s, status: s })),
  ...PROPERTY_STATUSES.RENTAL.map(s => ({ label: s, status: s })),
  ...PROPERTY_STATUSES.MARKET.map(s => ({ label: s, status: s })),
];

const DEFAULT_TABS: Tab[] = [
  { label: 'All Properties', status: null },
  { label: 'Available', status: 'Available' as PropertyStatus },
  { label: 'Under Offer', status: 'Under Offer' as PropertyStatus },
  { label: 'Sold', status: 'Sold' as PropertyStatus },
  { label: 'Rented', status: 'Rented' as PropertyStatus },
  { label: 'Off Market', status: 'Off Market' as PropertyStatus }
];

const PAGE_SIZE = 12;

interface FilterPreset {
  name: string;
  filters: {
    type?: PropertyType[];
    min_price?: number;
    max_price?: number;
    status?: string[];
  };
}

const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Premium Properties',
    filters: {
      type: ['apartment', 'villa', 'penthouse'] as unknown as PropertyType[],
      min_price: 1000000
    }
  },
  {
    name: 'Commercial Spaces',
    filters: {
      type: ['office', 'retail', 'warehouse', 'commercial-building'] as unknown as PropertyType[]
    }
  },
  {
    name: 'Land Plots',
    filters: {
      type: ['land'] as unknown as PropertyType[]
    }
  }
];

interface Filters {
  type: PropertyType | 'All';
  status: PropertyStatus | 'All';
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  tags: string;
}

interface SortConfig {
  field: keyof Property;
  order: 'asc' | 'desc';
}

interface Tab {
  label: string;
  status: PropertyStatus | null;
}

interface TabProps {
  tab: Tab;
  isActive: boolean;
  onClick: (tab: Tab) => void;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

type TabName = 'Overview' | 'Details' | 'Media' | 'Location' | 'Pricing' | 'Documents' | 'History';

const Properties = () => {
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{start: string|null, end: string|null}>({start: null, end: null});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: 'All',
    status: 'All',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    tags: ''
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<SortConfig>({ field: 'created_at', order: 'desc' });
  const [bulkAction, setBulkAction] = useState<'status'|'type'|'delete'|null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const [showQuickView, setShowQuickView] = useState<Property | null>(null);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(DEFAULT_FILTER_PRESETS);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const savedTabs = localStorage.getItem('propertyTabs');
      return savedTabs ? JSON.parse(savedTabs) : DEFAULT_TABS;
    } catch {
      return DEFAULT_TABS;
    }
  });
  const [showCustomizeTabs, setShowCustomizeTabs] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showManageTabs, setShowManageTabs] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    underOffer: 0,
    totalValue: 0
  });
  
  const debouncedFilters = useDebounce(filters, 500);

  const propertyTypeOptions = [
    { value: 'residential' as PropertyType, label: 'Residential' },
    { value: 'apartment' as PropertyType, label: 'Apartment' },
    { value: 'villa' as PropertyType, label: 'Villa' },
    { value: 'penthouse' as PropertyType, label: 'Penthouse' },
    { value: 'commercial' as PropertyType, label: 'Commercial' },
    { value: 'office' as PropertyType, label: 'Office' },
    { value: 'retail' as PropertyType, label: 'Retail' },
    { value: 'warehouse' as PropertyType, label: 'Warehouse' },
    { value: 'commercial-building' as PropertyType, label: 'Commercial Building' },
    { value: 'land' as PropertyType, label: 'Land' },
    { value: 'industrial' as PropertyType, label: 'Industrial' }
  ];

  // Fetch properties with enhanced error handling and stats
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' });

        // Apply filters
        if (filters.type !== 'All') query = query.eq('type', filters.type);
        if (filters.status !== 'All') query = query.eq('status', filters.status);
        if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
        if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
        if (filters.bedrooms) query = query.eq('bedrooms', parseInt(filters.bedrooms));
        if (filters.bathrooms) query = query.eq('bathrooms', parseFloat(filters.bathrooms));
        if (filters.location) query = query.ilike('address', `%${filters.location}%`);
        if (filters.tags) query = query.contains('tags', filters.tags.split(','));

        // Apply search
        if (search) {
          query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sort.field, { ascending: sort.order === 'asc' });

        // Apply pagination
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;
        
        if (isMounted) {
          setProperties(data || []);
          setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
          
          // Calculate stats
          const allProperties = await supabase.from('properties').select('*');
          if (allProperties.data) {
            const total = allProperties.data.length;
            const available = allProperties.data.filter(p => p.status === 'Available').length;
            const sold = allProperties.data.filter(p => p.status === 'Sold').length;
            const underOffer = allProperties.data.filter(p => p.status === 'Under Offer').length;
            const totalValue = allProperties.data.reduce((sum, p) => sum + (p.price || 0), 0);
            
            setStats({ total, available, sold, underOffer, totalValue });
          }
        }
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        if (isMounted) {
          setError(error.message);
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProperties();
    return () => { isMounted = false; };
  }, [location.pathname, page, sort, filters, search, toast]);

  // Real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('properties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        setRefreshKey(k => k + 1);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (newSort: { field: string; order: 'asc' | 'desc' }) => {
    const updatedSort: SortConfig = {
      field: newSort.field as keyof Property,
      order: newSort.order
    };
    setSort(updatedSort);
  };

  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelected(prev => 
      prev.length === properties.length ? [] : properties.map(p => p.id)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: PropertyStatus) => {
    return getStatusColor(status);
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ');
  };

  const handleBulkUpdate = async () => {
    if (!bulkAction || !bulkValue || selected.length === 0) return;

    try {
      const updates = selected.map(id => ({
        id,
        [bulkAction]: bulkValue
      }));

      const { error } = await supabase
        .from('properties')
        .upsert(updates);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'Properties updated successfully', 
        variant: 'default' 
      });
      setRefreshKey(k => k + 1);
      setBulkAction(null);
      setBulkValue('');
      setSelected([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', selected);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'Properties deleted successfully', 
        variant: 'default' 
      });
      setRefreshKey(k => k + 1);
      setSelected([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Type', 'Price', 'Address', 'Status', 'Created At'];
    const data = properties.map(p => [
      p.id,
                  p.title,
      p.type,
      p.price,
      p.address,
      p.status,
      new Date(p.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `properties-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleQuickView = (property: Property) => {
    setShowQuickView(property);
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const getBadgeVariant = (status: PropertyStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const color = getStatusBadgeColor(status);
    if (color.includes('green')) return 'default';
    if (color.includes('red')) return 'destructive';
    if (color.includes('purple')) return 'secondary';
    if (color.includes('gray')) return 'outline';
    return 'default';
  };

  const formatOptions = (arr: (string | number)[] | undefined, fallback: string | number | undefined) => {
    if (!arr || arr.length === 0) return fallback ?? 'N/A';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} - ${arr[1]}`;
    return arr.join(', ');
  };

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <LoadingState
      loading={authLoading}
      error={authError}
      type="page"
      message="Loading properties..."
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-20">
      {/* Hero Section with Floating KPIs */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold text-white">Properties</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Live Portfolio</span>
        </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-300" />
            <Input
                  placeholder="Search properties, addresses..."
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
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/properties/new')} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
        </div>
      </div>

          {/* Floating KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Total Properties</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-300 mt-1">+8.2% from last month</p>
        </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Building className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Available</p>
                  <p className="text-3xl font-bold text-white">{stats.available}</p>
                  <p className="text-xs text-slate-300 mt-1">Ready for sale</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Under Offer</p>
                  <p className="text-3xl font-bold text-white">{stats.underOffer}</p>
                  <p className="text-xs text-slate-300 mt-1">In negotiation</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Sold</p>
                  <p className="text-3xl font-bold text-white">{stats.sold}</p>
                  <p className="text-xs text-slate-300 mt-1">This month</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-red-300" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
                  <p className="text-xs text-slate-300 mt-1">Total market value</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mx-6 -mt-6 mb-6 border border-slate-200/50 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-wrap gap-2">
        {tabs.map((tab, idx) => (
            <Button
            key={tab.label}
              variant={activeTab === idx ? 'default' : 'outline'}
                  className={`${
                    activeTab === idx 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white/50 backdrop-blur-sm text-slate-700 border-slate-200/50 hover:bg-white/70'
                  }`}
              onClick={() => handleTabChange(idx)}
          >
            {tab.label}
            </Button>
          ))}
        </div>
      </div>

          <div className="flex items-center space-x-3">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'table' | 'card')}>
              <ToggleGroupItem value="card" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white bg-white/50 backdrop-blur-sm border-slate-200/50">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" className="data-[state=on]:bg-blue-600 data-[state=on]:text-white bg-white/50 backdrop-blur-sm border-slate-200/50">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-200/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Property Type</Label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    {propertyTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    {PROPERTY_STATUSES.CORE.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Min Price</Label>
                <Input
                  type="number"
                  placeholder="Min Price"
                  className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Max Price</Label>
                <Input
                  type="number"
                  placeholder="Max Price"
                  className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selected.length} property{selected.length !== 1 ? 'ies' : 'y'} selected
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={bulkAction || ''} onValueChange={(value) => setBulkAction(value as any)}>
                <SelectTrigger className="w-40 bg-white border-blue-200">
                  <SelectValue placeholder="Bulk Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Update Status</SelectItem>
                  <SelectItem value="type">Update Type</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              
              {bulkAction && bulkAction !== 'delete' && (
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger className="w-40 bg-white border-blue-200">
                    <SelectValue placeholder="Select Value" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulkAction === 'status' && PROPERTY_STATUSES.CORE.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                    {bulkAction === 'type' && propertyTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
          <Button
                variant="outline"
                size="sm"
                onClick={bulkAction === 'delete' ? handleBulkDelete : handleBulkUpdate}
                disabled={!bulkAction || (bulkAction !== 'delete' && !bulkValue)}
                className="bg-white border-blue-200 hover:bg-blue-50"
              >
                {bulkAction === 'delete' ? 'Delete Selected' : 'Update Selected'}
          </Button>
              
          <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear Selection
          </Button>
        </div>
          </div>
        </div>
      )}

      {/* Properties Grid/Table */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {viewMode === 'card' ? (
            <motion.div
              key="card-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  refNo={property.id}
                  title={property.title}
                  price={property.current_price ?? property.price}
                  type={property.property_type_detailed || property.type}
                  location={property.address}
                  bedrooms={String(formatOptions(property.bedroom_options, property.bedrooms) ?? 'N/A')}
                  bathrooms={String(formatOptions(property.bathroom_options, property.bathrooms) ?? 'N/A')}
                  area={String(formatOptions(property.size_options, property.square_footage) ?? 'N/A')}
                  status={property.status}
                  listingDate={new Date(property.created_at).toLocaleDateString()}
                  owner={property.owner || ''}
                  image={property.images?.[0] || ''}
                  onClick={() => navigate(`/properties/${property.id}`)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg overflow-hidden"
            >
              <Table>
              <TableHeader>
                  <TableRow className="bg-slate-50/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selected.length === properties.length}
                      onCheckedChange={handleSelectAll}
                        className="rounded"
                    />
                  </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">
                    <div className="flex items-center gap-1">
                      Name
                        {sort.field === 'title' && (
                        sort.order === 'asc' ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">Type</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">Price</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">Status</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">Location</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100/50">Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(property.id)}
                        onCheckedChange={() => handleSelect(property.id)}
                          className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">{property.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {formatPropertyTypeDisplay(property.property_type_detailed || property.type)}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {formatCurrency(property.price)}
                          </span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getBadgeVariant(property.status as PropertyStatus)}>
                          {property.status}
                      </Badge>
                    </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600 truncate max-w-32">
                            {property.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                      {new Date(property.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                                  className="h-8 w-8"
                          onClick={() => handleQuickView(property)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick View</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                                  className="h-8 w-8"
                            onClick={() => navigate(`/properties/edit/${property.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                                  className="h-8 w-8"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-slate-600">
          Showing {properties.length} of {totalPages * PAGE_SIZE} properties
        </div>
          
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
              className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70"
          >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
          </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className={`w-8 h-8 p-0 ${
                      page === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70'
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
              className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/70"
          >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <DialogRoot open={!!showQuickView} onOpenChange={() => setShowQuickView(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
                                      <DialogTitle className="text-xl font-semibold">{showQuickView.title}</DialogTitle>
              <DialogDescription>
                Property details and quick actions
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-3">
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                    <Home className="h-4 w-4 text-slate-500" />
                    <span className="capitalize">{showQuickView.type}</span>
                    </div>
                  </div>
                
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Status</Label>
                  <Badge variant={getBadgeVariant(showQuickView.status as PropertyStatus)} className="mt-1">
                      {showQuickView.status}
                    </Badge>
                  </div>
                
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Price</Label>
                    <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold">{formatCurrency(showQuickView.price)}</span>
                    </div>
                  </div>
              </div>
              
              <div className="space-y-3">
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{showQuickView.address}</span>
                    </div>
                  </div>
                
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Bedrooms</Label>
                  <span className="text-sm">{showQuickView.bedrooms ?? 'N/A'}</span>
                  </div>
                
                  <div>
                  <Label className="text-sm font-medium text-slate-600">Bathrooms</Label>
                  <span className="text-sm">{showQuickView.bathrooms ?? 'N/A'}</span>
                  </div>
                    </div>
                  </div>
            
            {showQuickView.tags && showQuickView.tags.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <Label className="text-sm font-medium text-slate-600">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {showQuickView.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
        </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const address = showQuickView.address || showQuickView.title;
                  if (address) {
                    const encodedAddress = encodeURIComponent(address);
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                    window.open(googleMapsUrl, '_blank');
                  } else {
                    toast({
                      title: "No Address Available",
                      description: "This property doesn't have an address to show on the map.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/properties/edit/${showQuickView.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
              <Button
                onClick={() => navigate(`/properties/${showQuickView.id}`)}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      )}
    </div>
    </LoadingState>
  );
};

export default Properties;