-- Migration: 999_settings_permissions_integrations.sql
-- Purpose: Add tables for user permissions, integrations, and enhanced settings
-- Date: 2024-12-19

-- Create user_permissions table for granular permission control
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create integrations table for third-party integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    integration_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connected BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_id)
);

-- Create user_invitations table for team member invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, token)
);

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'AED',
    timezone VARCHAR(100) DEFAULT 'UTC',
    secondary_currencies JSONB DEFAULT '["USD", "GBP", "EUR"]',
    profile_image_url TEXT,
    notification_preferences JSONB DEFAULT '{}',
    theme_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_integration_id ON integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS on new tables
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions"
    ON user_permissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
    ON user_permissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

CREATE POLICY "Admins can manage permissions"
    ON user_permissions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- RLS Policies for integrations
CREATE POLICY "Users can view their own integrations"
    ON integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own integrations"
    ON integrations FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all integrations"
    ON integrations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- RLS Policies for user_invitations
CREATE POLICY "Admins can manage invitations"
    ON user_invitations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
    ON user_settings FOR ALL
    USING (auth.uid() = user_id);

-- Create functions for timestamp updates
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_permissions_updated_at();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create user invitation
CREATE OR REPLACE FUNCTION create_user_invitation(
    p_email VARCHAR,
    p_role VARCHAR DEFAULT 'agent',
    p_invited_by UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
    invitation_id UUID;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_invited_by
        AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admins can create invitations';
    END IF;

    -- Create invitation
    INSERT INTO user_invitations (
        email,
        role,
        invited_by,
        token,
        expires_at
    ) VALUES (
        p_email,
        p_role,
        p_invited_by,
        generate_invitation_token(),
        CURRENT_TIMESTAMP + INTERVAL '7 days'
    ) RETURNING id INTO invitation_id;

    RETURN invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(
    p_token VARCHAR,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record user_invitations%ROWTYPE;
BEGIN
    -- Get invitation
    SELECT * INTO invitation_record
    FROM user_invitations
    WHERE token = p_token
    AND expires_at > CURRENT_TIMESTAMP
    AND accepted_at IS NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Mark as accepted
    UPDATE user_invitations
    SET accepted_at = CURRENT_TIMESTAMP
    WHERE token = p_token;

    -- Update user profile with role
    UPDATE profiles
    SET role = invitation_record.role
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default integrations
INSERT INTO integrations (integration_id, name, description) VALUES
('slack', 'Slack', 'Team communication and notifications'),
('zapier', 'Zapier', 'Automate workflows and integrations'),
('mailchimp', 'Mailchimp', 'Email marketing and campaigns'),
('hubspot', 'HubSpot', 'CRM and marketing automation'),
('google_calendar', 'Google Calendar', 'Calendar integration and scheduling'),
('stripe', 'Stripe', 'Payment processing and billing')
ON CONFLICT DO NOTHING; 