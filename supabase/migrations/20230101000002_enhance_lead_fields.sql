-- Add new columns to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
  ADD COLUMN IF NOT EXISTS lead_source TEXT,
  ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS property_requirements JSONB,
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for better performance
CREATE INDEX IF NOT EXISTS leads_assigned_agent_id_idx ON leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS leads_lead_score_idx ON leads(lead_score);
CREATE INDEX IF NOT EXISTS leads_next_follow_up_date_idx ON leads(next_follow_up_date);

-- Update the leads table to initialize property_requirements
UPDATE leads SET property_requirements = '{
  "type": null,
  "min_price": null,
  "max_price": null,
  "min_bedrooms": null,
  "min_bathrooms": null,
  "preferred_locations": [],
  "amenities": []
}'::jsonb WHERE property_requirements IS NULL; 