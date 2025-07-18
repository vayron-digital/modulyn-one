import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';

interface LeadQuickActionsProps {
  leadId?: string;
}

export default function LeadQuickActions({ leadId }: LeadQuickActionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead status updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Implement message sending logic here
    toast({
      title: 'Info',
      description: 'Message sending feature to be implemented',
    });
  };

  const handleScheduleFollowUp = () => {
    // Implement follow-up scheduling logic here
    toast({
      title: 'Info',
      description: 'Follow-up scheduling feature to be implemented',
    });
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => handleStatusUpdate('Contacted')}
        disabled={loading}
      >
        Mark as Contacted
      </Button>
      <Button
        onClick={() => handleStatusUpdate('Qualified')}
        disabled={loading}
      >
        Mark as Qualified
      </Button>
      <Button
        onClick={handleSendMessage}
        disabled={loading}
      >
        Send Message
      </Button>
      <Button
        onClick={handleScheduleFollowUp}
        disabled={loading}
      >
        Schedule Follow-up
      </Button>
    </div>
  );
} 