-- Add last_seen column to profiles table
ALTER TABLE profiles
ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Add trigger to update last_seen when user goes offline
CREATE OR REPLACE FUNCTION update_profile_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_online = false THEN
        UPDATE profiles
        SET last_seen = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_last_seen_trigger
    AFTER UPDATE ON presence
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_last_seen(); 