-- Migration: 025_add_dumped_leads.sql
-- Purpose: Add dumped leads functionality to leads table (referenced in DumpedLeads.tsx)
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Add dumped_at column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS dumped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dumped_by UUID REFERENCES auth.users(id);

-- Create dumped_leads view
CREATE OR REPLACE VIEW dumped_leads AS
SELECT 
    l.*,
    u.email as dumped_by_email,
    u.full_name as dumped_by_name
FROM leads l
LEFT JOIN auth.users u ON l.dumped_by = u.id
WHERE l.dumped_at IS NOT NULL;

-- Create RLS policies for dumped leads
CREATE POLICY "Users can view their own dumped leads"
    ON leads FOR SELECT
    USING (
        (auth.uid() = dumped_by) OR
        (EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        ))
    );

CREATE POLICY "Users can dump their own leads"
    ON leads FOR UPDATE
    USING (
        (auth.uid() = created_by) OR
        (auth.uid() = assigned_to) OR
        (EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        ))
    )
    WITH CHECK (
        (auth.uid() = created_by) OR
        (auth.uid() = assigned_to) OR
        (EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        ))
    );

-- Create function to dump a lead
CREATE OR REPLACE FUNCTION dump_lead(lead_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE leads
    SET 
        dumped_at = CURRENT_TIMESTAMP,
        dumped_by = auth.uid()
    WHERE id = lead_id;
END;
$$;

-- Create function to recover a dumped lead
CREATE OR REPLACE FUNCTION recover_lead(lead_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE leads
    SET 
        dumped_at = NULL,
        dumped_by = NULL
    WHERE id = lead_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION dump_lead(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recover_lead(UUID) TO authenticated;

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 