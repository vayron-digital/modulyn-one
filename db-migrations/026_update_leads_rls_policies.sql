-- Migration: 026_update_leads_rls_policies.sql
-- Purpose: Update/finalize RLS policies for leads table (referenced throughout the app)
-- Merges: 026_fix_leads_rls_policies.sql, 027_fix_leads_rls_policies_v3.sql, 028_fix_leads_rls_policies_v4.sql
-- Date: 2024-06-09

-- Drop all existing policies for leads table
DROP POLICY IF EXISTS "Users can view their assigned leads" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Agents can view their assigned leads" ON leads;

-- Add final, correct policies
-- Used in: frontend/src/pages/leads, backend/src/routes/leads, etc.
CREATE POLICY "Agents can view their assigned leads"
    ON leads FOR SELECT
    USING (assigned_to = auth.uid());

CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Add/adjust more policies as needed for your app's logic 