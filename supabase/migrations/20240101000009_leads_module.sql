-- Drop existing tables if they exist
DROP TABLE IF EXISTS lead_documents CASCADE;
DROP TABLE IF EXISTS lead_activities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    nationality VARCHAR(100),
    budget DECIMAL(15,2),
    preferred_location VARCHAR(255),
    preferred_property_type VARCHAR(100),
    preferred_bedrooms INTEGER,
    preferred_bathrooms INTEGER,
    preferred_area VARCHAR(255),
    preferred_amenities TEXT[],
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New',
    assigned_to UUID,
    created_by UUID,
    notes TEXT,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_followup_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_activities table
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_documents table
CREATE TABLE lead_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE leads
    ADD CONSTRAINT fk_leads_assigned_to
    FOREIGN KEY (assigned_to)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

ALTER TABLE leads
    ADD CONSTRAINT fk_leads_created_by
    FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

ALTER TABLE lead_activities
    ADD CONSTRAINT fk_lead_activities_lead_id
    FOREIGN KEY (lead_id)
    REFERENCES leads(id)
    ON DELETE CASCADE;

ALTER TABLE lead_activities
    ADD CONSTRAINT fk_lead_activities_created_by
    FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

ALTER TABLE lead_documents
    ADD CONSTRAINT fk_lead_documents_lead_id
    FOREIGN KEY (lead_id)
    REFERENCES leads(id)
    ON DELETE CASCADE;

