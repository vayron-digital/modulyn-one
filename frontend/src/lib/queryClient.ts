import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (but only if data is stale)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Leads
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
    activities: (id: string) => [...queryKeys.leads.detail(id), 'activities'] as const,
    notes: (id: string) => [...queryKeys.leads.detail(id), 'notes'] as const,
    calls: (id: string) => [...queryKeys.leads.detail(id), 'calls'] as const,
    tasks: (id: string) => [...queryKeys.leads.detail(id), 'tasks'] as const,
    deals: (id: string) => [...queryKeys.leads.detail(id), 'deals'] as const,
    tickets: (id: string) => [...queryKeys.leads.detail(id), 'tickets'] as const,
    attachments: (id: string) => [...queryKeys.leads.detail(id), 'attachments'] as const,
    meetings: (id: string) => [...queryKeys.leads.detail(id), 'meetings'] as const,
  },
  
  // Properties
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  
  // Calls
  calls: {
    all: ['calls'] as const,
    lists: () => [...queryKeys.calls.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.calls.lists(), filters] as const,
    details: () => [...queryKeys.calls.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.calls.details(), id] as const,
  },
  
  // Users/Profiles
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
    recentActivity: () => [...queryKeys.dashboard.all, 'recentActivity'] as const,
    journeyCards: (journeyId: string) => [...queryKeys.dashboard.all, 'journeyCards', journeyId] as const,
    journeys: () => [...queryKeys.dashboard.all, 'journeys'] as const,
  },
  
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.teams.lists(), filters] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    hierarchy: () => [...queryKeys.teams.all, 'hierarchy'] as const,
    revenue: () => [...queryKeys.teams.all, 'revenue'] as const,
  },
  
  // Reports
  reports: {
    all: ['reports'] as const,
    leads: (filters: any) => [...queryKeys.reports.all, 'leads', filters] as const,
    properties: (filters: any) => [...queryKeys.reports.all, 'properties', filters] as const,
    sales: (filters: any) => [...queryKeys.reports.all, 'sales', filters] as const,
  },
  
  // Chat
  chat: {
    all: ['chat'] as const,
    threads: () => [...queryKeys.chat.all, 'threads'] as const,
    messages: (threadId: string) => [...queryKeys.chat.all, 'messages', threadId] as const,
  },
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Add item to list
  addToList: <T extends { id: string }>(
    queryKey: readonly unknown[],
    newItem: T
  ) => {
    return queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData ? [newItem, ...oldData] : [newItem];
    });
  },
  
  // Update item in list
  updateInList: <T extends { id: string }>(
    queryKey: readonly unknown[],
    updatedItem: T
  ) => {
    return queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData?.map(item => item.id === updatedItem.id ? updatedItem : item);
    });
  },
  
  // Remove item from list
  removeFromList: <T extends { id: string }>(
    queryKey: readonly unknown[],
    itemId: string
  ) => {
    return queryClient.setQueryData(queryKey, (oldData: T[] | undefined) => {
      return oldData?.filter(item => item.id !== itemId);
    });
  },
  
  // Update single item
  updateItem: <T extends { id: string }>(
    queryKey: readonly unknown[],
    updatedItem: T
  ) => {
    return queryClient.setQueryData(queryKey, updatedItem);
  },
}; 