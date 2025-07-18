-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their assigned leads" ON leads;
DROP POLICY IF EXISTS "Users can view leads they created" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;

-- Create new policies
CREATE POLICY "Users can view their assigned leads"
    ON leads FOR SELECT
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can view leads they created"
    ON leads FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 