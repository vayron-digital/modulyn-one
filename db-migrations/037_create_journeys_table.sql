-- Create journeys table for multi-board support
CREATE TABLE IF NOT EXISTS journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- Add journey_id to journey_cards
ALTER TABLE journey_cards ADD COLUMN IF NOT EXISTS journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_journey_cards_journey_id ON journey_cards(journey_id);

-- Indexes for journeys
CREATE INDEX IF NOT EXISTS idx_journeys_tenant ON journeys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journeys_created_by ON journeys(created_by);

-- Enable RLS
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view journeys in their tenant" ON journeys
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert journeys in their tenant" ON journeys
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update journeys in their tenant" ON journeys
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete journeys in their tenant" ON journeys
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_journeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journeys_updated_at
    BEFORE UPDATE ON journeys
    FOR EACH ROW
    EXECUTE FUNCTION update_journeys_updated_at(); 