// Common types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source?: string;
  status: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  team_members?: TeamMember[];
  properties?: Property[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  user?: User;
}

import { PropertyType } from '../utils/propertyTypes';
import { PropertyStatus } from '../utils/propertyStatuses';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  description?: string;
  project_id?: string;
  owner_id?: string;
  features?: string[];
  images?: string[];
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  name: string;
  type: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: string;
  project_id?: string;
  lead_id?: string;
  tags?: string[];
  comments?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  user_id: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  type: string;
  status: string;
  duration?: number;
  description?: string;
  user_id: string;
  lead_id?: string;
  project_id?: string;
  scheduled_at?: string;
  outcome?: string;
  follow_up_date?: string;
  call_notes?: CallNote[];
  created_at: string;
  updated_at: string;
}

export interface CallNote {
  id: string;
  call_id: string;
  content: string;
  user_id: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: User;
  created_at: string;
  updated_at: string;
}

export interface DashboardKPITrends {
  totalLeads: { current: number; previous: number };
  revenueThisMonth: { current: number; previous: number };
}

export interface DashboardKPI {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  newLeadsThisMonth: number;
  leadsConvertedThisMonth: number;
  avgLeadResponseTime: number | null;
  activeTasks: number;
  overdueTasks: number;
  propertiesSoldThisMonth: number;
  revenueThisMonth: number;
  callSuccessRate: number | null;
  avgDealSize: number | null;
  trends: DashboardKPITrends;
} 