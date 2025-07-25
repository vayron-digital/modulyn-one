import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { queryKeys, optimisticUpdates } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import debounce from 'lodash.debounce';

// Types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  budget?: number;
  preferred_location?: string;
  preferred_property_type?: string;
  preferred_bedrooms?: number;
  preferred_bathrooms?: number;
  preferred_area?: number;
  nationality?: string;
  next_followup_date?: string;
  company_id?: string;
  assigned_user?: { full_name: string };
}

export interface LeadFilters {
  search?: string;
  status?: string[];
  source?: string[];
  assigned_to?: string[];
  dateRange?: { start: string; end: string };
  page?: number;
  limit?: number;
  sort?: { key: string; direction: 'asc' | 'desc' };
}

// Fetch leads with filters
const fetchLeads = async (filters: LeadFilters = {}) => {
  let query = supabase
    .from('leads')
    .select(`
      *,
      assigned_user:profiles!leads_assigned_to_fkey(full_name)
    `, { count: 'exact' });

  // Apply filters
  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters.source?.length) {
    query = query.in('source', filters.source);
  }

  if (filters.assigned_to?.length) {
    query = query.in('assigned_to', filters.assigned_to);
  }

  if (filters.dateRange?.start) {
    query = query.gte('created_at', filters.dateRange.start);
  }

  if (filters.dateRange?.end) {
    query = query.lte('created_at', filters.dateRange.end);
  }

  // Apply sorting
  const sortKey = filters.sort?.key || 'created_at';
  const sortDirection = filters.sort?.direction || 'desc';
  query = query.order(sortKey, { ascending: sortDirection === 'asc' });

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    leads: data || [],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// Fetch single lead
const fetchLead = async (id: string) => {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      assigned_user:profiles!leads_assigned_to_fkey(full_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create lead
const createLead = async (leadData: Partial<Lead>) => {
  const { data, error } = await supabase
    .from('leads')
    .insert(leadData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update lead
const updateLead = async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete lead
const deleteLead = async (id: string) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

// React Query Hooks
export const useLeads = (filters: LeadFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => fetchLeads(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInfiniteLeads = (filters: Omit<LeadFilters, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: ({ pageParam = 1 }) => fetchLeads({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useLead = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.leads.detail(id || ''),
    queryFn: () => fetchLead(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createLead,
    onSuccess: (newLead) => {
      // Invalidate and refetch leads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      
      // Optimistically add to all relevant lists
      const filters = { assigned_to: [user?.id] };
      optimisticUpdates.addToList(queryKeys.leads.list(filters), newLead);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLead,
    onSuccess: (updatedLead) => {
      // Invalidate and refetch leads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      
      // Update in cache
      queryClient.setQueryData(queryKeys.leads.detail(updatedLead.id), updatedLead);
      
      // Optimistically update in lists
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: (deletedLead) => {
      // Invalidate and refetch leads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.leads.detail(deletedLead.id) });
    },
  });
};

// Debounced search hook
export const useDebouncedLeads = (filters: LeadFilters = {}, delay: number = 300) => {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const debouncedSetFilters = useCallback(
    debounce((newFilters: LeadFilters) => {
      setDebouncedFilters(newFilters);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetFilters(filters);
    return () => debouncedSetFilters.cancel();
  }, [filters, debouncedSetFilters]);

  return useLeads(debouncedFilters);
};

// Lead activities hooks
export const useLeadActivities = (leadId: string | null) => {
  return useQuery({
    queryKey: queryKeys.leads.activities(leadId || ''),
    queryFn: async () => {
      if (!leadId) return [];

      const [callsRes, notesRes, statusRes] = await Promise.all([
        supabase
          .from('calls')
          .select(`*, created_by_user:profiles!created_by(full_name)`)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase
          .from('lead_notes')
          .select(`*, created_by_user:profiles!created_by(full_name)`)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase
          .from('lead_status_changes')
          .select(`*, created_by_user:profiles!created_by(full_name)`)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
      ]);

      const activities = [
        ...(callsRes.data || []).map(a => ({ ...a, type: 'call' })),
        ...(notesRes.data || []).map(a => ({ ...a, type: 'note' })),
        ...(statusRes.data || []).map(a => ({ ...a, type: 'status' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return activities;
    },
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Lead notes hooks
export const useLeadNotes = (leadId: string | null) => {
  return useQuery({
    queryKey: queryKeys.leads.notes(leadId || ''),
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('lead_notes')
        .select(`*, created_by_user:profiles!created_by(full_name)`)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

// Lead calls hooks
export const useLeadCalls = (leadId: string | null) => {
  return useQuery({
    queryKey: queryKeys.leads.calls(leadId || ''),
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('calls')
        .select(`*, created_by_user:profiles!created_by(full_name)`)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

// Lead tasks hooks
export const useLeadTasks = (leadId: string | null) => {
  return useQuery({
    queryKey: queryKeys.leads.tasks(leadId || ''),
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`*, assigned_user:profiles!assigned_to(full_name)`)
        .eq('lead_id', leadId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}; 