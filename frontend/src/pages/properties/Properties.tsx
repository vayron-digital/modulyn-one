import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
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
import { Badge, badgeVariants } from '../../components/ui/badge';
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

interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
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

const PAGE_SIZE = 10;

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
  const { user } = useAuth();
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
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showManageTabs, setShowManageTabs] = useState(false);
  
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
          query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
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
    setPage(1); // Reset to first page when filters change
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'start'|'end') => {
    setDateRange(prev => ({
      ...prev,
      [which]: e.target.value
    }));
    setPage(1);
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
      p.name,
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

  const savePreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset: FilterPreset = {
      name,
      filters: {
        type: filters.type !== 'All' ? [filters.type] : undefined,
        min_price: filters.minPrice ? filters.minPrice : undefined,
        max_price: filters.maxPrice ? filters.maxPrice : undefined,
        status: filters.status !== 'All' ? [filters.status] : undefined,
      }
    };

    setFilterPresets(prev => [...prev, newPreset]);
    setActivePreset(name);
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilters({
      type: preset.filters.type?.[0] || 'All',
      minPrice: preset.filters.min_price?.toString() || '',
      maxPrice: preset.filters.max_price?.toString() || '',
      bedrooms: 'All',
      bathrooms: 'All',
      location: '',
      status: (preset.filters.status?.[0] as PropertyStatus | 'All') || 'All',
      tags: '',
    });
    setActivePreset(preset.name);
  };

  const deletePreset = (name: string) => {
    setFilterPresets(prev => prev.filter(p => p.name !== name));
    if (activePreset === name) {
      setActivePreset(null);
    }
  };

  const handleTabToggle = (status: PropertyStatus | null) => {
    if (tabs.some((tab: Tab) => tab.status === status)) {
      setTabs(tabs.filter((tab: Tab) => tab.status !== status));
    } else {
      const found = ALL_STATUS_OPTIONS.find(opt => opt.status === status);
      if (found) setTabs([...tabs, found]);
    }
  };

  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newTabs = [...tabs];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
    setTabs(newTabs);
  };

  const handleTabClick = (tab: Tab) => {
    const idx = tabs.findIndex((t: Tab) => t.label === tab.label);
    if (idx !== -1) {
      setActiveTab(idx);
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    if (!sort.field) return 0;

    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.order === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  const handleSaveTabs = () => {
    localStorage.setItem('propertyTabs', JSON.stringify(tabs));
    setShowManageTabs(false);
  };

  const getBadgeVariant = (status: PropertyStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const color = getStatusBadgeColor(status);
    if (color.includes('green')) return 'default';
    if (color.includes('red')) return 'destructive';
    if (color.includes('purple')) return 'secondary';
    if (color.includes('gray')) return 'outline';
    return 'default';
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleTypeChange = (value: PropertyType | 'All') => {
    setFilters(prev => ({
      ...prev,
      type: value
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min.toString(),
      maxPrice: max.toString(),
    }));
  };

  const handleStatusChange = (value: PropertyStatus | 'All') => {
    setFilters(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleLocationChange = (value: string | 'All') => {
    setFilters(prev => ({
      ...prev,
      location: value
    }));
  };

  const handleBedroomsChange = (value: string) => {
    handleFilterChange('bedrooms', value);
  };

  const handleBathroomsChange = (value: string) => {
    handleFilterChange('bathrooms', value);
  };

  const handleAreaChange = (value: string) => {
    handleFilterChange('location', value);
  };

  const handleAmenitiesChange = (value: string[]) => {
    setFilters(prev => ({
      ...prev,
      amenities: value
    }));
  };

  const handleError = (error: Error) => {
    console.error('Error:', error);
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  // Fix string | null assignment
  const safeString = (val: string | null): string => val ?? '';

  // Fix priceRange type mismatch for props expecting [number, number]
  const getPriceRangeArray = (priceRange: { min: number; max: number }): [number, number] => [priceRange.min, priceRange.max];

  // Fix status type mismatch for props expecting string
  const getStatusString = (status: PropertyStatus | 'All'): string => status === 'All' ? '' : status;

  const formatOptions = (arr: (string | number)[] | undefined, fallback: string | number | undefined) => {
    if (!arr || arr.length === 0) return fallback ?? 'N/A';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} - ${arr[1]}`;
    return arr.join(', ');
  };

  // Wrapper for filter UI compatibility
  const handleFilterChangeWrapper = (filtersObj: Partial<Filters>) => {
    Object.entries(filtersObj).forEach(([key, value]) => {
      handleFilterChange(key as keyof Filters, value);
    });
  };

  // Map filters to PropertyFilters expected shape
  const propertyFiltersProps = {
    search,
    type: filters.type,
    status: filters.status,
    priceRange: [Number(filters.minPrice) || 0, Number(filters.maxPrice) || 0],
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
  };

  const renderManageTabsDialog = () => {
    if (!showManageTabs) return null;

    return (
      <DialogRoot open={showManageTabs} onOpenChange={setShowManageTabs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Property View Tabs</DialogTitle>
            <DialogDescription>
              Drag and drop tabs to reorder them. Changes will be saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {tabs.map((tab, index) => (
              <div key={tab.label} className="flex items-center justify-between p-2 border rounded">
                <span>{tab.label}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveTab(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveTab(index, 'down')}
                    disabled={index === tabs.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTabs}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    );
  };

  const renderTabContent = (tab: TabName) => {
    switch (tab) {
      case 'Overview':
        return <PropertyOverview property={selectedProperty} />;
      case 'Details':
        return <PropertyDetails property={selectedProperty} />;
      case 'Media':
        return <PropertyMedia property={selectedProperty} />;
      case 'Location':
        return <PropertyLocation property={selectedProperty} />;
      case 'Pricing':
        return <PropertyPricing property={selectedProperty} />;
      case 'Documents':
        return <PropertyDocuments property={selectedProperty} />;
      case 'History':
        return <PropertyHistory property={selectedProperty} />;
      default:
        return null;
    }
  };

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6 bg-white min-h-screen p-6 sm:p-4 md:p-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black">Properties</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your listings, fast.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search properties..."
              className="w-full sm:w-64 pl-10"
              value={search}
              onChange={handleSearchInput}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="outline"
            className="bg-white text-black border-black hover:bg-gray-100 w-full sm:w-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2 text-black" />
            Filters
          </Button>
          <Button className="bg-black text-white hover:bg-gray-900 w-full sm:w-auto" onClick={() => navigate('/properties/new')}>
              <Plus className="h-4 w-4 mr-2 text-white" />
              Add Property
            </Button>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <PropertyFilters
            filters={propertyFiltersProps}
            onChange={(newFilters) => {
              setSearch(newFilters.search);
              setFilters(prev => ({
                ...prev,
                type: newFilters.type,
                status: newFilters.status,
                minPrice: String(newFilters.priceRange[0] || ''),
                maxPrice: String(newFilters.priceRange[1] || ''),
                bedrooms: newFilters.bedrooms,
                bathrooms: newFilters.bathrooms,
              }));
            }}
          />
        </div>
        <div className="flex flex-row flex-wrap gap-2 sm:gap-4 items-center">
        {tabs.map((tab, idx) => (
            <Button
            key={tab.label}
              variant={activeTab === idx ? 'default' : 'outline'}
              className={`text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 ${activeTab === idx ? 'bg-black text-white' : 'bg-white text-black border-black'}`}
              onClick={() => handleTabChange(idx)}
          >
            {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table/Card View Toggle */}
      <div className="flex justify-end gap-2">
          <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
          onClick={() => setViewMode('table')}
        >
          Table
          </Button>
          <Button
          variant={viewMode === 'card' ? 'default' : 'outline'}
          className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
          onClick={() => setViewMode('card')}
        >
          Cards
          </Button>
        </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-lg border border-black bg-white">
          <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selected.length === properties.length}
                      onCheckedChange={handleSelectAll}
                      className="rounded border-black"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => handleSort({ field: 'name', order: 'asc' })}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sort.field === 'name' && (
                        sort.order === 'asc' ? 
                          <ChevronUp className="h-4 w-4 text-black" /> : 
                          <ChevronDown className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => handleSort({ field: 'type', order: 'asc' })}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sort.field === 'type' && (
                        sort.order === 'asc' ? 
                          <ChevronUp className="h-4 w-4 text-black" /> : 
                          <ChevronDown className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => handleSort({ field: 'price', order: 'asc' })}
                  >
                    <div className="flex items-center gap-1">
                      Price
                      {sort.field === 'price' && (
                        sort.order === 'asc' ? 
                          <ChevronUp className="h-4 w-4 text-black" /> : 
                          <ChevronDown className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => handleSort({ field: 'status', order: 'asc' })}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sort.field === 'status' && (
                        sort.order === 'asc' ? 
                          <ChevronUp className="h-4 w-4 text-black" /> : 
                          <ChevronDown className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-black"
                    onClick={() => handleSort({ field: 'created_at', order: 'asc' })}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sort.field === 'created_at' && (
                        sort.order === 'asc' ? 
                          <ChevronUp className="h-4 w-4 text-black" /> : 
                          <ChevronDown className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProperties.map((property) => (
                  <TableRow key={property.id} className="even:bg-white odd:bg-gray-50 hover:bg-gray-100 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(property.id)}
                        onCheckedChange={() => handleSelect(property.id)}
                        className="rounded border-black"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-black" />
                        {property.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-black">{property.type}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-black" />
                        <div className="space-y-1">
                          <div className="font-semibold text-black">
                            {formatCurrency(property.price)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(property.status || 'Available')} className="border-black text-black bg-white">
                        {property.status || 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-black">
                      {new Date(property.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-black"
                          onClick={() => handleQuickView(property)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user?.is_admin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:text-black"
                            onClick={() => navigate(`/properties/edit/${property.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-black"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {sortedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              refNo={property.id}
              title={property.name}
              price={property.current_price ?? 0}
              type={property.type}
              location={property.address}
              bedrooms={String(formatOptions(property.bedroom_options, property.bedrooms) ?? '')}
              bathrooms={String(formatOptions(property.bathroom_options, property.bathrooms) ?? '')}
              area={String(formatOptions(property.size_options, property.square_footage) ?? '')}
              status={property.status}
              listingDate={new Date(property.created_at).toLocaleDateString()}
              owner={property.owner}
              image={property.images?.[0]}
              onClick={() => navigate(`/properties/${property.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {properties.length} of {totalPages * PAGE_SIZE} properties
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 text-black" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4 text-black" />
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-0">
          <Card className="w-full max-w-lg sm:max-w-2xl border-black bg-white">
            <CardHeader className="border-b border-black">
              <div className="flex justify-between items-center">
                <CardTitle className="text-black text-base sm:text-lg">{showQuickView.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-black"
                  onClick={() => setShowQuickView(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm text-black">Type</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Home className="h-4 w-4 text-black" />
                      <span className="text-black">{showQuickView.type}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black">Status</div>
                    <Badge className="border-black text-black bg-white">
                      {showQuickView.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black">Price</div>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-black" />
                      <span className="text-black">{formatCurrency(showQuickView.price)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black">Location</div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-black" />
                      <span className="text-black">{showQuickView.address}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black">Bedrooms</div>
                    <span className="text-black">{showQuickView.bedrooms ?? 'N/A'}</span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black">Bathrooms</div>
                    <span className="text-black">{showQuickView.bathrooms ?? 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs sm:text-sm text-black">Tags</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {showQuickView.tags?.length ? showQuickView.tags.map(tag => (
                        <Badge key={tag} className="border-black text-black bg-white">{tag}</Badge>
                      )) : <span className="text-gray-600">None</span>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Properties;