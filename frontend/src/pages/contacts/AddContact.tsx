import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Tag, 
  Plus, 
  X,
  ArrowLeft,
  Save,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe
} from 'lucide-react';

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'partner';
  tags: string[];
  notes?: string;
  social_media: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  custom_fields: Record<string, any>;
}

const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });

  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    status: 'prospect',
    tags: [],
    notes: '',
    social_media: {},
    custom_fields: {}
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCustomField = () => {
    if (newCustomField.key.trim() && newCustomField.value.trim()) {
      setFormData(prev => ({
        ...prev,
        custom_fields: {
          ...prev.custom_fields,
          [newCustomField.key.trim()]: newCustomField.value.trim()
        }
      }));
      setNewCustomField({ key: '', value: '' });
    }
  };

  const removeCustomField = (key: string) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.custom_fields };
      delete newCustomFields[key];
      return {
        ...prev,
        custom_fields: newCustomFields
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (First Name, Last Name, Email)",
          variant: "destructive"
        });
        return;
      }

      // Mock API call - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Contact added successfully!",
      });

      navigate('/contacts');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Contact</h1>
            <p className="text-gray-600 mt-1">Create a new contact in your CRM</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags & Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="linkedin"
                    value={formData.social_media.linkedin || ''}
                    onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    placeholder="LinkedIn profile URL"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="twitter"
                    value={formData.social_media.twitter || ''}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    placeholder="Twitter handle"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="website"
                    value={formData.social_media.website || ''}
                    onChange={(e) => handleSocialMediaChange('website', e.target.value)}
                    placeholder="Website URL"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.custom_fields).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Input value={key} readOnly className="flex-1" />
                <Input value={value} readOnly className="flex-1" />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeCustomField(key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="Field name"
                value={newCustomField.key}
                onChange={(e) => setNewCustomField(prev => ({ ...prev, key: e.target.value }))}
                className="flex-1"
              />
              <Input
                placeholder="Field value"
                value={newCustomField.value}
                onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addCustomField}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes about this contact..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/contacts')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddContact;
