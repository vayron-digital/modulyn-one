-- Enable RLS on leads table if not already enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their assigned leads" ON leads;
DROP POLICY IF EXISTS "Users can view leads they created" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;

-- Create a single comprehensive policy for viewing leads
CREATE POLICY "Users can view their leads"
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

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 