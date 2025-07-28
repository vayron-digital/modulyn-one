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
import { PropertyStatusSelect } from '../../components/PropertyStatusSelect';
import { PropertyStatusMultiSelect } from '../../components/PropertyStatusMultiSelect';
import { MultiSelectDropdown } from '../../components/common/MultiSelectDropdown';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { getCurrencyDisplay } from '../../utils/currency';
import { cn } from '../../lib/utils';
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
} from 'lucide-react';
import { PropertyType } from '../../utils/propertyTypes';
import { PropertyStatus } from '../../utils/propertyStatuses';

interface PropertyFormData {
  name: string;
  type: PropertyType;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sizeOptions: number[];
  status: PropertyStatus[];
  owner: string;
  description: string;
  images: string[];
  market_cap?: number;
  token_nav?: number;
  current_price?: number;
  iro_sale_price?: number;
  iro_participants?: number;
  distance?: number;
  tags?: string[];
  full_description: string;
  bedroomOptions: (string | number)[];
  bathroomOptions: number[];
}

const PropertyForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    type: 'Apartment',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    sizeOptions: [],
    status: ['Available'],
    owner: '',
    description: '',
    images: [],
    market_cap: 0,
    token_nav: 0,
    current_price: 0,
    iro_sale_price: 0,
    iro_participants: 0,
    distance: 0,
    tags: [],
    full_description: '',
    bedroomOptions: [],
    bathroomOptions: [],
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
  ];
  const BATHROOM_OPTIONS = [
    { label: '1 Bathroom', value: 1 },
    { label: '2 Bathrooms', value: 2 },
    { label: '3 Bathrooms', value: 3 },
    { label: '4 Bathrooms', value: 4 },
    { label: '5 Bathrooms', value: 5 },
  ];
  const SIZE_OPTIONS = [
    { label: '40 m²', value: 40 },
    { label: '60 m²', value: 60 },
    { label: '80 m²', value: 80 },
    { label: '100 m²', value: 100 },
    { label: '120 m²', value: 120 },
    { label: '150 m²', value: 150 },
    { label: '200 m²', value: 200 },
    { label: '360 m²', value: 360 },
  ];

  // Add to formData
  const [bedroomRange, setBedroomRange] = useState<{min: string | number, max: string | number}>({min: 1, max: 4});
  const [bathroomRange, setBathroomRange] = useState<{min: number, max: number}>({min: 1, max: 4});
  const [sizeRange, setSizeRange] = useState<{min: number, max: number}>({min: 40, max: 360});

  useEffect(() => {
    if (id && id !== 'new') {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    // When switching to range mode, sync range state from formData if possible
    if (bathroomMode === 'range' && formData.bathroomOptions.length === 2) {
      setBathroomRange({ min: formData.bathroomOptions[0], max: formData.bathroomOptions[1] });
    }
    if (bedroomMode === 'range' && formData.bedroomOptions.length === 2) {
      setBedroomRange({ min: formData.bedroomOptions[0], max: formData.bedroomOptions[1] });
    }
    if (sizeMode === 'range' && formData.sizeOptions.length === 2) {
      setSizeRange({ min: formData.sizeOptions[0], max: formData.sizeOptions[1] });
    }
    // When switching to multiple, clear range state
    if (bathroomMode === 'multiple') {
      setBathroomRange({ min: 1, max: 4 });
    }
    if (bedroomMode === 'multiple') {
      setBedroomRange({ min: 1, max: 4 });
    }
    if (sizeMode === 'multiple') {
      setSizeRange({ min: 40, max: 360 });
    }
    // eslint-disable-next-line
  }, [bathroomMode, bedroomMode, sizeMode]);

  // Sync range state from formData when switching to range mode or loading data
  useEffect(() => {
    if (bathroomMode === 'range' && formData.bathroomOptions.length === 2) {
      setBathroomRange({ min: formData.bathroomOptions[0], max: formData.bathroomOptions[1] });
    }
  }, [bathroomMode, formData.bathroomOptions]);

  // Keep formData.bathroomOptions in sync with range state if in range mode
  useEffect(() => {
    if (bathroomMode === 'range') {
      setFormData(prev => ({
        ...prev,
        bathroomOptions: [Number(bathroomRange.min), Number(bathroomRange.max)].filter(v => !isNaN(v)),
      }));
    }
  }, [bathroomRange, bathroomMode]);

  useEffect(() => {
    if (sizeMode === 'range') {
      setFormData(prev => ({
        ...prev,
        sizeOptions: [Number(sizeRange.min), Number(sizeRange.max)].filter(v => !isNaN(v)),
      }));
    }
  }, [sizeRange, sizeMode]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...formData,
          ...data,
          name: data.name || '',
          price: data.current_price ?? 0,
          bedroomOptions: Array.isArray(data.bedroom_options) ? data.bedroom_options : [],
          bathroomOptions: Array.isArray(data.bathroom_options) ? data.bathroom_options.map(val => Number(val)).filter(n => typeof n === 'number' && !isNaN(n)) : [],
          sizeOptions: Array.isArray(data.size_options) ? data.size_options.map(val => Number(val)).filter(n => typeof n === 'number' && !isNaN(n)) : [],
          location: data.location ?? data.distance ?? '',
          status: Array.isArray(data.status)
            ? data.status
            : data.status
              ? [data.status]
              : ['Available'],
          images: data.images ?? [],
          full_description: data.full_description || '',
          market_cap: data.market_cap ?? 0,
          token_nav: data.token_nav ?? 0,
          current_price: data.current_price ?? 0,
          iro_sale_price: data.iro_sale_price ?? 0,
          iro_participants: data.iro_participants ?? 0,
          distance: data.distance ?? 0,
          tags: data.tags ?? [],
        });
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'sizeOptions' 
        ? Number(value) 
        : value
    }));
  };

  const handleTypeChange = (type: PropertyType) => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
          throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`);
        }
        
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image. Please upload image files only.`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error(`Failed to get public URL for ${file.name}`);
        }

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      showToast('Images uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const propertyData = {
        name: formData.name,
        type: formData.type,
        status: Array.isArray(formData.status) ? formData.status[0] : formData.status,
        owner: formData.owner,
        full_description: formData.full_description,
        images: formData.images,
        current_price: Number(formData.price),
        bedroom_options: Array.isArray(formData.bedroomOptions) ? formData.bedroomOptions : [],
        bathroom_options: Array.isArray(formData.bathroomOptions) ? formData.bathroomOptions : [],
        market_cap: Number(formData.market_cap),
        iro_sale_price: Number(formData.iro_sale_price),
        iro_participants: Number(formData.iro_participants),
        distance: formData.location,
        tags: formData.tags,
        size_options: formData.sizeOptions,
        last_updated: new Date().toISOString(),
      };

      if (id && id !== 'new') {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);
        if (error) throw error;
        showToast('Property updated successfully', 'success');
        navigate('/properties');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([{
            ...propertyData,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          }]);
        if (error) throw error;
        showToast('Property created successfully', 'success');
        navigate('/properties');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle>{id ? 'Edit Property' : 'Add New Property'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Property Name" required>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup label="Property Type">
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Map your property type options here */}
                  </SelectContent>
                </Select>
              </FormGroup>
              <FormGroup label="Price">
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
              </FormGroup>
              <FormGroup label="Location">
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
              </FormGroup>
              <FormGroup label="Bedrooms">
                <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup label="Bathrooms">
                <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup label="Status">
                <PropertyStatusMultiSelect value={formData.status} onChange={(statusArr) => setFormData(prev => ({ ...prev, status: statusArr }))} className="w-full" />
              </FormGroup>
              <FormGroup label="Owner">
                <Input id="owner" name="owner" value={formData.owner} onChange={handleInputChange} required />
              </FormGroup>
            </div>
            <FormGroup label="Description">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </FormGroup>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
              >
                {loading || uploading ? 'Saving...' : id ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyForm; 