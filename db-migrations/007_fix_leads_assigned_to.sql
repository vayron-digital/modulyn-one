-- Migration: 007_fix_leads_assigned_to.sql
-- Purpose: Fix assigned_to reference in leads table
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- First, check if assigned_to column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE leads ADD COLUMN assigned_to UUID;
    END IF;
END $$;

-- Drop any existing foreign key constraints on assigned_to
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'leads'
        AND ccu.column_name = 'assigned_to'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE leads DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Add the foreign key constraint to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'leads' 
        AND constraint_name = 'leads_assigned_to_fkey'
    ) THEN
        ALTER TABLE leads
            ADD CONSTRAINT leads_assigned_to_fkey
            FOREIGN KEY (assigned_to)
            REFERENCES profiles(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Agents can view their assigned leads" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;

CREATE POLICY "Agents can view their assigned leads"
    ON leads FOR SELECT
    USING (assigned_to = auth.uid());

CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )); 