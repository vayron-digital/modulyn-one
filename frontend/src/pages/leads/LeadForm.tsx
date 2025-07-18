import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { cn, isValidUUID } from '../../lib/utils';
import { Input, Button, FormGroup, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui';

interface LeadFormData {
  full_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
  assigned_to: string;
}

const LEAD_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const LEAD_SOURCES = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Social Media', value: 'social' },
  { label: 'Direct', value: 'direct' },
  { label: 'Other', value: 'other' },
];

export default function LeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    full_name: '',
    email: '',
    phone: '',
    status: 'new',
    source: 'website',
    notes: '',
    assigned_to: '',
  });

  // Only use id if it's a valid UUID
  const safeId = id && isValidUUID(id) ? id : null;

  useEffect(() => {
    if (safeId) {
      fetchLead();
    }
  }, [safeId]);

  const fetchLead = async () => {
    if (!safeId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', safeId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch lead details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (safeId) {
        // Update existing lead
        const { error } = await supabase
          .from('leads')
          .update(formData)
          .eq('id', safeId);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
      } else {
        // Create new lead
        const { error } = await supabase
          .from('leads')
          .insert([{ ...formData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
      }

      navigate('/leads');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            {id ? 'Edit Lead' : 'Add New Lead'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormGroup label="Full Name" required>
                <Input
                  type="text"
                  name="full_name"
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup label="Email" required>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup label="Phone">
                <Input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup label="Status">
                <Select
                  value={formData.status}
                  onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>

              <FormGroup label="Source">
                <Select
                  value={formData.source}
                  onValueChange={value => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>

              <FormGroup label="Notes">
                <Textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </FormGroup>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/leads')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : id ? 'Update Lead' : 'Create Lead'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 