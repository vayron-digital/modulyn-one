-- Create user_details table for extended user information
CREATE TABLE IF NOT EXISTS user_details (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    alt_contact VARCHAR(20),
    dob DATE,
    doj DATE,
    blood_group VARCHAR(5),
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    address_uae TEXT,
    personal_email VARCHAR(255),
    nationality VARCHAR(100),
    marital_status VARCHAR(50),
    medical_conditions TEXT,
    education_details JSONB,
    bank_details JSONB,
    passport_number VARCHAR(50),
    passport_expiry DATE,
    visa_number VARCHAR(50),
    visa_type VARCHAR(100),
    visa_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create team_hierarchy table
CREATE TABLE IF NOT EXISTS team_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reporting_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    position VARCHAR(100),
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_hierarchy ENABLE ROW LEVEL SECURITY;

-- User details policies
CREATE POLICY "Users can view their own details"
    ON user_details FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all user details"
    ON user_details FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

CREATE POLICY "Admins can manage user details"
    ON user_details FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Team hierarchy policies
CREATE POLICY "Users can view their own hierarchy"
    ON team_hierarchy FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hierarchy"
    ON team_hierarchy FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

CREATE POLICY "Admins can manage hierarchy"
    ON team_hierarchy FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_user_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_team_hierarchy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_user_details_updated_at
    BEFORE UPDATE ON user_details
    FOR EACH ROW
    EXECUTE FUNCTION update_user_details_updated_at();

CREATE TRIGGER update_team_hierarchy_updated_at
    BEFORE UPDATE ON team_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION update_team_hierarchy_updated_at(); 