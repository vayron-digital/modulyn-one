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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
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
      tabs: []
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
      header: 'Property',
      render: (item: Property) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {item.address}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'developer',
      header: 'Developer',
      render: (item: Property) => (
        <div className="flex items-center space-x-2">
          {item.developer?.logo_url ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {item.developer.name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Building className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm">{item.developer?.name || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'property_type',
      header: 'Type',
      render: (item: Property) => (
        <Badge variant="outline" className="capitalize">
          {item.property_type.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: Property) => (
        <div className="text-sm font-medium">
          {getCurrencyDisplay(item.price)}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Property) => {
        const statusConfig = {
          available: { label: 'Available', variant: 'default' as const, icon: CheckCircle },
          sold: { label: 'Sold', variant: 'outline' as const, icon: CheckCircle },
          pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
          off_market: { label: 'Off Market', variant: 'destructive' as const, icon: XCircle }
        };
        const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.available;
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
      header: 'Details',
      render: (item: Property) => (
        <div className="text-sm text-gray-600">
          {item.bedrooms && `${item.bedrooms} bed`}
          {item.bathrooms && ` • ${item.bathrooms} bath`}
          {item.area && ` • ${item.area} sqft`}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Listed',
      render: (item: Property) => (
        <div className="text-sm text-gray-600">
          {format(new Date(item.created_at), 'MMM dd, yyyy')}
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
          <p className="text-slate-600">{authError.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* TOP SECTION: Premium Header with Glass Morphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl"></div>
          <div className="relative px-8 py-12">
            {/* Header with Enhanced Controls */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-8">
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                    Property Portfolio
                  </h1>
                  <p className="text-lg text-slate-600 font-medium">
                    Manage your real estate assets with precision
                  </p>
                </div>
              </div>
                      
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                 <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search properties, addresses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 w-80 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:bg-white/90 transition-all duration-200 shadow-lg"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => {}}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:scale-105 transition-all duration-200 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Property
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new property to your portfolio</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
                      
            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Properties */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Properties</p>
                  </div>
                </div>
              </div>

             {/* Available Properties */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+5.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.available}</p>
                    <p className="text-sm text-slate-600 font-medium">Available</p>
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+22.1%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{getCurrencyDisplay(stats.totalValue)}</p>
                    <p className="text-sm text-slate-600 font-medium">Portfolio Value</p>
                  </div>
                </div>
              </div>

             {/* Sold Properties */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Check className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+8%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stats.sold}</p>
                    <p className="text-sm text-slate-600 font-medium">Sold</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content with Enhanced Layout */}
      <div className="p-6">
       <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={properties.map(prop => ({ ...prop, _rowKey: prop.id }))}
                  loading={loading}
                  onSort={handleSort}
                  sortKey={sortColumn}
                  sortDirection={sortDirection}
                  onRowClick={(item) => handleViewProperty(item as Property)}
                  selectable={true}
                />
              </div>
            </CardContent>
          </Card>
           {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} properties
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

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
    </TooltipProvider>
  );
};

export default Properties;