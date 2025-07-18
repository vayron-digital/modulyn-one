import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useFormValidation } from '../../hooks/useFormValidation';
import FormError from '../../components/common/FormError';
import FormField from '../../components/common/FormField';
import FormSection from '../../components/common/FormSection';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface PropertyRequirements {
  type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  min_bathrooms: number | null;
  preferred_locations: string[];
  amenities: string[];
}

interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

const validationRules = {
  name: {
    required: true,
    message: 'Name is required'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/,
    message: 'Invalid phone number format'
  },
  budget: {
    custom: (value: string) => !value || !isNaN(Number(value)),
    message: 'Budget must be a valid number'
  }
};

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' }
];

const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' }
];

const propertyTypeOptions = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' }
];

const leadSourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'other', label: 'Other' }
];

function NewLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    lead_source: '',
    budget: '',
    preferred_contact_method: 'email',
    assigned_agent_id: '',
    next_follow_up_date: '',
    lead_score: 0,
    tags: '',
    property_requirements: {
      type: '',
      min_price: '',
      max_price: '',
      min_bedrooms: '',
      min_bathrooms: '',
      preferred_locations: '',
      amenities: ''
    }
  });

  const { errors, validate, clearErrors } = useFormValidation(validationRules);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
    fetchAgents();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          assigned_agent_id: user.id
        }));
      }
    } catch (error: any) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('role', 'agent');

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error fetching agents:', error);
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('property_requirements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        property_requirements: {
          ...prev.property_requirements,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const formattedData = {
        ...formData,
        assigned_agent_id: formData.assigned_agent_id || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        lead_score: parseInt(formData.lead_score.toString()),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        property_requirements: {
          type: formData.property_requirements.type || null,
          min_price: formData.property_requirements.min_price ? parseFloat(formData.property_requirements.min_price) : null,
          max_price: formData.property_requirements.max_price ? parseFloat(formData.property_requirements.max_price) : null,
          min_bedrooms: formData.property_requirements.min_bedrooms ? parseInt(formData.property_requirements.min_bedrooms) : null,
          min_bathrooms: formData.property_requirements.min_bathrooms ? parseInt(formData.property_requirements.min_bathrooms) : null,
          preferred_locations: formData.property_requirements.preferred_locations ? 
            formData.property_requirements.preferred_locations.split(',').map(loc => loc.trim()) : [],
          amenities: formData.property_requirements.amenities ? 
            formData.property_requirements.amenities.split(',').map(amenity => amenity.trim()) : []
        }
      };

      const { error: insertError } = await supabase
        .from('leads')
        .insert([{
          user_id: user.id,
          ...formattedData
        }]);

      if (insertError) throw insertError;

      await supabase
        .from('activities')
        .insert([
          {
            user_id: user.id,
            lead_id: null,
            activity_type: 'lead_created',
            description: `New lead added: ${formData.name}`
          }
        ]);

      navigate('/leads');
    } catch (error: any) {
      console.error('Error creating lead:', error);
      validate({ ...formData, submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle>New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" value={formData.company} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Select value={formData.preferred_contact_method} onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/leads')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewLead; 