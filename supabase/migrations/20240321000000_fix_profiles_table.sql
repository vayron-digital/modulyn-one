-- Fix profiles table structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN email TEXT;
    END IF;

    -- Ensure all required columns have correct types and defaults
    ALTER TABLE public.profiles
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN role SET DEFAULT 'agent',
    ALTER COLUMN is_admin SET DEFAULT false,
    ALTER COLUMN is_active SET DEFAULT true;

    -- Update email from auth.users if it's null
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id
    AND p.email IS NULL;

    -- Make email NOT NULL after populating it
    ALTER TABLE public.profiles
    ALTER COLUMN email SET NOT NULL;

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
    CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
    CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON profiles(is_active);
END;
$$; 