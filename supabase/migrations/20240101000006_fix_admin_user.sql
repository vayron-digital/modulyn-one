-- Fix admin user profile
DO $$
DECLARE
    v_user_id UUID := '625d0787-d31b-4236-a09f-38fb23b993df'; -- The user ID from your console log
BEGIN
    -- First, ensure the profile exists for this user
    INSERT INTO public.profiles (id, full_name, role, is_admin)
    VALUES (v_user_id, 'System Administrator', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE 
    SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_admin = true;

    -- Verify the update
    RAISE NOTICE 'Updated profile for user %', v_user_id;
END;
$$; 