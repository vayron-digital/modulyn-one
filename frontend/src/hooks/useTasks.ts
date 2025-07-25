import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys, optimisticUpdates } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assigned_to?: string;
  lead_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_user?: { full_name: string };
  lead?: { first_name: string; last_name: string };
}

export interface TaskFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  assigned_to?: string[];
  lead_id?: string;
  due_date?: { start: string; end: string };
  page?: number;
  limit?: number;
  sort?: { key: string; direction: 'asc' | 'desc' };
}

// Fetch tasks with filters
const fetchTasks = async (filters: TaskFilters = {}) => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:profiles!assigned_to(full_name),
      lead:leads(first_name, last_name)
    `, { count: 'exact' });

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters.priority?.length) {
    query = query.in('priority', filters.priority);
  }

  if (filters.assigned_to?.length) {
    query = query.in('assigned_to', filters.assigned_to);
  }

  if (filters.lead_id) {
    query = query.eq('lead_id', filters.lead_id);
  }

  if (filters.due_date?.start) {
    query = query.gte('due_date', filters.due_date.start);
  }

  if (filters.due_date?.end) {
    query = query.lte('due_date', filters.due_date.end);
  }

  // Apply sorting
  const sortKey = filters.sort?.key || 'due_date';
  const sortDirection = filters.sort?.direction || 'asc';
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
    tasks: data || [],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// Fetch single task
const fetchTask = async (id: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:profiles!assigned_to(full_name),
      lead:leads(first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create task
const createTask = async (taskData: Partial<Task>) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update task
const updateTask = async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete task
const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

// React Query Hooks
export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTask = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id || ''),
    queryFn: () => fetchTask(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      
      // Optimistically add to all relevant lists
      const filters = { assigned_to: [user?.id] };
      optimisticUpdates.addToList(queryKeys.tasks.list(filters), newTask);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      // Invalidate and refetch tasks lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      
      // Update in cache
      queryClient.setQueryData(queryKeys.tasks.detail(updatedTask.id), updatedTask);
      
      // Optimistically update in lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (deletedTask) => {
      // Invalidate and refetch tasks lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(deletedTask.id) });
    },
  });
};

// Task statistics hook
export const useTaskStats = () => {
  return useQuery({
    queryKey: [...queryKeys.tasks.all, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(task => task.status === 'pending').length,
        inProgress: data.filter(task => task.status === 'in_progress').length,
        completed: data.filter(task => task.status === 'completed').length,
        cancelled: data.filter(task => task.status === 'cancelled').length,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 