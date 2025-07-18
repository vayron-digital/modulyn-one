-- Ensure admin user has proper privileges
DO $$
BEGIN
    -- Update the admin user's privileges
    UPDATE profiles 
    SET 
        is_admin = true,
        role = 'Administrator'
    WHERE email = 'admin@f4crm.com';

    -- If no rows were updated, create the admin user
    IF NOT FOUND THEN
        INSERT INTO profiles (
            id,
            full_name,
            email,
            role,
            is_admin
        ) VALUES (
            uuid_generate_v4(),
            'System Administrator',
            'admin@f4crm.com',
            'Administrator',
            true
        );
    END IF;
END
$$; 