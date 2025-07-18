-- Update leads table with new fields
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS alt_phone TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS avg_income DECIMAL,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS property_preference TEXT,
  ADD COLUMN IF NOT EXISTS developer TEXT,
  ADD COLUMN IF NOT EXISTS property TEXT,
  ADD COLUMN IF NOT EXISTS sub_status TEXT,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS is_dumped BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meeting_count INTEGER DEFAULT 0;

-- Create team_hierarchy table
CREATE TABLE IF NOT EXISTS team_hierarchy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(member_id)
);

-- Create scheduler table
CREATE TABLE IF NOT EXISTS scheduler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update profiles table with new fields
ALTER TABLE profiles
  DROP COLUMN IF EXISTS company,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS alt_phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_expiry DATE,
  ADD COLUMN IF NOT EXISTS visa_number TEXT,
  ADD COLUMN IF NOT EXISTS visa_expiry DATE,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Enable RLS for new tables
ALTER TABLE team_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler ENABLE ROW LEVEL SECURITY;

-- Create policies for team_hierarchy
CREATE POLICY "Users can view team hierarchy"
  ON team_hierarchy FOR SELECT
  USING (auth.uid() = manager_id OR auth.uid() = member_id);

CREATE POLICY "Managers can insert team members"
  ON team_hierarchy FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update team members"
  ON team_hierarchy FOR UPDATE
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can delete team members"
  ON team_hierarchy FOR DELETE
  USING (auth.uid() = manager_id);

-- Create policies for scheduler
CREATE POLICY "Users can view their schedules"
  ON scheduler FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their schedules"
  ON scheduler FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their schedules"
  ON scheduler FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their schedules"
  ON scheduler FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for new tables
CREATE TRIGGER update_team_hierarchy_updated_at
  BEFORE UPDATE ON team_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduler_updated_at
  BEFORE UPDATE ON scheduler
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create lookup tables for dropdowns
CREATE TABLE IF NOT EXISTS lead_sources (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_priorities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_sub_statuses (
  id SERIAL PRIMARY KEY,
  status_id INTEGER REFERENCES lead_statuses(id),
  name TEXT NOT NULL,
  UNIQUE(status_id, name)
);

CREATE TABLE IF NOT EXISTS developers (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id),
  name TEXT NOT NULL,
  UNIQUE(developer_id, name)
);

-- Insert default values
INSERT INTO lead_sources (name) VALUES
  ('Website'),
  ('Referral'),
  ('Social Media'),
  ('Direct'),
  ('Property Portal'),
  ('Cold Call')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lead_priorities (name) VALUES
  ('High'),
  ('Medium'),
  ('Low')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lead_statuses (name) VALUES
  ('New'),
  ('Active'),
  ('Cold'),
  ('Hot'),
  ('Converted'),
  ('Lost'),
  ('Dumped')
ON CONFLICT (name) DO NOTHING; 