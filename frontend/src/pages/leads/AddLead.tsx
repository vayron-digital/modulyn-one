import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, FormGroup } from '../../components/ui';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

interface FormData {
  // Basic Info
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  
  // Property Preferences
  budget: number;
  preferred_location: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  preferred_bathrooms: number;
  preferred_area: string;
  preferred_amenities: string[];
  
  // Lead Details
  source: string;
  status: string;
  assigned_to: string;
  notes: string;
  next_followup_date: string;
}

export default function AddLead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    budget: 0,
    preferred_location: '',
    preferred_property_type: '',
    preferred_bedrooms: 0,
    preferred_bathrooms: 0,
    preferred_area: '',
    preferred_amenities: [],
    source: '',
    status: 'New',
    assigned_to: '',
    notes: '',
    next_followup_date: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...formData
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial activity
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: data.id,
          activity_type: 'Created',
          description: 'Lead was created',
          created_by: user.id
        });

      navigate('/leads');
    } catch (error: any) {
      console.error('Error creating lead:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Lead</h1>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Basic details about the lead.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="First Name">
                        <Input
                          type="text"
                          id="first_name"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Last Name">
                        <Input
                          type="text"
                          id="last_name"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <FormGroup label="Email">
                        <Input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Phone">
                        <Input
                          type="tel"
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Nationality">
                        <Input
                          type="text"
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Property Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The lead's property requirements.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Budget (AED)">
                        <Input
                          type="number"
                          id="budget"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Preferred Location">
                        <Input
                          type="text"
                          id="preferred_location"
                          value={formData.preferred_location}
                          onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Property Type">
                        <Select onValueChange={(value) => setFormData({ ...formData, preferred_property_type: value })} value={formData.preferred_property_type}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Penthouse">Penthouse</SelectItem>
                            <SelectItem value="Plot">Plot</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Bedrooms">
                        <Input
                          type="number"
                          id="preferred_bedrooms"
                          value={formData.preferred_bedrooms}
                          onChange={(e) => setFormData({ ...formData, preferred_bedrooms: Number(e.target.value) })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Bathrooms">
                        <Input
                          type="number"
                          id="preferred_bathrooms"
                          value={formData.preferred_bathrooms}
                          onChange={(e) => setFormData({ ...formData, preferred_bathrooms: Number(e.target.value) })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Area (sq.ft)">
                        <Input
                          type="text"
                          id="preferred_area"
                          value={formData.preferred_area}
                          onChange={(e) => setFormData({ ...formData, preferred_area: e.target.value })}
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Lead Details</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Additional information about the lead.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Source">
                        <Select onValueChange={(value) => setFormData({ ...formData, source: value })} value={formData.source}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Social Media">Social Media</SelectItem>
                            <SelectItem value="Cold Call">Cold Call</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Status">
                        <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Proposal">Proposal</SelectItem>
                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Assign To">
                        <Select onValueChange={(value) => setFormData({ ...formData, assigned_to: value })} value={formData.assigned_to}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Next Follow-up Date">
                        <Input
                          type="datetime-local"
                          id="next_followup_date"
                          value={formData.next_followup_date}
                          onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                        />
                      </FormGroup>
                    </div>

                    <div className="col-span-6">
                      <FormGroup label="Notes">
                        <Textarea
                          id="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => navigate('/leads')}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="ml-3"
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 