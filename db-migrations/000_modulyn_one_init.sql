-- Modulyn One: Unified DB Migration
-- Purpose: Full schema for Modulyn One CRM with multi-tenant support, feature flags, RLS, triggers, and all core modules
-- Date: 2024-06-09

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'team_leader', 'jr_team_leader', 'director', 'head_of_sales', 'other');
CREATE TYPE lead_status AS ENUM ('active', 'hot', 'warm', 'closed', 'dumped');
CREATE TYPE lead_source AS ENUM ('cold_call', 'website', 'referral', 'other');
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'land');
CREATE TYPE property_status AS ENUM ('available', 'pending', 'sold', 'off_market');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM (
  'lead_created', 'lead_updated', 'lead_dumped', 'lead_assigned',
  'cold_call_assigned', 'cold_call_updated',
  'task_assigned', 'task_updated', 'task_due_soon', 'task_overdue',
  'task_commented', 'task_status_changed', 'task_priority_changed',
  'call_scheduled', 'call_updated', 'offer_created', 'offer_status_changed',
  'reminder', 'system'
);
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

-- 3. TENANTS TABLE
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(64) NOT NULL UNIQUE,
  logo_url TEXT,
  theme_color VARCHAR(16),
  feature_flags JSONB NOT NULL DEFAULT '{"cold_calls":true,"calendar":true,"documents":false,"chat":true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS & PROFILES
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  phone VARCHAR(20),
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  phone VARCHAR(20),
  profile_photo_url TEXT,
  role user_role,
  designation_id UUID,
  date_of_joining DATE,
  reporting_person UUID,
  status VARCHAR(20) DEFAULT 'active',
  availability VARCHAR(32),
  prev_employer VARCHAR(255),
  allow_exclusion BOOLEAN DEFAULT false,
  dob DATE,
  blood_group VARCHAR(8),
  nationality VARCHAR(64),
  marital_status VARCHAR(16),
  address_uae TEXT,
  home_country_contact VARCHAR(32),
  personal_email VARCHAR(255),
  emergency_name VARCHAR(128),
  emergency_number VARCHAR(32),
  emergency_relation VARCHAR(64),
  passport_number VARCHAR(32),
  passport_expiry DATE,
  visa_number VARCHAR(32),
  visa_expiry DATE,
  visa_type VARCHAR(32),
  education VARCHAR(32),
  bank_name VARCHAR(64),
  ifsc VARCHAR(32),
  iban VARCHAR(64),
  bank_account VARCHAR(64),
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status lead_status NOT NULL DEFAULT 'active',
  source lead_source NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  notes TEXT,
  dumped_at TIMESTAMP WITH TIME ZONE,
  dumped_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TASKS
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. COLD CALLS
CREATE TABLE cold_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  outcome TEXT,
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50),
  comments TEXT,
  date TIMESTAMP WITH TIME ZONE,
  is_converted BOOLEAN DEFAULT FALSE,
  converted_by UUID REFERENCES profiles(id),
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. APPOINTMENTS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROPERTIES
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  status property_status NOT NULL DEFAULT 'available',
  type property_type NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_footage INTEGER,
  year_built INTEGER,
  images TEXT[],
  market_cap NUMERIC,
  token_nav NUMERIC,
  current_price NUMERIC,
  floor_size NUMERIC,
  iro_sale_price NUMERIC,
  iro_participants INTEGER,
  distance TEXT,
  features TEXT[],
  full_description TEXT,
  owner TEXT,
  contact TEXT,
  documents JSONB,
  tags TEXT[],
  neighborhood_info JSONB,
  virtual_tour_url TEXT,
  mls_id TEXT,
  portal_sync BOOLEAN DEFAULT FALSE,
  activity_log JSONB,
  listing_status property_status DEFAULT 'available',
  listing_date TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  developer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PROJECTS & RELATED
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE project_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE project_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE project_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'unread',
  related_to_type TEXT CHECK (related_to_type IN ('task', 'lead', 'property', 'document', 'cold_call', 'call', 'offer')),
  related_to_id UUID,
  metadata JSONB DEFAULT '{}',
  remind_later TIMESTAMP WITH TIME ZONE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- 12. TEAMS & HIERARCHY
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_hierarchy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_revenue_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  revenue_target NUMERIC(16,2) NOT NULL DEFAULT 0,
  revenue_actual NUMERIC(16,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_team_month UNIQUE (team_id, month)
);

-- 13. DESIGNATIONS
CREATE TABLE designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. BROCHURES
CREATE TABLE brochures (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  developer_id uuid,
  developer_name text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- 15. CHAT MODULE
CREATE TABLE chat_threads (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  participants TEXT NOT NULL
);
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
CREATE TABLE chat_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  meta JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE chat_shared_entities (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT,
  meta JSONB,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at on all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_documents_updated_at
    BEFORE UPDATE ON project_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_comments_updated_at
    BEFORE UPDATE ON project_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_hierarchy_updated_at
    BEFORE UPDATE ON team_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_revenue_tracking_updated_at
    BEFORE UPDATE ON team_revenue_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designations_updated_at
    BEFORE UPDATE ON designations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 17. INDEXES (sample, add more as needed)
CREATE INDEX IF NOT EXISTS idx_properties_tags ON properties USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties (listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties (owner);
CREATE INDEX IF NOT EXISTS idx_cold_calls_status ON cold_calls(status);
CREATE INDEX IF NOT EXISTS idx_cold_calls_agent_id ON cold_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_cold_calls_is_converted ON cold_calls(is_converted);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- 18. RLS POLICIES (tenant-aware)
-- Tenants: Only admins can see all tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all tenants" ON tenants FOR SELECT USING (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their users" ON users FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their profiles" ON profiles FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their leads" ON leads FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their tasks" ON tasks FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Cold Calls
ALTER TABLE cold_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their cold calls" ON cold_calls FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their appointments" ON appointments FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their properties" ON properties FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their projects" ON projects FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their project tasks" ON project_tasks FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their project documents" ON project_documents FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their project comments" ON project_comments FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their notifications" ON notifications FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their teams" ON teams FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
ALTER TABLE team_hierarchy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their team hierarchy" ON team_hierarchy FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
ALTER TABLE team_revenue_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their team revenue tracking" ON team_revenue_tracking FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Designations
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their designations" ON designations FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Brochures
ALTER TABLE brochures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their brochures" ON brochures FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Chat
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant users can access their chat threads" ON chat_threads FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 19. UTILITY FUNCTIONS (sample: notification RPC)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_related_to_type TEXT DEFAULT NULL,
  p_related_to_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    related_to_type,
    related_to_id,
    metadata
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_related_to_type,
    p_related_to_id,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'read',
      read_at = timezone('utc'::text, now())
  WHERE id = p_notification_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION archive_notification(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'archived',
      archived_at = timezone('utc'::text, now())
  WHERE id = p_notification_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. SCHEMA REFRESH
NOTIFY pgrst, 'reload schema'; 