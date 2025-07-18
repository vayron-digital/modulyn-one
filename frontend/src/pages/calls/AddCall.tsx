import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { isValidUUID } from '../../lib/utils';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export default function AddCall() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lead_id: '',
    call_type: 'cold',
    call_date: new Date().toISOString().slice(0, 16),
    duration: 0,
    notes: '',
    outcome: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, phone, email')
        .order('first_name');

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      setError('Failed to fetch leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.lead_id) newErrors.lead_id = 'Lead is required';
    if (!formData.call_type) newErrors.call_type = 'Call type is required';
    if (!formData.call_date) newErrors.call_date = 'Date & Time is required';
    if (!formData.outcome) newErrors.outcome = 'Outcome is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!isValidUUID(formData.lead_id)) {
        setError('Invalid lead selected.');
        setSubmitting(false);
        return;
      }

      // Insert the call
      const { error } = await supabase
        .from('calls')
        .insert([{
          ...formData,
          created_by: user.id,
          duration: parseInt(formData.duration.toString())
        }]);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => navigate('/calls'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create call. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Add New Call</CardTitle>
        </CardHeader>
        <CardContent>
          {showSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10 animate-fade-in">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mb-2 animate-bounce-in" />
              <div className="text-lg font-bold text-green-600">Call Added!</div>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead_id">Lead</Label>
                <select
                  id="lead_id"
                  name="lead_id"
                  value={formData.lead_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a lead</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} - {lead.phone}
                    </option>
                  ))}
                </select>
                {errors.lead_id && <div className="text-red-500 text-xs mt-1">{errors.lead_id}</div>}
              </div>
              <div>
                <Label htmlFor="call_type">Call Type</Label>
                <div className="mt-1 flex gap-2">
                  {[{type:'cold',label:'Cold',icon:<PhoneIcon className='w-4 h-4'/>},{type:'followup',label:'Follow-up',icon:<PhoneIcon className='w-4 h-4'/>},{type:'inquiry',label:'Inquiry',icon:<PhoneIcon className='w-4 h-4'/>},{type:'appointment',label:'Appointment',icon:<PhoneIcon className='w-4 h-4'/>}].map(opt=>(
                    <button
                      key={opt.type}
                      type="button"
                      className={`flex items-center gap-1 px-3 py-1 rounded-full border ${formData.call_type===opt.type?'bg-blue-100 border-blue-400 text-blue-700':'bg-gray-50 border-gray-200 text-gray-500'}`}
                      onClick={()=>setFormData(f=>({...f,call_type:opt.type}))}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
                {errors.call_type && <div className="text-red-500 text-xs mt-1">{errors.call_type}</div>}
              </div>
              <div>
                <Label htmlFor="call_date">Date & Time</Label>
                <Input
                  type="datetime-local"
                  id="call_date"
                  name="call_date"
                  value={formData.call_date}
                  onChange={handleChange}
                  required
                />
                {errors.call_date && <div className="text-red-500 text-xs mt-1">{errors.call_date}</div>}
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  min="0"
                  max="120"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="outcome">Outcome</Label>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {['Success','No Answer','Voicemail','Busy','Reschedule'].map(opt=>(
                    <button
                      key={opt}
                      type="button"
                      className={`px-3 py-1 rounded-full border ${formData.outcome===opt?'bg-green-100 border-green-400 text-green-700':'bg-gray-50 border-gray-200 text-gray-500'}`}
                      onClick={()=>setFormData(f=>({...f,outcome:opt}))}
                    >
                      {opt}
                    </button>
                  ))}
                  <Input
                    type="text"
                    id="outcome"
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleChange}
                    placeholder="Custom outcome..."
                  />
                </div>
                {errors.outcome && <div className="text-red-500 text-xs mt-1">{errors.outcome}</div>}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed notes about the call..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/calls')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.lead_id || !formData.call_type || !formData.call_date || !formData.outcome}
                className="bg-blue-600 text-white"
              >
                {submitting ? 'Saving...' : 'Save Call'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 