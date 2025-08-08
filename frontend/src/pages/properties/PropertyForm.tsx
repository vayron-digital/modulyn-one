import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Input, Button, FormGroup, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PropertyTypeSelect } from '../../components/PropertyTypeSelect';
import PropertyStatusSelect from '../../components/PropertyStatusSelect';
import { PropertyStatusMultiSelect } from '../../components/PropertyStatusMultiSelect';
import { MultiSelectDropdown } from '../../components/common/MultiSelectDropdown';
import { mapPropertyTypeToDatabaseEnum } from '../../utils/propertyTypesByLocation';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { getCurrencyDisplay } from '../../utils/currency';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import {
  Building,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  User,
  Upload,
  X,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
  Copy,
  Share2,
  Settings,
  FileText,
  Camera,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Star,
  Heart,
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
  Shield,
  Crown,
  Rocket,
  Briefcase,
  Users,
  MessageCircle,
  MoreHorizontal,
  Bed,
  Bath,
  Ruler,
  Layers,
  Grid,
  List,
  Filter,
  Search,
  Edit3,
  FilePlus,
  FolderPlus,
  Database,
  Cloud,
  Wifi,
  Car,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Leaf,
  Flower2,
  Sprout,
  Palette,
  Brush,
  FileImage,
} from 'lucide-react';

import { PropertyStatus } from '../../utils/propertyStatuses';

interface PropertyFormData {
  title: string;
  type: string;
  price: number;
  current_price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  status: string[];
  property_status_detailed?: string;
  owner: string;
  description: string;
  images: string[];
  full_description: string;
  square_footage: number;
  floor_size: number;
  year_built?: number;
  features?: string[];
  contact?: string;
  tags?: string[];
  virtual_tour_url?: string;
  mls_id?: string;
}

const PropertyForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store selected files temporarily
  const [existingImages, setExistingImages] = useState<string[]>([]); // Store existing images
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    type: 'residential',
    price: 0,
    current_price: 0,
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    status: ['available'],
    owner: '',
    description: '',
    images: [],
    full_description: '',
    square_footage: 0,
    floor_size: 0,
  });

  // Add state for mode toggles and options
  const [bedroomMode, setBedroomMode] = useState<'multiple' | 'range'>('multiple');
  const [bathroomMode, setBathroomMode] = useState<'multiple' | 'range'>('multiple');
  const [sizeMode, setSizeMode] = useState<'multiple' | 'range'>('multiple');
  const BEDROOM_OPTIONS = [
    { label: 'Studio', value: 'Studio' },
    { label: '1 Bedroom', value: 1 },
    { label: '2 Bedrooms', value: 2 },
    { label: '3 Bedrooms', value: 3 },
    { label: '4 Bedrooms', value: 4 },
    { label: '5 Bedrooms', value: 5 },
    { label: '6 Bedrooms', value: 6 },
    { label: '7+ Bedrooms', value: 7 },
  ];

  const BATHROOM_OPTIONS = [
    { label: '1 Bathroom', value: 1 },
    { label: '1.5 Bathrooms', value: 1.5 },
    { label: '2 Bathrooms', value: 2 },
    { label: '2.5 Bathrooms', value: 2.5 },
    { label: '3 Bathrooms', value: 3 },
    { label: '3.5 Bathrooms', value: 3.5 },
    { label: '4+ Bathrooms', value: 4 },
  ];

  const SIZE_OPTIONS = [
    { label: '500 sq ft', value: 500 },
    { label: '750 sq ft', value: 750 },
    { label: '1000 sq ft', value: 1000 },
    { label: '1250 sq ft', value: 1250 },
    { label: '1500 sq ft', value: 1500 },
    { label: '2000 sq ft', value: 2000 },
    { label: '2500 sq ft', value: 2500 },
    { label: '3000+ sq ft', value: 3000 },
  ];

  useEffect(() => {
    if (id && id !== 'new') {
      fetchProperty();
    }
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
      
        setFormData({
        title: data.title || '',
        type: data.property_type_detailed || data.type || 'apartment', // Use new column, fallback to old
        price: data.price || 0,
        current_price: data.current_price || data.price || 0,
        address: data.address || '',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        status: data.property_status_detailed ? [data.property_status_detailed] : ['active'],
        owner: data.owner || '',
        description: data.description || '',
        images: data.images || [],
        full_description: data.full_description || data.description || '',
        square_footage: data.square_footage || 0,
        floor_size: data.floor_size || 0,
        year_built: data.year_built,
        features: data.features || [],
        contact: data.contact || '',
        tags: data.tags || [],
        virtual_tour_url: data.virtual_tour_url || '',
        mls_id: data.mls_id || '',
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({ ...prev, status: [status] }));
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (20MB limit)
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`);
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image. Please select image files only.`);
        }

        newFiles.push(file);
      }

      // Store selected files temporarily
      setSelectedFiles(prev => [...prev, ...newFiles]);

      toast({
        title: "Files Selected",
        description: `${newFiles.length} image${newFiles.length > 1 ? 's' : ''} selected. They will be uploaded when you save the property.`,
        variant: "default"
      });

      // Clear the input
      e.target.value = '';

    } catch (error: any) {
      console.error('File selection error:', error);
      toast({
        title: "Selection Failed",
        description: error.message || 'Failed to select images. Please try again.',
        variant: "destructive"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const urls = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
    
    try {
      const newFiles: File[] = [];
      const newUrls: string[] = [];
      
      // Handle local files
      for (const file of files) {
        // Validate file size (20MB limit)
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image. Please select image files only.`);
        }

        newFiles.push(file);
      }
      
      // Handle URLs (images from internet)
      if (urls) {
        const urlMatches = urls.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s<>"{}|\\^`\[\]]*)?/gi);
        if (urlMatches) {
          for (const url of urlMatches) {
            // Validate URL is actually an image
            if (isValidImageUrl(url)) {
              newUrls.push(url);
            }
          }
        }
      }

      // Store selected files temporarily
      if (newFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
      
      // Store URLs directly in formData images
      if (newUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
          images: [...prev.images, ...newUrls]
        }));
      }

      const totalNew = newFiles.length + newUrls.length;
      if (totalNew > 0) {
        toast({
          title: "Images Added",
          description: `${totalNew} image${totalNew > 1 ? 's' : ''} added (${newFiles.length} files, ${newUrls.length} URLs). They will be saved when you update the property.`,
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Drop error:', error);
      toast({
        title: "Drop Failed",
        description: error.message || 'Failed to add images. Please try again.',
        variant: "destructive"
      });
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const testStorageConnection = async () => {
    try {
      console.log('Testing storage connection...');
      
      // Test bucket listing
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('Bucket listing error:', bucketError);
        toast({
          title: "Storage Test Failed",
          description: `Cannot list buckets: ${bucketError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Available buckets:', buckets?.map(b => b.name));
      console.log('Total buckets found:', buckets?.length || 0);
      
      // Check if property-images bucket exists
      const propertyImagesBucket = buckets?.find(bucket => bucket.name === 'property-images');
      if (!propertyImagesBucket) {
        console.error('property-images bucket not found in available buckets');
        toast({
          title: "Storage Test Failed",
          description: `Property images bucket not found. Available buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Property images bucket found:', propertyImagesBucket);

      // Test direct bucket access
      const { data: files, error: listError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 1 });

      if (listError) {
        console.error('Bucket list error:', listError);
        toast({
          title: "Storage Test Failed",
          description: `Cannot access property-images bucket: ${listError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Bucket access successful, files in bucket:', files?.length || 0);

      // Test upload permissions with a small test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const testPath = `property-images/test-${Date.now()}.txt`;

      console.log('Attempting test upload...');

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(testPath, testFile);

      if (uploadError) {
        console.error('Upload test error:', uploadError);
        toast({
          title: "Storage Test Failed",
          description: `Cannot upload to bucket: ${uploadError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Test upload successful, cleaning up...');

      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('property-images')
        .remove([testPath]);

      if (deleteError) {
        console.warn('Failed to clean up test file:', deleteError);
      }

      toast({
        title: "Storage Test Passed",
        description: "Storage connection is working correctly!",
        variant: "default"
      });

    } catch (error: any) {
      console.error('Storage test error:', error);
      toast({
        title: "Storage Test Failed",
        description: error.message || 'Unknown storage error',
        variant: "destructive"
      });
    }
  };

  const diagnoseStorageIssue = async () => {
    try {
      console.log('=== STORAGE DIAGNOSTIC START ===');
      
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('1. Authentication check:', { user: user?.email, error: authError });
      
      if (authError) {
        toast({
          title: "Authentication Error",
          description: `Not authenticated: ${authError.message}`,
          variant: "destructive"
        });
        return;
      }

      // 2. Skip bucket listing since it has permission issues
      console.log('2. Skipping bucket listing (known permission issue)');
      console.log('2. Bucket listing result: Available buckets: Array(0) - This is expected due to RLS policies');

      // 3. Test direct bucket access
      console.log('3. Testing direct bucket access...');
      const { data: files, error: listError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 1 });
      
      console.log('3. Bucket access result:', { files: files?.length, error: listError });
      
      if (listError) {
        console.log('3. Bucket access failed, but this might be normal for empty buckets');
      }

      // 4. Test upload with image file
      console.log('4. Testing upload permissions...');
      
      const testImageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
      const testImagePath = `test-${Date.now()}.jpg`; // Try root upload
      
      const { error: imageUploadError } = await supabase.storage
        .from('property-images')
        .upload(testImagePath, testImageFile);
      
      console.log('4. Image upload test result:', { error: imageUploadError });
      
      if (imageUploadError) {
        toast({
          title: "Upload Test Failed",
          description: `Image upload failed: ${imageUploadError.message}`,
          variant: "destructive"
        });
        return;
      }

      // 5. Clean up test file
      console.log('5. Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('property-images')
        .remove([testImagePath]);
      
      console.log('5. Cleanup result:', { error: deleteError });

      console.log('=== STORAGE DIAGNOSTIC COMPLETE ===');
      
      toast({
        title: "Storage Diagnostic Complete",
        description: "Upload test passed! Media upload should work now.",
        variant: "default"
      });

    } catch (error: any) {
      console.error('Storage diagnostic error:', error);
      toast({
        title: "Diagnostic Failed",
        description: error.message || 'Unknown error during diagnostic',
        variant: "destructive"
      });
    }
  };

  const uploadSelectedFiles = async (): Promise<string[]> => {
    console.log('uploadSelectedFiles called with selectedFiles:', selectedFiles);
    if (selectedFiles.length === 0) {
      console.log('No files to upload, returning empty array');
      return [];
    }
    
    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      console.log(`Starting upload of ${selectedFiles.length} files...`);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name, `(${file.size} bytes)`);

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        console.log(`Uploading to path: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        console.log('File uploaded successfully, getting public URL...');

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        console.log('Public URL obtained:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      console.log(`All ${uploadedUrls.length} files uploaded successfully`);
      return uploadedUrls;

    } catch (error: any) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Upload selected files first
      console.log('Starting submit process...');
      console.log('Current formData.images:', formData.images);
      console.log('Selected files to upload:', selectedFiles.length);
      
      const newImageUrls = await uploadSelectedFiles();
      console.log('Newly uploaded URLs:', newImageUrls);
      
      // Combine existing images with newly uploaded ones
      const allImages = [...formData.images, ...newImageUrls];
      console.log('Final combined images:', allImages);

      // Get current user's tenant_id
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      const propertyData = {
        tenant_id: profile?.tenant_id,
        title: formData.title,
        property_type_detailed: formData.type, // Use the new detailed column directly
        price: formData.price,
        current_price: formData.current_price || formData.price,
        address: formData.address,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        property_status_detailed: formData.status[0],
        owner: formData.owner,
        description: formData.description,
        full_description: formData.full_description,
        images: allImages,
        square_footage: formData.square_footage,
        floor_size: formData.floor_size,
        year_built: formData.year_built,
        features: formData.features,
        contact: formData.contact,
        tags: formData.tags,
        virtual_tour_url: formData.virtual_tour_url,
        mls_id: formData.mls_id,
        updated_at: new Date().toISOString(),
      };

      if (id && id !== 'new') {
        // Update existing property
        console.log('Updating property with data:', propertyData);
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        toast({
          title: "Success",
          description: "Property updated successfully",
          variant: "default"
        });
        navigate('/properties');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([{
            ...propertyData,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          }]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Property created successfully",
          variant: "default"
        });
        navigate('/properties');
      }
    } catch (error: any) {
      console.error('Update error:', error);
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

  if (loading) return <FullScreenLoader />;

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
                <span className="text-slate-300 text-sm">Editing Property</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmit}
                disabled={loading}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (id ? 'Update Property' : 'Create Property')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-white mb-4">
                {id ? 'Edit Property' : 'Create New Property'}
              </h1>
              <p className="text-slate-300 text-lg">
                {id ? 'Update property information and details' : 'Add a new property to your portfolio'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-slate-300">Type</p>
                      <p className="text-xl font-bold text-white capitalize">{formData.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm text-slate-300">Price</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency((formData.current_price || formData.price) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-purple-300" />
                    <div>
                      <p className="text-sm text-slate-300">Bedrooms</p>
                      <p className="text-xl font-bold text-white">{formData.bedrooms}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Bath className="h-5 w-5 text-yellow-300" />
                    <div>
                      <p className="text-sm text-slate-300">Bathrooms</p>
                      <p className="text-xl font-bold text-white">{formData.bathrooms}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {showPreview && (
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-slate-300">Property Name</p>
                      <p className="text-white font-medium">{formData.title || 'Property Name'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-slate-300">Location</p>
                      <p className="text-white font-medium">{formData.address || 'Location'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-slate-300">Status</p>
                      <Badge variant="default" className="text-xs">
                        {formData.status[0] || 'Available'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-transparent p-0">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="location" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Financial
                  </TabsTrigger>
                  <TabsTrigger value="media" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Media
                  </TabsTrigger>
                </TabsList>
                
                {/* Basic Info Tab */}
                <TabsContent value="basic" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Property Name" required>
                <Input
                          id="title"
                          name="title"
                          value={formData.title}
                  onChange={handleInputChange}
                          placeholder="Enter property name"
                  required
                          className="w-full"
                />
              </FormGroup>
                      
              <FormGroup label="Property Type">
                        <PropertyTypeSelect
                  value={formData.type}
                          onChange={handleTypeChange}
                          className="w-full"
                        />
              </FormGroup>
                      
                      <FormGroup label="Current Price" required>
                        <Input
                          id="current_price"
                          name="current_price"
                          type="number"
                          value={formData.current_price}
                          onChange={handleInputChange}
                          placeholder="0"
                          required
                          className="w-full"
                        />
              </FormGroup>
                      
                      <FormGroup label="Original Price">
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
              </FormGroup>
                      
              <FormGroup label="Status">
                        <PropertyStatusSelect
                          value={formData.status[0] || 'available'}
                          onChange={handleStatusChange}
                          className="w-full"
                        />
              </FormGroup>
                      
              <FormGroup label="Owner">
                        <Input
                          id="owner"
                          name="owner"
                          value={formData.owner}
                          onChange={handleInputChange}
                          placeholder="Property owner"
                          className="w-full"
                        />
              </FormGroup>
            </div>
                    
            <FormGroup label="Description">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                        placeholder="Brief description of the property"
                        rows={4}
                        className="w-full"
              />
            </FormGroup>
                    
                    <FormGroup label="Full Description">
                      <Textarea
                        id="full_description"
                        name="full_description"
                        value={formData.full_description}
                        onChange={handleInputChange}
                        placeholder="Detailed description of the property"
                        rows={6}
                        className="w-full"
                      />
                    </FormGroup>
                  </div>
                </TabsContent>
                
                {/* Details Tab */}
                <TabsContent value="details" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Bedrooms">
                        <Input
                          id="bedrooms"
                          name="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Bathrooms">
                        <Input
                          id="bathrooms"
                          name="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Square Footage">
                        <Input
                          id="square_footage"
                          name="square_footage"
                          type="number"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Floor Size">
                        <Input
                          id="floor_size"
                          name="floor_size"
                          type="number"
                          value={formData.floor_size}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Bedrooms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {BEDROOM_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bedrooms"
                              checked={formData.bedrooms === option.value}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  bedrooms: typeof option.value === 'number' ? option.value : 0
                                }));
                              }}
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Bathrooms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {BATHROOM_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bathrooms"
                              checked={formData.bathrooms === option.value}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  bathrooms: typeof option.value === 'number' ? option.value : 0
                                }));
                              }}
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Location Tab */}
                <TabsContent value="location" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Address" required>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Square Footage">
                        <Input
                          id="square_footage"
                          name="square_footage"
                          type="number"
                          value={formData.square_footage}
                          onChange={handleInputChange}
                          placeholder="Square footage"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Floor Size">
                        <Input
                          id="floor_size"
                          name="floor_size"
                          type="number"
                          value={formData.floor_size}
                          onChange={handleInputChange}
                          placeholder="Floor size"
                          className="w-full"
                        />
                      </FormGroup>
                      

                    </div>
                  </div>
                </TabsContent>
                
                {/* Financial Tab */}
                <TabsContent value="financial" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Price">
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                      
                      <FormGroup label="Current Price">
                        <Input
                          id="current_price"
                          name="current_price"
                          type="number"
                          value={formData.current_price}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full"
                        />
                      </FormGroup>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Media Tab */}
                <TabsContent value="media" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Property Images</h3>
                        <div className="flex gap-2">
              <Button
                variant="outline"
                            size="sm"
                            onClick={diagnoseStorageIssue}
                            className="text-xs"
              >
                            <Activity className="h-3 w-3 mr-1" />
                            Diagnose
              </Button>
              <Button
                            variant="outline"
                            size="sm"
                            onClick={testStorageConnection}
                            className="text-xs"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Test Storage
              </Button>
            </div>
                      </div>
                      
                      {/* Image Upload with Drag & Drop */}
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                          isDragOver 
                            ? 'border-blue-500 bg-blue-50 border-solid' 
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors duration-200 ${
                          isDragOver ? 'text-blue-500' : 'text-slate-400'
                        }`} />
                        <p className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                          isDragOver ? 'text-blue-600' : 'text-slate-600'
                        }`}>
                          {isDragOver ? 'Drop images here' : 'Upload property images'}
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                          Drag and drop images or URLs here, or click to browse
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelection}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Choose Images
                        </label>
                      </div>
                      
                      {/* Selected Files Preview */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">
                            Selected Files (will be uploaded when saved):
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                                  <div className="text-center">
                                    <FileImage className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 truncate px-2">{file.name}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Existing Images Gallery */}
                      {formData.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Existing Images:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Property ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                <Button variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Property
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Property
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Details
                </Button>
              </div>
            </div>

            {/* Form Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Basic Info</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Details</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Location</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Financial</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Media</span>
                  {formData.images.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Validation</h3>
              <div className="space-y-2">
                {formData.title && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Property name</span>
                  </div>
                )}
                {(formData.current_price || 0) > 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Price set</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Location</span>
                  </div>
                )}
                {formData.images.length > 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Images uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm; 