-- Add is_admin column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create admin user if not exists and set privileges
DO $$
BEGIN
    -- Set admin privileges for the admin user
    UPDATE profiles 
    SET 
        is_admin = true,
        role = 'Administrator',
        department = 'Management'
    WHERE email = 'admin@f4crm.com';

    -- Ensure the admin exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@f4crm.com') THEN
        RAISE NOTICE 'Admin user not found. Please ensure admin@f4crm.com exists in the profiles table.';
    END IF;
END
$$; 