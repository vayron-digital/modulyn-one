-- Ensure profiles table has correct structure
DO $$
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;

    -- Ensure is_admin has correct default
    ALTER TABLE public.profiles
    ALTER COLUMN is_admin SET DEFAULT false;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN role VARCHAR(255);
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN full_name VARCHAR(255);
    END IF;

    -- Ensure the primary key is set to id
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'profiles'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.profiles
        ADD PRIMARY KEY (id);
    END IF;
END;
$$; 