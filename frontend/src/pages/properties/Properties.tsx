import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import useDebounce from '../../hooks/useDebounce';
import { PropertyType, RESIDENTIAL_TYPES, COMMERCIAL_TYPES, ALL_PROPERTY_TYPES } from '../../utils/propertyTypes';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import FilterBar from '../../components/ui/FilterBar';
import { formatPropertyTypeDisplay } from '../../utils/propertyTypesByLocation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { AnimatePresence, motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AlertCircle } from 'lucide-react';

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
  
  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    underOffer: 0,
    totalValue: 0
  });

  const debouncedSearch = useDebounce(search, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Filter options
  const filterOptions = [
    {
      key: 'type',
      label: 'Property Type',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Types' },
        { value: 'residential', label: 'Residential' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'villa', label: 'Villa' },
        { value: 'penthouse', label: 'Penthouse' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'office', label: 'Office' },
        { value: 'retail', label: 'Retail' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'land', label: 'Land' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'Available', label: 'Available' },
        { value: 'Under Offer', label: 'Under Offer' },
        { value: 'Sold', label: 'Sold' },
        { value: 'Rented', label: 'Rented' },
        { value: 'Off Market', label: 'Off Market' }
      ]
    },
    {
      key: 'minPrice',
      label: 'Min Price',
      type: 'input' as const,
      placeholder: 'Enter minimum price'
    },
    {
      key: 'maxPrice',
      label: 'Max Price',
      type: 'input' as const,
      placeholder: 'Enter maximum price'
    },
    {
      key: 'location',
      label: 'Location',
      type: 'input' as const,
      placeholder: 'Search by location'
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'title',
      label: 'Property',
      render: (value: string, row: Property) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <Building className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">{row.title}</div>
            <div className="text-sm text-slate-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {row.address}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {formatPropertyTypeDisplay(value)}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value) as any}>
          {value}
        </Badge>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => (
        <div className="font-medium text-slate-900">
          {getCurrencyDisplay(value)}
        </div>
      ),
      align: 'right' as const
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      render: (value: number) => (
        <div className="text-sm text-slate-600">
          {value || '-'}
        </div>
      ),
      align: 'center' as const
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      render: (value: number) => (
        <div className="text-sm text-slate-600">
          {value || '-'}
        </div>
      ),
      align: 'center' as const
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

      // Apply search
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,address.ilike.%${debouncedSearch}%`);
      }

      // Apply filters
      if (debouncedFilters.type) {
        query = query.eq('type', debouncedFilters.type);
      }
      if (debouncedFilters.status) {
        query = query.eq('status', debouncedFilters.status);
      }
      if (debouncedFilters.minPrice) {
        query = query.gte('price', parseFloat(debouncedFilters.minPrice));
      }
      if (debouncedFilters.maxPrice) {
        query = query.lte('price', parseFloat(debouncedFilters.maxPrice));
      }
      if (debouncedFilters.location) {
        query = query.ilike('address', `%${debouncedFilters.location}%`);
      }

      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setProperties(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));

      // Calculate stats
      if (data) {
        const total = data.length;
        const available = data.filter(p => p.status === 'Available').length;
        const sold = data.filter(p => p.status === 'Sold').length;
        const underOffer = data.filter(p => p.status === 'Under Offer').length;
        const totalValue = data.reduce((sum, p) => sum + (p.price || 0), 0);

        setStats({ total, available, sold, underOffer, totalValue });
      }

    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedFilters, sortColumn, sortDirection, currentPage, toast]);

  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortColumn(key);
    setSortDirection(direction);
  };

  // Handle property actions
  const handleViewProperty = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handleEditProperty = (property: Property) => {
    navigate(`/properties/edit/${property.id}`);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property deleted successfully"
      });

      fetchProperties();
      setShowDeleteModal(false);
      setPropertyToDelete(null);

    } catch (err) {
      console.error('Error deleting property:', err);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive"
      });
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', selectedProperties);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedProperties.length} properties deleted successfully`
      });

      setSelectedProperties([]);
      fetchProperties();

    } catch (err) {
      console.error('Error deleting properties:', err);
      toast({
        title: "Error",
        description: "Failed to delete properties",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return <LoadingState />;
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Authentication Error</h3>
          <p className="text-slate-600">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Properties"
        subtitle="Manage your property portfolio"
        icon={<Building className="h-6 w-6 text-blue-600" />}
        stats={[
          {
            label: 'Total Properties',
            value: stats.total,
            change: 12,
            trend: 'up'
          },
          {
            label: 'Available',
            value: stats.available,
            change: 5,
            trend: 'up'
          },
          {
            label: 'Sold',
            value: stats.sold,
            change: -3,
            trend: 'down'
          },
          {
            label: 'Total Value',
            value: getCurrencyDisplay(stats.totalValue),
            change: 8,
            trend: 'up'
          }
        ]}
        actions={[
          {
            label: 'Add Property',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/properties/new'),
            variant: 'default'
          },
          {
            label: 'Import',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Import feature will be available soon" }),
            variant: 'outline'
          },
          {
            label: 'Export',
            icon: <Download className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Export feature will be available soon" }),
            variant: 'outline'
          }
        ]}
        search={{
          placeholder: "Search properties...",
          value: search,
          onChange: setSearch
        }}
        filters={
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            {selectedProperties.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedProperties.length})
              </Button>
            )}
          </div>
        }
      >
        <FilterBar
          filters={filterOptions}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={() => setFilters({
            type: '',
            status: '',
            minPrice: '',
            maxPrice: '',
            location: ''
          })}
          onClearFilter={(key) => handleFilterChange(key, '')}
        />
      </PageHeader>

      {/* Properties Table/Grid */}
      {viewMode === 'table' ? (
        <DataTable
          data={properties}
          columns={columns}
          loading={loading}
          emptyMessage="No properties found"
          onRowClick={handleViewProperty}
          onEdit={handleEditProperty}
          onDelete={handleDeleteProperty}
          selectable={true}
          selectedRows={selectedProperties}
          onSelectionChange={setSelectedProperties}
          sortable={true}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          pagination={{
            currentPage,
            totalPages,
            pageSize: 10,
            totalItems,
            onPageChange: setCurrentPage
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusColor(property.status) as any}>
                          {property.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProperty(property);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProperty(property);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-slate-900 truncate">{property.title}</h3>
                        <p className="text-sm text-slate-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {property.bedrooms || '-'} bed • {property.bathrooms || '-'} bath
                        </span>
                        <span className="font-medium text-slate-900">
                          {getCurrencyDisplay(property.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {formatPropertyTypeDisplay(property.type)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(property.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProperty}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Properties;