import axios from 'axios';
import { ApiResponse, User, Lead, Project, Property, Task, Call, Role, Department, TeamMember, Document, Comment, CallNote } from '../types/api';

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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

export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
};

export default api;