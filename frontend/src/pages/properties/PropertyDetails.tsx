import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Building,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { getCurrencyDisplay } from '../../utils/currency';
import { PropertyType } from '../../utils/propertyTypes';
import { PropertyStatus, PROPERTY_STATUSES, getStatusBadgeColor } from '../../utils/propertyStatuses';

interface Property {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'land';
  price: number;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  status: 'available' | 'pending' | 'sold' | 'off_market';
  created_at: string;
  updated_at: string;
  owner: string;
  description: string;
  images: string[];
  market_cap?: number;
  token_nav?: number;
  current_price?: number;
  floor_size?: number;
  iro_sale_price?: number;
  iro_participants?: number;
  distance?: number;
  tags?: string[];
  full_description?: string;
  location?: string;
  size_options?: number[];
  bedroom_options?: number[];
  bathroom_options?: number[];
}

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (!id || id === 'add') return;
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
      console.log('Loaded property:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Property deleted successfully",
        variant: "default"
      });
      navigate('/properties');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      under_contract: 'bg-yellow-100 text-yellow-800',
      off_market: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <FullScreenLoader />;

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Property not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
              onClick={() => navigate(`/properties/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="w-full flex flex-col items-center">
            <div className="relative flex flex-row justify-center items-center w-full max-h-[500px] h-[400px]">
              {/* Main Image */}
              <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-xl shadow aspect-[16/9] overflow-hidden h-full min-w-0">
                {property.images?.length > 0 ? (
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.name}
                    className="w-full h-full object-cover cursor-pointer rounded-xl max-w-full"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              {/* Vertical Thumbnails */}
              {property.images?.length > 1 && (
                <div className="ml-2 flex flex-col gap-2 h-full overflow-y-auto items-center justify-center w-24">
                  {property.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.name} ${index + 1}`}
                      className={`h-14 w-20 object-cover rounded border-2 ${
                        index === currentImageIndex ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-transparent'
                      } cursor-pointer transition-all`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    {property.type}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {formatCurrency(property.current_price ?? property.price ?? 0)}
          </div>
        </div>
          <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {property.location || property.distance || property.address || ''}
                    {property.city && `, ${property.city}`}
                    {property.state && `, ${property.state}`}
                    {property.zip_code && ` ${property.zip_code}`}
            </div>
          </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(property.status)}`}>
                      {(property.status || 'unknown').replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Description</div>
                <p className="text-gray-700 whitespace-pre-wrap">{property.full_description || "No description provided."}</p>
          </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                  <div className="mt-1">
                    {Array.isArray(property.bedroom_options) && property.bedroom_options.length > 0
                      ? (property.bedroom_options.length === 2
                        ? `${property.bedroom_options[0]} - ${property.bedroom_options[1]}`
                        : property.bedroom_options.join(', '))
                      : (property.bedrooms !== undefined && property.bedrooms !== null ? property.bedrooms : '—')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                  <div className="mt-1">
                    {Array.isArray(property.bathroom_options) && property.bathroom_options.length > 0
                      ? (property.bathroom_options.length === 2
                        ? `${property.bathroom_options[0]} - ${property.bathroom_options[1]}`
                        : property.bathroom_options.join(', '))
                      : (property.bathrooms !== undefined && property.bathrooms !== null ? property.bathrooms : '—')}
                  </div>
                </div>
                {(Array.isArray(property.size_options) && property.size_options.length > 0) && (
                  <div>
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="mt-1">
                      {property.size_options.length === 2
                        ? `${property.size_options[0]} - ${property.size_options[1]} m²`
                        : property.size_options.map((size: number) => `${size} m²`).join(', ')
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;