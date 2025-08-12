import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Home,
  Building,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  PieChart,
  LineChart,
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
  Award,
  Briefcase,
  Globe,
  Heart,
  Settings,
  LayoutGrid,
  List,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { useLayout } from '../../components/layout/DashboardLayout';
import { format } from 'date-fns';
import { getCurrencyDisplay } from '../../utils/currency';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  status: 'available' | 'sold' | 'pending' | 'off_market';
  property_type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  developer_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  developer?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

const Properties = () => {
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { setHeader } = useLayout();
  const { toast } = useToast();

  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: '',
    property_type: '',
    developer_id: '',
    price_range: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Set up header
  useEffect(() => {
    setHeader({
      title: 'Property Management',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Properties' }
      ],
      tabs: [
        { label: 'All Properties', href: '/properties', active: true },
        { label: 'Available', href: '/properties/available' },
        { label: 'Sold', href: '/properties/sold' }
      ]
    });
  }, [setHeader]);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    pending: 0,
    totalValue: 0
  });

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      label: 'Property',
      render: (value: string, row: Property) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {row.address}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'developer',
      label: 'Developer',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          {value?.logo_url ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {value.name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Building className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm">{value?.name || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'property_type',
      label: 'Type',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => (
        <div className="text-sm font-medium">
          {getCurrencyDisplay(value)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          available: { label: 'Available', variant: 'default' as const, icon: CheckCircle },
          sold: { label: 'Sold', variant: 'outline' as const, icon: CheckCircle },
          pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
          off_market: { label: 'Off Market', variant: 'destructive' as const, icon: XCircle }
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.available;
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="flex items-center space-x-1">
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
        );
      }
    },
    {
      key: 'bedrooms',
      label: 'Details',
      render: (value: number, row: Property) => (
        <div className="text-sm text-gray-600">
          {row.bedrooms && `${row.bedrooms} bed`}
          {row.bathrooms && ` • ${row.bathrooms} bath`}
          {row.area && ` • ${row.area} sqft`}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Listed',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {format(new Date(value), 'MMM dd, yyyy')}
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
      if (search) {
        query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%`);
      }

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.developer_id) {
        query = query.eq('developer_id', filters.developer_id);
      }
      if (filters.price_range) {
        const [minPrice, maxPrice] = filters.price_range.split('-').map(Number);
        if (!isNaN(minPrice)) query = query.gte('price', minPrice);
        if (!isNaN(maxPrice)) query = query.lte('price', maxPrice);
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
        const available = data.filter(p => p.status === 'available').length;
        const sold = data.filter(p => p.status === 'sold').length;
        const pending = data.filter(p => p.status === 'pending').length;
        const totalValue = data.reduce((sum, p) => sum + (p.price || 0), 0);

        setStats({ total, available, sold, pending, totalValue });
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
  }, [search, filters, sortColumn, sortDirection, currentPage, toast]);

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
    // Placeholder for navigation to property detail page
    toast({
      title: "Coming Soon",
      description: "View property detail page is under development."
    });
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = (property: Property) => {
    // Placeholder for delete functionality
    toast({
      title: "Coming Soon",
      description: "Delete property functionality is under development."
    });
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
    <div className="space-y-6">
      {/* Page Header - Matching Dashboard/Leads pattern */}
      <div className="space-y-2">
        <nav className="text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span>Property Management</span>
        </nav>
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
        <p className="text-gray-600">Manage your property portfolio</p>
      </div>

      {/* Stats Cards - Matching Dashboard pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+12.5%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-blue-100 h-1 mt-2 rounded-full">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.available}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+5.2%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-green-100 h-1 mt-2 rounded-full">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sold</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.sold}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+22.1%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-purple-100 h-1 mt-2 rounded-full">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{getCurrencyDisplay(stats.totalValue)}</div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-green-600 text-sm font-medium">+15.2%</span>
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-full bg-orange-100 h-1 mt-2 rounded-full">
              <div className="bg-orange-500 h-1 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar - Matching Leads pattern */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties, addresses, developers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Property
        </Button>
      </div>

      {/* View Options - Matching Leads pattern */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button variant="outline" size="sm">
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="text-sm text-gray-500">
            • {totalItems} properties Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Content - Matching Leads pattern */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            data={properties}
            columns={columns}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              pageSize: 10,
              onPageChange: setCurrentPage
            }}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            selectable={false}
            sortable={true}
            onSort={handleSort}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showAddModal ? 'Add New Property' : 'Edit Property'}</DialogTitle>
            <DialogDescription>
              {showAddModal ? 'Fill in the details to add a new property.' : 'Update the property details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input id="address" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input id="price" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => setSelectedProperty(prev => prev ? { ...prev, status: value as Property['status'] } : null)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="off_market">Off Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property_type" className="text-right">
                Property Type
              </Label>
              <Select onValueChange={(value) => setSelectedProperty(prev => prev ? { ...prev, property_type: value as Property['property_type'] } : null)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">
                Bedrooms
              </Label>
              <Input id="bedrooms" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">
                Bathrooms
              </Label>
              <Input id="bathrooms" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Area (sqft)
              </Label>
              <Input id="area" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="developer" className="text-right">
                Developer
              </Label>
              <Select onValueChange={(value) => setSelectedProperty(prev => prev ? { ...prev, developer_id: value } : null)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a developer" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={() => {
              // Placeholder for save logic
              toast({
                title: "Coming Soon",
                description: "Save property functionality is under development."
              });
              setShowAddModal(false);
            }}>
              {showAddModal ? 'Add Property' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Properties;