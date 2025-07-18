import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button, Input, FormGroup } from '@/components/ui';
import { isValidUUID } from '../../lib/utils';

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

export default function EditLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Only use id if it's a valid UUID
  const safeId = id && isValidUUID(id) ? id : null;

  useEffect(() => {
    if (safeId) {
      fetchLeadDetails();
      fetchUsers();
    } else {
      setError('Invalid lead ID');
      setLoading(false);
    }
  }, [safeId]);

  const fetchLeadDetails = async () => {
    if (!safeId) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', safeId)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        next_followup_date: data.next_followup_date ? new Date(data.next_followup_date).toISOString().slice(0, 16) : ''
      });
    } catch (error: any) {
      console.error('Error fetching lead details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
    setError(null);
    if (!safeId) {
      setError('Invalid lead ID');
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('leads')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', safeId);

      if (error) throw error;

      // Create activity for the update
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: safeId,
          activity_type: 'Updated',
          description: 'Lead details were updated',
          created_by: user.id
        });

      navigate(`/leads/${safeId}`);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Lead</h1>
          
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
                        <select
                          id="preferred_property_type"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.preferred_property_type}
                          onChange={(e) => setFormData({ ...formData, preferred_property_type: e.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Plot">Plot</option>
                        </select>
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
                        <select
                          id="source"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Status">
                        <select
                          id="status"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Closed">Closed</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </FormGroup>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormGroup label="Assign To">
                        <select
                          id="assigned_to"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.assigned_to}
                          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.full_name}
                            </option>
                          ))}
                        </select>
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
                        <textarea
                          id="notes"
                          rows={3}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                onClick={() => navigate(`/leads/${id}`)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="ml-3"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 