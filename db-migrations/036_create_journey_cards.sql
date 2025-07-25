-- Create journey_cards table
CREATE TABLE IF NOT EXISTS journey_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('awareness', 'consideration', 'decision', 'retention')),
    avatar_url TEXT,
    status TEXT DEFAULT 'blue' CHECK (status IN ('green', 'blue', 'red', 'yellow')),
    completed BOOLEAN DEFAULT FALSE,
    highlight BOOLEAN DEFAULT FALSE,
    pill BOOLEAN DEFAULT FALSE,
    position INTEGER NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_journey_cards_stage_position ON journey_cards(stage, position);
CREATE INDEX IF NOT EXISTS idx_journey_cards_tenant ON journey_cards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journey_cards_assigned_to ON journey_cards(assigned_to);

-- Enable RLS
ALTER TABLE journey_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view journey cards in their tenant" ON journey_cards
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert journey cards in their tenant" ON journey_cards
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update journey cards in their tenant" ON journey_cards
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete journey cards in their tenant" ON journey_cards
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journey_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_journey_cards_updated_at
    BEFORE UPDATE ON journey_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_journey_cards_updated_at();

-- Insert some sample data
INSERT INTO journey_cards (title, stage, avatar_url, status, position, tenant_id) VALUES
('Website Visit', 'awareness', '/public/default-avatar.png', 'blue', 1, (SELECT id FROM tenants LIMIT 1)),
('Social Media Engagement', 'awareness', '/public/default-avatar.png', 'green', 2, (SELECT id FROM tenants LIMIT 1)),
('Email Subscription', 'awareness', '/public/default-avatar.png', 'yellow', 3, (SELECT id FROM tenants LIMIT 1)),
('Product Research', 'consideration', '/public/default-avatar.png', 'blue', 1, (SELECT id FROM tenants LIMIT 1)),
('Feature Comparison', 'consideration', '/public/default-avatar.png', 'red', 2, (SELECT id FROM tenants LIMIT 1)),
('Demo Request', 'consideration', '/public/default-avatar.png', 'green', 3, (SELECT id FROM tenants LIMIT 1)),
('Pricing Discussion', 'decision', '/public/default-avatar.png', 'blue', 1, (SELECT id FROM tenants LIMIT 1)),
('Contract Review', 'decision', '/public/default-avatar.png', 'yellow', 2, (SELECT id FROM tenants LIMIT 1)),
('Purchase Decision', 'decision', '/public/default-avatar.png', 'green', 3, (SELECT id FROM tenants LIMIT 1)),
('Onboarding', 'retention', '/public/default-avatar.png', 'blue', 1, (SELECT id FROM tenants LIMIT 1)),
('Training Session', 'retention', '/public/default-avatar.png', 'green', 2, (SELECT id FROM tenants LIMIT 1)),
('Support Ticket', 'retention', '/public/default-avatar.png', 'red', 3, (SELECT id FROM tenants LIMIT 1))
ON CONFLICT DO NOTHING; 