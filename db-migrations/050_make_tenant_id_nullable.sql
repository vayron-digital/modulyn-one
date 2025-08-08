-- Make tenant_id nullable in profiles table for OAuth freemium users
-- This allows creating profiles for OAuth users without requiring a tenant

-- Remove NOT NULL constraint on tenant_id
ALTER TABLE profiles 
ALTER COLUMN tenant_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN profiles.tenant_id IS 'Tenant ID - nullable for freemium OAuth users who have not yet subscribed';

-- Add is_active column if it doesn't exist (for user status tracking)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add created_at and updated_at if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();
