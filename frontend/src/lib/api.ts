import axios from 'axios';
import { ApiResponse, User, Lead, Project, Property, Task, Call, Role, Department, TeamMember, Document, Comment, CallNote } from '../types/api';
import { supabase } from '../lib/supabase'; // Add this import

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  // Use Supabase session token
  const session = await supabase.auth.getSession();
  const token = session.data?.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data),
  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  getCurrentUser: () => api.get<ApiResponse<User>>('/auth/me'),
  getStats: () => api.get<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalLeads: number;
    totalProperties: number;
  }>>('/auth/stats'),
};

// Leads API
export const leadsApi = {
  getAll: () => api.get<ApiResponse<Lead[]>>('/leads'),
  getById: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),
  create: (data: Partial<Lead>) => api.post<ApiResponse<Lead>>('/leads', data),
  update: (id: string, data: Partial<Lead>) => api.patch<ApiResponse<Lead>>(`/leads/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/leads/${id}`),
};

// Projects API
export const projectsApi = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.patch<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/projects/${id}`),
  addTeamMember: (id: string, data: { userId: string; role: string }) =>
    api.post(`/projects/${id}/team-members`, data),
  removeTeamMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/team-members/${userId}`),
};

// Properties API
export const propertiesApi = {
  getAll: () => api.get<ApiResponse<Property[]>>('/properties'),
  getById: (id: string) => api.get<ApiResponse<Property>>(`/properties/${id}`),
  create: (data: Partial<Property>) => api.post<ApiResponse<Property>>('/properties', data),
  update: (id: string, data: Partial<Property>) => api.patch<ApiResponse<Property>>(`/properties/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/properties/${id}`),
  addDocument: (id: string, data: { name: string; type: string; url: string; description?: string }) =>
    api.post(`/properties/${id}/documents`, data),
  removeDocument: (id: string, documentId: string) =>
    api.delete(`/properties/${id}/documents/${documentId}`),
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get<ApiResponse<Task[]>>('/tasks'),
  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<ApiResponse<Task>>('/tasks', data),
  update: (id: string, data: Partial<Task>) => api.patch<ApiResponse<Task>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/tasks/${id}`),
  addComment: (id: string, data: { content: string; userId: string }) =>
    api.post(`/tasks/${id}/comments`, data),
  removeComment: (id: string, commentId: string) =>
    api.delete(`/tasks/${id}/comments/${commentId}`),
};

// Calls API
export const callsApi = {
  getAll: () => api.get<ApiResponse<Call[]>>('/calls'),
  getById: (id: string) => api.get<ApiResponse<Call>>(`/calls/${id}`),
  create: (data: Partial<Call>) => api.post<ApiResponse<Call>>('/calls', data),
  update: (id: string, data: Partial<Call>) => api.patch<ApiResponse<Call>>(`/calls/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/calls/${id}`),
  addNote: (id: string, data: { content: string }) => api.post<ApiResponse<CallNote>>(`/calls/${id}/notes`, data),
  removeNote: (id: string, noteId: string) =>
    api.delete(`/calls/${id}/notes/${noteId}`),
};

// Team API
export const teamApi = {
  getAll: () => api.get<ApiResponse<TeamMember[]>>('/team'),
  getById: (id: string) => api.get<ApiResponse<TeamMember>>(`/team/${id}`),
  create: (data: Partial<TeamMember>) => api.post<ApiResponse<TeamMember>>('/team', data),
  update: (id: string, data: Partial<TeamMember>) => api.patch<ApiResponse<TeamMember>>(`/team/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/team/${id}`),
  getAllRoles: () => api.get<ApiResponse<Role[]>>('/team/roles'),
  createRole: (data: { name: string; permissions: string[] }) =>
    api.post<ApiResponse<Role>>('/team/roles', data),
  updateRole: (id: string, data: Partial<Role>) => api.patch<ApiResponse<Role>>(`/team/roles/${id}`, data),
  deleteRole: (id: string) => api.delete<ApiResponse<void>>(`/team/roles/${id}`),
  getAllDepartments: () => api.get<ApiResponse<Department[]>>('/team/departments'),
  createDepartment: (data: { name: string; description?: string; managerId?: string }) =>
    api.post<ApiResponse<Department>>('/team/departments', data),
  updateDepartment: (id: string, data: Partial<Department>) =>
    api.patch<ApiResponse<Department>>(`/team/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete<ApiResponse<void>>(`/team/departments/${id}`),
};

export const journeysApi = {
  getAll: () => api.get('/dashboard/journeys'),
  create: (data: { name: string; description?: string }) => api.post('/dashboard/journeys', data),
  update: (id: string, data: { name?: string; description?: string }) => api.put(`/dashboard/journeys/${id}`, data),
  delete: (id: string) => api.delete(`/dashboard/journeys/${id}`),
};

export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getJourneyCards: (journeyId: string) => api.get(`/dashboard/journey-cards?journeyId=${journeyId}`),
  createJourneyCard: (data: { title: string; stage: string; status?: string }) =>
    api.post('/dashboard/journey-cards', data),
  updateJourneyCard: (id: string, data: { title?: string; stage?: string; status?: string; position?: number }) =>
    api.patch(`/dashboard/journey-cards/${id}`, data),
  deleteJourneyCard: (id: string) => api.delete(`/dashboard/journey-cards/${id}`),
  reorderJourneyCards: (data: {
    sourceStage: string;
    destinationStage: string;
    sourceIndex: number;
    destinationIndex: number;
    cardId: string;
  }) => api.patch('/dashboard/journey-cards/reorder', data),
};

export const journeyColumnsApi = {
  getAll: (journeyId: string) => api.get(`/dashboard/journeys/${journeyId}/columns`),
  create: (journeyId: string, data: { name: string; position?: number }) => api.post(`/dashboard/journeys/${journeyId}/columns`, data),
  update: (journeyId: string, columnId: string, data: { name?: string; position?: number }) => api.put(`/dashboard/journeys/${journeyId}/columns/${columnId}`, data),
  delete: (journeyId: string, columnId: string) => api.delete(`/dashboard/journeys/${journeyId}/columns/${columnId}`),
  reorder: (journeyId: string, newOrder: string[]) => api.patch(`/dashboard/journeys/${journeyId}/columns/reorder`, { newOrder }),
};

export default api;