ALTER TABLE lead_documents
    ADD CONSTRAINT fk_lead_documents_uploaded_by
    FOREIGN KEY (uploaded_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their assigned leads" ON leads;
DROP POLICY IF EXISTS "Users can view leads they created" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Users can create leads" ON leads;
DROP POLICY IF EXISTS "Users can update their assigned leads" ON leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;

DROP POLICY IF EXISTS "Users can view activities for their leads" ON lead_activities;
DROP POLICY IF EXISTS "Users can create activities for their leads" ON lead_activities;
DROP POLICY IF EXISTS "Admins can manage all activities" ON lead_activities;

DROP POLICY IF EXISTS "Users can view documents for their leads" ON lead_documents;
DROP POLICY IF EXISTS "Users can upload documents for their leads" ON lead_documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON lead_documents;

-- Leads policies
CREATE POLICY "Users can view their assigned leads"
    ON leads FOR SELECT
    USING (
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can view leads they created"
    ON leads FOR SELECT
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can create leads"
    ON leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their assigned leads"
    ON leads FOR UPDATE
    USING (
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can manage all leads"
    ON leads FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Lead activities policies
CREATE POLICY "Users can view activities for their leads"
    ON lead_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            AND (
                leads.assigned_to = auth.uid() 
                OR leads.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Users can create activities for their leads"
    ON lead_activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            AND (
                leads.assigned_to = auth.uid() 
                OR leads.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Admins can manage all activities"
    ON lead_activities FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Lead documents policies
CREATE POLICY "Users can view documents for their leads"
    ON lead_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND (
                leads.assigned_to = auth.uid() 
                OR leads.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Users can upload documents for their leads"
    ON lead_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND (
                leads.assigned_to = auth.uid() 
                OR leads.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Admins can manage all documents"
    ON lead_documents FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP FUNCTION IF EXISTS update_leads_updated_at();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- Insert sample leads
DO $$
DECLARE
    admin_id UUID;
    agent1_id UUID;
    agent2_id UUID;
    agent3_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    SELECT id INTO agent1_id FROM auth.users WHERE email = 'smhk.fortune4@gmail.com' LIMIT 1;
    SELECT id INTO agent2_id FROM auth.users WHERE email = 'agent2@example.com' LIMIT 1;
    SELECT id INTO agent3_id FROM auth.users WHERE email = 'agent3@example.com' LIMIT 1;

    -- Insert leads for admin
    INSERT INTO leads (first_name, last_name, email, phone, nationality, budget, preferred_location, 
                      preferred_property_type, preferred_bedrooms, preferred_bathrooms, preferred_area, 
                      preferred_amenities, source, status, assigned_to, created_by, notes)
    VALUES 
        ('Ahmed', 'Khan', 'ahmed@example.com', '+971501234567', 'UAE', 2500000, 'Dubai Marina',
         'Apartment', 2, 2, '1200 sqft', ARRAY['Pool', 'Gym', 'Parking'], 'Website', 'New',
         admin_id, admin_id, 'Interested in waterfront properties'),
        ('Sarah', 'Johnson', 'sarah@example.com', '+971502345678', 'UK', 3500000, 'Palm Jumeirah',
         'Villa', 4, 4, '3000 sqft', ARRAY['Private Pool', 'Garden', 'Parking'], 'Referral', 'Contacted',
         admin_id, admin_id, 'Looking for family home'),
        ('Mohammed', 'Ali', 'mohammed@example.com', '+971503456789', 'UAE', 1500000, 'Downtown Dubai',
         'Apartment', 1, 1, '800 sqft', ARRAY['Gym', 'Parking'], 'Walk-in', 'Qualified',
         admin_id, admin_id, 'First-time buyer');

    -- Insert leads for agent1 (smhk.fortune4@gmail.com)
    INSERT INTO leads (first_name, last_name, email, phone, nationality, budget, preferred_location, 
                      preferred_property_type, preferred_bedrooms, preferred_bathrooms, preferred_area, 
                      preferred_amenities, source, status, assigned_to, created_by, notes)
    VALUES 
        ('Fatima', 'Ahmed', 'fatima@example.com', '+971504567890', 'UAE', 1800000, 'Jumeirah Beach Residence',
         'Apartment', 2, 2, '1000 sqft', ARRAY['Pool', 'Gym', 'Beach Access'], 'Website', 'New',
         agent1_id, admin_id, 'Interested in beachfront properties'),
        ('James', 'Wilson', 'james@example.com', '+971505678901', 'USA', 4200000, 'Emirates Hills',
         'Villa', 5, 5, '4000 sqft', ARRAY['Private Pool', 'Garden', 'Parking'], 'Referral', 'Contacted',
         agent1_id, admin_id, 'Relocating from US'),
        ('Aisha', 'Malik', 'aisha@example.com', '+971506789012', 'Pakistan', 1200000, 'Dubai Silicon Oasis',
         'Apartment', 1, 1, '700 sqft', ARRAY['Gym', 'Parking'], 'Walk-in', 'Qualified',
         agent1_id, admin_id, 'Looking for investment property'),
        ('David', 'Brown', 'david@example.com', '+971507890123', 'UK', 2800000, 'Dubai Hills',
         'Townhouse', 3, 3, '2000 sqft', ARRAY['Community Pool', 'Gym', 'Parking'], 'Website', 'New',
         agent1_id, admin_id, 'Family of four'),
        ('Layla', 'Hassan', 'layla@example.com', '+971508901234', 'UAE', 3200000, 'Arabian Ranches',
         'Villa', 4, 4, '3500 sqft', ARRAY['Private Pool', 'Garden', 'Parking'], 'Referral', 'Contacted',
         agent1_id, admin_id, 'Looking for larger home'),
        ('Michael', 'Taylor', 'michael@example.com', '+971509012345', 'Canada', 1900000, 'Business Bay',
         'Apartment', 2, 2, '1100 sqft', ARRAY['Pool', 'Gym', 'Parking'], 'Website', 'Qualified',
         agent1_id, admin_id, 'Working in DIFC');

    -- Insert leads for agent2
    INSERT INTO leads (first_name, last_name, email, phone, nationality, budget, preferred_location, 
                      preferred_property_type, preferred_bedrooms, preferred_bathrooms, preferred_area, 
                      preferred_amenities, source, status, assigned_to, created_by, notes)
    VALUES 
        ('Sophia', 'Chen', 'sophia@example.com', '+971510123456', 'China', 2200000, 'Dubai Marina',
         'Apartment', 2, 2, '1300 sqft', ARRAY['Pool', 'Gym', 'Parking'], 'Website', 'New',
         agent2_id, admin_id, 'Looking for investment'),
        ('Omar', 'Abdullah', 'omar@example.com', '+971511234567', 'UAE', 3800000, 'Meadows',
         'Villa', 4, 4, '3200 sqft', ARRAY['Private Pool', 'Garden', 'Parking'], 'Referral', 'Contacted',
         agent2_id, admin_id, 'Growing family'),
        ('Emma', 'Davis', 'emma@example.com', '+971512345678', 'Australia', 1600000, 'Jumeirah Village Circle',
         'Townhouse', 3, 3, '1800 sqft', ARRAY['Community Pool', 'Gym', 'Parking'], 'Walk-in', 'Qualified',
         agent2_id, admin_id, 'Relocating from Australia'),
        ('Yusuf', 'Khan', 'yusuf@example.com', '+971513456789', 'India', 1400000, 'Dubai Sports City',
         'Apartment', 1, 1, '900 sqft', ARRAY['Gym', 'Parking'], 'Website', 'New',
         agent2_id, admin_id, 'First-time buyer'),
        ('Isabella', 'Martinez', 'isabella@example.com', '+971514567890', 'Spain', 2900000, 'Palm Jumeirah',
         'Apartment', 3, 3, '1600 sqft', ARRAY['Pool', 'Gym', 'Beach Access'], 'Referral', 'Contacted',
         agent2_id, admin_id, 'Looking for vacation home');

    -- Insert leads for agent3
    INSERT INTO leads (first_name, last_name, email, phone, nationality, budget, preferred_location, 
                      preferred_property_type, preferred_bedrooms, preferred_bathrooms, preferred_area, 
                      preferred_amenities, source, status, assigned_to, created_by, notes)
    VALUES 
        ('Hassan', 'Mohammed', 'hassan@example.com', '+971515678901', 'UAE', 2100000, 'Downtown Dubai',
         'Apartment', 2, 2, '1100 sqft', ARRAY['Pool', 'Gym', 'Parking'], 'Website', 'New',
         agent3_id, admin_id, 'Working in Downtown'),
        ('Olivia', 'Smith', 'olivia@example.com', '+971516789012', 'UK', 3300000, 'Emirates Hills',
         'Villa', 4, 4, '3100 sqft', ARRAY['Private Pool', 'Garden', 'Parking'], 'Referral', 'Contacted',
         agent3_id, admin_id, 'Relocating from UK'),
        ('Ali', 'Rahman', 'ali@example.com', '+971517890123', 'Pakistan', 1700000, 'Dubai Hills',
         'Townhouse', 3, 3, '1900 sqft', ARRAY['Community Pool', 'Gym', 'Parking'], 'Walk-in', 'Qualified',
         agent3_id, admin_id, 'Family of five'),
        ('Sophie', 'Anderson', 'sophie@example.com', '+971518901234', 'USA', 2400000, 'Dubai Marina',
         'Apartment', 2, 2, '1200 sqft', ARRAY['Pool', 'Gym', 'Parking'], 'Website', 'New',
         agent3_id, admin_id, 'Working in DIFC'),
        ('Rashid', 'Al Maktoum', 'rashid@example.com', '+971519012345', 'UAE', 4000000, 'Palm Jumeirah',
         'Villa', 5, 5, '3800 sqft', ARRAY['Private Pool', 'Garden', 'Beach Access'], 'Referral', 'Contacted',
         agent3_id, admin_id, 'Looking for luxury property');
END $$; 