-- =====================================================
-- SETTINGS DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create user_settings table
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

-- 2. Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 3. Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    integration_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    connected BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_id)
);

-- 4. Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'agent',
    permissions JSONB DEFAULT '[]',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    invited_by UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, token)
);

-- 5. Create jobs table for Jobs Management
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_integration_id ON integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- 7. Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
    ON user_settings FOR ALL
    USING (auth.uid() = user_id);

-- 9. RLS Policies for user_permissions
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

-- 10. RLS Policies for integrations
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

-- 11. RLS Policies for user_invitations
CREATE POLICY "Admins can manage invitations"
    ON user_invitations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- 12. RLS Policies for jobs
CREATE POLICY "Users can view their own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own jobs"
    ON jobs FOR ALL
    USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all jobs"
    ON jobs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- 13. Create functions for timestamp updates
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for timestamp updates
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_permissions_updated_at();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_jobs_updated_at();

-- 15. Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 16. Create function to create user invitation
CREATE OR REPLACE FUNCTION create_user_invitation(
    p_email VARCHAR,
    p_role VARCHAR DEFAULT 'agent',
    p_permissions JSONB DEFAULT '[]',
    p_invited_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    invitation_id UUID;
BEGIN
    INSERT INTO user_invitations (
        email,
        role,
        permissions,
        token,
        expires_at,
        invited_by
    ) VALUES (
        p_email,
        p_role,
        p_permissions,
        generate_invitation_token(),
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        p_invited_by
    ) RETURNING id INTO invitation_id;
    
    RETURN invitation_id;
END;
$$ LANGUAGE plpgsql;

-- 17. Default integrations will be created dynamically by the frontend
-- when users access the integrations tab for the first time

-- 18. Create function to get user settings with defaults
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'currency', COALESCE(us.currency, 'AED'),
        'timezone', COALESCE(us.timezone, 'UTC'),
        'secondary_currencies', COALESCE(us.secondary_currencies, '["USD", "GBP", "EUR"]'),
        'notification_preferences', COALESCE(us.notification_preferences, '{}'),
        'theme_preferences', COALESCE(us.theme_preferences, '{}')
    ) INTO result
    FROM user_settings us
    WHERE us.user_id = p_user_id;
    
    RETURN COALESCE(result, '{"currency": "AED", "timezone": "UTC", "secondary_currencies": ["USD", "GBP", "EUR"], "notification_preferences": {}, "theme_preferences": {}}');
END;
$$ LANGUAGE plpgsql;

-- 19. Create function to upsert user settings
CREATE OR REPLACE FUNCTION upsert_user_settings(
    p_user_id UUID,
    p_currency VARCHAR DEFAULT NULL,
    p_timezone VARCHAR DEFAULT NULL,
    p_secondary_currencies JSONB DEFAULT NULL,
    p_notification_preferences JSONB DEFAULT NULL,
    p_theme_preferences JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    settings_id UUID;
BEGIN
    INSERT INTO user_settings (
        user_id,
        currency,
        timezone,
        secondary_currencies,
        notification_preferences,
        theme_preferences
    ) VALUES (
        p_user_id,
        COALESCE(p_currency, 'AED'),
        COALESCE(p_timezone, 'UTC'),
        COALESCE(p_secondary_currencies, '["USD", "GBP", "EUR"]'),
        COALESCE(p_notification_preferences, '{}'),
        COALESCE(p_theme_preferences, '{}')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        currency = EXCLUDED.currency,
        timezone = EXCLUDED.timezone,
        secondary_currencies = EXCLUDED.secondary_currencies,
        notification_preferences = EXCLUDED.notification_preferences,
        theme_preferences = EXCLUDED.theme_preferences,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO settings_id;
    
    RETURN settings_id;
END;
$$ LANGUAGE plpgsql;

-- 20. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 