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
  Bed,
  Bath,
  Ruler,
  Star,
  Share2,
  Heart,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Eye,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Award,
  Zap,
  Sparkles,
  Globe,
  Shield,
  Crown,
  Rocket,
  Briefcase,
  Users,
  MessageCircle,
  Settings,
  MoreHorizontal,
  FileText,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { getCurrencyDisplay } from '../../utils/currency';
import { PropertyType } from '../../utils/propertyTypes';
import { PropertyStatus, PROPERTY_STATUSES, getStatusBadgeColor } from '../../utils/propertyStatuses';
import { formatPropertyTypeDisplay } from '../../utils/propertyTypesByLocation';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

interface Property {
  id: string;
  title: string;
  type: 'residential' | 'commercial' | 'land';
  property_type_detailed?: string;
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      setShowDeleteDialog(false);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'sold':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'off_market':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatOptions = (arr: (string | number)[] | undefined, fallback: string | number | undefined) => {
    if (!arr || arr.length === 0) return fallback ?? 'N/A';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} - ${arr[1]}`;
    return arr.join(', ');
  };

  if (loading) return <FullScreenLoader />;

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-20">
        <div className="px-6 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Property not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
          <Button
            variant="outline"
                size="sm"
            onClick={() => navigate('/properties')}
                className="border-white/30 text-white hover:bg-white/10"
          >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
          </Button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Live Property</span>
              </div>
          </div>
            
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Favorites</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Property</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
          <Button
            variant="outline"
                size="sm"
                onClick={() => navigate(`/properties/edit/${id}`)}
                className="border-white/30 text-white hover:bg-white/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
              
          <Button
            variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-white mb-4">{property.title}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-slate-300" />
                  <span className="text-slate-300">
                    {property.location || property.distance || property.address || ''}
                    {property.city && `, ${property.city}`}
                    {property.state && `, ${property.state}`}
                    {property.zip_code && ` ${property.zip_code}`}
                  </span>
                </div>
                <Badge variant={getStatusBadgeVariant(property.status)} className="text-sm">
                  {(property.status || 'unknown').replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-slate-300">Price</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(property.current_price ?? property.price ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm text-slate-300">Type</p>
                      <p className="text-xl font-bold text-white capitalize">{formatPropertyTypeDisplay(property.property_type_detailed || property.type)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-purple-300" />
                    <div>
                      <p className="text-sm text-slate-300">Bedrooms</p>
                      <p className="text-xl font-bold text-white">
                        {formatOptions(property.bedroom_options, property.bedrooms)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Bath className="h-5 w-5 text-yellow-300" />
                    <div>
                      <p className="text-sm text-slate-300">Bathrooms</p>
                      <p className="text-xl font-bold text-white">
                        {formatOptions(property.bathroom_options, property.bathrooms)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Main Image */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                {property.images?.length > 0 ? (
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.name}
                      className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                      <Home className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Image Navigation */}
                  {property.images?.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                  </div>
                )}
              </div>
                
                {/* Thumbnails */}
              {property.images?.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                        alt={`${property.title} ${index + 1}`}
                        className={`h-16 w-20 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                          index === currentImageIndex 
                            ? 'border-white ring-2 ring-white/50' 
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-transparent p-0">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="location" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                      <p className="text-slate-700 leading-relaxed">
                        {property.full_description || property.description || "No description provided."}
                      </p>
                    </div>
                    
                    {property.tags && property.tags.length > 0 && (
                <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Property Specifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Property Type</span>
                          <span className="font-medium capitalize">{formatPropertyTypeDisplay(property.property_type_detailed || property.type)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Bedrooms</span>
                          <span className="font-medium">
                            {formatOptions(property.bedroom_options, property.bedrooms)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Bathrooms</span>
                          <span className="font-medium">
                            {formatOptions(property.bathroom_options, property.bathrooms)}
                          </span>
                        </div>
                        
                        {property.square_footage && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Square Footage</span>
                            <span className="font-medium">{property.square_footage} sq ft</span>
                          </div>
                        )}
                        
                        {property.floor_size && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Floor Size</span>
                            <span className="font-medium">{property.floor_size} sq ft</span>
                </div>
                        )}
          </div>
        </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Financial Information</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Current Price</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(property.current_price ?? property.price ?? 0)}
                          </span>
                        </div>
                        
                        {property.market_cap && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Market Cap</span>
                            <span className="font-medium">{formatCurrency(property.market_cap)}</span>
                          </div>
                        )}
                        
                        {property.token_nav && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">Token NAV</span>
                            <span className="font-medium">{formatCurrency(property.token_nav)}</span>
                          </div>
                        )}
                        
                        {property.iro_sale_price && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-600">IRO Sale Price</span>
                            <span className="font-medium">{formatCurrency(property.iro_sale_price)}</span>
                          </div>
                        )}
                      </div>
            </div>
          </div>
                </TabsContent>
                
                <TabsContent value="location" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Location Details</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-slate-500 mt-1" />
                <div>
                            <p className="font-medium text-slate-900">{property.address}</p>
                            {property.city && <p className="text-slate-600">{property.city}</p>}
                            {property.state && <p className="text-slate-600">{property.state}</p>}
                            {property.zip_code && <p className="text-slate-600">{property.zip_code}</p>}
                          </div>
          </div>
        </div>
      </div>

                    {property.distance && (
              <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Distance Information</h3>
                        <p className="text-slate-700">{property.distance}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="p-6">
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Documents Available</h3>
                      <p className="text-slate-600">Documents will appear here when uploaded.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Agent
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const address = property.address || property.title;
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
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
          </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Property Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Listed</span>
                  <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-medium">{new Date(property.updated_at).toLocaleDateString()}</span>
                </div>
                {property.owner && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Owner</span>
                    <span className="font-medium">{property.owner}</span>
                  </div>
                )}
                {property.iro_participants && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">IRO Participants</span>
                    <span className="font-medium">{property.iro_participants}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Market Trend</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">+5.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Avg. Days on Market</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">45 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && property.images?.length > 0 && (
          <DialogRoot open={showImageModal} onOpenChange={setShowImageModal}>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {property.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setCurrentImageIndex((currentImageIndex + 1) % property.images.length)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </DialogRoot>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <DialogRoot open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{property.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};

export default PropertyDetails;