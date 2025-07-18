import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isValidUUID } from '../lib/utils';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  budget: number;
  preferred_location: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  preferred_bathrooms: number;
  preferred_area: string;
  source: string;
  status: string;
  assigned_to: string | null;
  assigned_user?: {
    full_name: string;
  };
  notes: string;
  next_followup_date: string;
  created_at: string;
  created_by: string;
  company_id?: string;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  created_by: string;
  created_by_user?: {
    full_name: string;
  };
}

interface Deal {
  id: string;
  name: string;
  status: string;
  amount: number;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  created_by_user?: {
    full_name: string;
  };
}

interface Call {
  id: string;
  duration: number;
  notes: string;
  created_at: string;
  created_by: string;
  created_by_user?: {
    full_name: string;
  };
  status: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  assigned_user?: {
    full_name: string;
  };
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  created_by: string;
  created_by_user?: {
    full_name: string;
  };
  attendees: string[];
}

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
}

export function useLeadData(leadId: string | null) {
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  // Loading states
  const [dealsLoading, setDealsLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [callsLoading, setCallsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Real-time channels
  const leadsChannelRef = useRef<any>(null);
  const activityChannelRef = useRef<any>(null);

  // Fetch lead details
  const fetchLeadDetails = async () => {
    if (!leadId || !user || leadId === 'new') return;
    
    try {
      setLoading(true);
      setError(null);

      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles!leads_assigned_to_fkey(full_name)
        `)
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      setLead(leadData);
    } catch (error: any) {
      console.error('Error fetching lead details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities
  const fetchActivities = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;

    try {
      const { data: calls } = await supabase
        .from('calls')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      const { data: notes } = await supabase
        .from('lead_notes')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      const { data: status } = await supabase
        .from('lead_status_changes')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      setActivities([
        ...(calls || []).map(a => ({ ...a, type: 'call' })),
        ...(notes || []).map(a => ({ ...a, type: 'note' })),
        ...(status || []).map(a => ({ ...a, type: 'status' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  // Fetch deals
  const fetchDeals = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setDealsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('lead_id', leadId);
      if (error) throw error;
      setDeals(data || []);
    } catch (err: any) {
      console.error('Error fetching deals:', err);
    } finally {
      setDealsLoading(false);
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setTicketsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('lead_id', leadId);
      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setAttachmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('lead_id', leadId);
      if (error) throw error;
      setAttachments(data || []);
    } catch (err: any) {
      console.error('Error fetching attachments:', err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setNotesLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  // Fetch calls
  const fetchCalls = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setCallsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCalls(data || []);
    } catch (err: any) {
      console.error('Error fetching calls:', err);
    } finally {
      setCallsLoading(false);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setTasksLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!assigned_to(full_name)
        `)
        .eq('lead_id', leadId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch meetings
  const fetchMeetings = async () => {
    if (!leadId || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setMeetingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('lead_id', leadId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      setMeetings(data || []);
    } catch (err: any) {
      console.error('Error fetching meetings:', err);
    } finally {
      setMeetingsLoading(false);
    }
  };

  // Fetch company
  const fetchCompany = async () => {
    if (!lead?.company_id || leadId === 'new' || !isValidUUID(leadId || '')) return;
    setCompanyLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', lead.company_id)
        .single();
      if (error) throw error;
      setCompany(data);
    } catch (err: any) {
      console.error('Error fetching company:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Update lead status
  const updateLeadStatus = async (newStatus: string) => {
    if (!lead || !user) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;

      // Create activity for status change
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: lead.id,
          activity_type: 'Status Change',
          description: `Status changed from ${lead.status} to ${newStatus}`,
          created_by: user.id
        });

      setLead({ ...lead, status: newStatus });
      fetchActivities(); // Refresh activities
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message);
    }
  };

  // Add note
  const addNote = async (content: string) => {
    if (!lead || !user) return;

    try {
      const { error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: lead.id,
          content,
          created_by: user.id
        });

      if (error) throw error;

      fetchNotes();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding note:', error);
      setError(error.message);
    }
  };

  // Add deal
  const addDeal = async (deal: { name: string; amount: number; status: string }) => {
    if (!lead || !user) return;

    try {
      const insertData: any = {
        lead_id: lead.id || null,
        ...deal,
        created_by: user.id || null
      };
      Object.keys(insertData).forEach(
        key => {
          if (insertData[key] === '' || (Array.isArray(insertData[key]) && insertData[key].length === 0)) {
            insertData[key] = null;
          }
        }
      );

      const { error } = await supabase
        .from('deals')
        .insert(insertData);

      if (error) throw error;

      fetchDeals();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding deal:', error);
      setError(error.message);
    }
  };

  // Add ticket
  const addTicket = async (ticket: { subject: string; description: string; status: string }) => {
    if (!lead || !user) return;

    try {
      const insertData: any = {
        lead_id: lead.id || null,
        ...ticket,
        created_by: user.id || null
      };
      Object.keys(insertData).forEach(
        key => {
          if (insertData[key] === '' || (Array.isArray(insertData[key]) && insertData[key].length === 0)) {
            insertData[key] = null;
          }
        }
      );

      const { error } = await supabase
        .from('tickets')
        .insert(insertData);

      if (error) throw error;

      fetchTickets();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding ticket:', error);
      setError(error.message);
    }
  };

  // Add attachment
  const addAttachment = async (file: File, name?: string) => {
    if (!lead || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${lead.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      // Create attachment record
      const { error: dbError } = await supabase
        .from('attachments')
        .insert({
          lead_id: lead.id,
          file_name: name || file.name,
          file_type: file.type,
          url: publicUrl,
          created_by: user.id
        });

      if (dbError) throw dbError;

      fetchAttachments();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding attachment:', error);
      setError(error.message);
    }
  };

  // Add meeting
  const addMeeting = async (meeting: { 
    title: string; 
    description: string; 
    start_time: string; 
    end_time: string; 
    attendees?: string[] | null
  }) => {
    if (!lead || !user) return;

    try {
      const insertData: any = {
        lead_id: lead.id || null,
        ...meeting,
        status: 'Scheduled',
        created_by: user.id || null
      };
      // Remove undefined or empty string fields
      Object.keys(insertData).forEach(
        key => {
          if (insertData[key] === '' || (Array.isArray(insertData[key]) && insertData[key].length === 0)) {
            insertData[key] = null;
          }
        }
      );

      // Insert into meetings table
      const { error: meetingError } = await supabase
        .from('meetings')
        .insert(insertData);

      if (meetingError) throw meetingError;

      // Also insert into appointments table for scheduler sync
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          title: meeting.title,
          description: meeting.description,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          status: 'scheduled',
          lead_id: lead.id,
          type: 'meeting'
        });

      if (appointmentError) throw appointmentError;

      fetchMeetings();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding meeting:', error);
      setError(error.message);
    }
  };

  // Add task
  const addTask = async (task: {
    title: string;
    description: string;
    due_date: string;
    priority: string;
    assigned_to: string;
  }) => {
    if (!lead || !user) return;

    try {
      const insertData: any = {
        lead_id: lead.id || null,
        ...task,
        status: 'Pending',
        created_by: user.id || null
      };
      Object.keys(insertData).forEach(
        key => {
          if (insertData[key] === '' || (Array.isArray(insertData[key]) && insertData[key].length === 0)) {
            insertData[key] = null;
          }
        }
      );

      const { error } = await supabase
        .from('tasks')
        .insert(insertData);

      if (error) throw error;

      fetchTasks();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding task:', error);
      setError(error.message);
    }
  };

  // Add call
  const addCall = async (call: { duration: number; notes: string }) => {
    if (!lead || !user) return;

    try {
      const insertData: any = {
        lead_id: lead.id || null,
        ...call,
        status: 'Completed',
        created_by: user.id || null
      };
      Object.keys(insertData).forEach(
        key => {
          if (insertData[key] === '' || (Array.isArray(insertData[key]) && insertData[key].length === 0)) {
            insertData[key] = null;
          }
        }
      );

      const { error } = await supabase
        .from('calls')
        .insert(insertData);

      if (error) throw error;

      fetchCalls();
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding call:', error);
      setError(error.message);
    }
  };

  // Update lead details
  const updateLead = async (updates: Partial<Lead>) => {
    if (!lead || !user) return;

    // Only allow real DB columns
    const allowed = [
      'first_name', 'last_name', 'email', 'phone', 'nationality', 'budget',
      'preferred_location', 'preferred_property_type', 'preferred_bedrooms',
      'preferred_bathrooms', 'preferred_area', 'source', 'status', 'assigned_to',
      'notes', 'next_followup_date', 'created_by', 'company_id'
    ];
    const filteredUpdates: any = {};
    for (const key of allowed) {
      if (key in updates) filteredUpdates[key] = (updates as any)[key];
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update(filteredUpdates)
        .eq('id', lead.id);

      if (error) throw error;

      // Create activity for lead update
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: lead.id,
          activity_type: 'Lead Update',
          description: 'Lead details updated',
          created_by: user.id
        });

      setLead({ ...lead, ...filteredUpdates });
      fetchActivities();
    } catch (error: any) {
      console.error('Error updating lead:', error);
      setError(error.message);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!leadId || !user) return;
    
    const fetchInitialData = async () => {
      await Promise.all([
        fetchLeadDetails(),
        fetchActivities(),
        fetchDeals(),
        fetchTickets(),
        fetchAttachments(),
        fetchNotes(),
        fetchCalls(),
        fetchTasks(),
        fetchMeetings()
      ]);
    };

    fetchInitialData();
  }, [leadId, user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!leadId || !user) return;

    // Lead changes
    if (leadsChannelRef.current) leadsChannelRef.current.unsubscribe();
    const leadChannel = supabase.channel('lead-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `id=eq.${leadId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchLeadDetails();
          }
        }
      )
      .subscribe();
    leadsChannelRef.current = leadChannel;

    return () => {
      leadChannel.unsubscribe();
    };
  }, [leadId, user]);

  useEffect(() => {
    if (!leadId || !user) return;

    // Activity changes
    if (activityChannelRef.current) activityChannelRef.current.unsubscribe();
    const activityChannel = supabase.channel('activity-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lead_activities', filter: `lead_id=eq.${leadId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchActivities();
          }
        }
      )
      .subscribe();
    activityChannelRef.current = activityChannel;

    return () => {
      activityChannel.unsubscribe();
    };
  }, [leadId, user]);

  return {
    lead,
    activities,
    loading,
    error,
    deals,
    tickets,
    attachments,
    notes,
    calls,
    tasks,
    meetings,
    company,
    dealsLoading,
    ticketsLoading,
    attachmentsLoading,
    notesLoading,
    callsLoading,
    tasksLoading,
    meetingsLoading,
    companyLoading,
    fetchLeadDetails,
    fetchActivities,
    fetchDeals,
    fetchTickets,
    fetchAttachments,
    fetchNotes,
    fetchCalls,
    fetchTasks,
    fetchMeetings,
    fetchCompany,
    updateLeadStatus,
    addNote,
    addDeal,
    addTicket,
    addAttachment,
    addMeeting,
    addTask,
    addCall,
    updateLead
  };
}