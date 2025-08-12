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
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Property
        </Button>
      </div>

      {/* Properties Table/Grid */}
      <DataTable
        data={properties}
        columns={columns}
        loading={loading}
        emptyMessage="No properties found"
        onRowClick={handleViewProperty}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        selectable={false} // Removed selectable for now
        pagination={{
          currentPage,
          totalPages,
          pageSize: 10,
          totalItems,
          onPageChange: setCurrentPage
        }}
        sortable={true}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />

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