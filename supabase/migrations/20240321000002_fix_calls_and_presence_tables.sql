-- Add created_by column to calls table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'calls' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE calls 
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create or update presence table
CREATE TABLE IF NOT EXISTS presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presence_user_id ON presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_is_online ON presence(is_online);
CREATE INDEX IF NOT EXISTS idx_calls_created_by ON calls(created_by);

-- Add RLS policies for presence table
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all presence records"
    ON presence FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own presence"
    ON presence FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence"
    ON presence FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presence_updated_at
    BEFORE UPDATE ON presence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 