-- Create cold_calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS cold_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    outcome TEXT,
    agent_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to profiles
ALTER TABLE cold_calls
    ADD CONSTRAINT cold_calls_agent_id_fkey
    FOREIGN KEY (agent_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE cold_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Agents can view their own cold calls"
    ON cold_calls FOR SELECT
    USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all cold calls"
    ON cold_calls FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )); 