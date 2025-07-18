-- Create presence table
CREATE TABLE IF NOT EXISTS presence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS presence_user_id_idx ON presence(user_id);

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION update_presence_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen
CREATE TRIGGER update_presence_last_seen
    BEFORE UPDATE ON presence
    FOR EACH ROW
    EXECUTE FUNCTION update_presence_last_seen();

-- Create RLS policies
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own presence
CREATE POLICY "Users can view their own presence"
    ON presence FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update their own presence
CREATE POLICY "Users can update their own presence"
    ON presence FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert their own presence
CREATE POLICY "Users can insert their own presence"
    ON presence FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow admins to see all presence
CREATE POLICY "Admins can view all presence"
    ON presence FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = true OR profiles.role = 'Administrator')
        )
    ); 