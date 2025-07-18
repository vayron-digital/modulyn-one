import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, FormGroup } from '../../components/ui';
import { useToast } from '../../components/ui/use-toast';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { UserGroupIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface DumpedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  dumped_by: string;
  dumped_at: string;
  notes: string;
}

export default function DumpedLeads() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<DumpedLead[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDumpedLeads();
  }, []);

  const fetchDumpedLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dumped_leads')
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .order('dumped_at', { ascending: false });

      if (error) throw error;

      const transformedLeads = data.map(lead => ({
        ...lead,
        dumped_by: lead.profiles?.full_name || 'Unknown'
      }));

      setLeads(transformedLeads);
    } catch (error: any) {
      console.error('Error fetching dumped leads:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (leadId: string) => {
    try {
      // Get the lead data
      const { data: lead, error: fetchError } = await supabase
        .from('dumped_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (fetchError) throw fetchError;

      // Insert into active leads
      const { error: insertError } = await supabase
        .from('leads')
        .insert([{
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: 'New',
          source: lead.source,
          notes: lead.notes
        }]);

      if (insertError) throw insertError;

      // Delete from dumped leads
      const { error: deleteError } = await supabase
        .from('dumped_leads')
        .delete()
        .eq('id', leadId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Success',
        description: 'Lead restored successfully',
      });

      fetchDumpedLeads();
    } catch (error: any) {
      console.error('Error restoring lead:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('dumped_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead deleted permanently',
      });

      fetchDumpedLeads();
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dumped Leads</h1>
        <Button
          variant="outline"
          onClick={fetchDumpedLeads}
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <FormGroup label="Search leads...">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FormGroup>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  {lead.name}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(lead.id)}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(lead.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{lead.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p>{lead.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dumped By</p>
                  <p>{lead.dumped_by}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dumped At</p>
                  <p>{new Date(lead.dumped_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p>{lead.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No dumped leads found
        </div>
      )}
    </div>
  );
} 