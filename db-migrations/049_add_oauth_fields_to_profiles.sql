-- Add OAuth fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS oauth_id TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_id ON profiles(oauth_provider, oauth_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.oauth_provider IS 'OAuth provider (e.g., google, github)';
COMMENT ON COLUMN profiles.oauth_id IS 'OAuth provider user ID';
COMMENT ON COLUMN profiles.profile_image_url IS 'Profile image URL from OAuth provider';
