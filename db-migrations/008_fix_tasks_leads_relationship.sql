-- Migration: 008_fix_tasks_leads_relationship.sql
-- Purpose: Fix relationship between tasks and leads tables
-- Depends on: 004_create_tasks_table.sql, 001_initial_schema.sql
-- Date: 2024-06-09

-- First, ensure both tables exist
DO $$ 
BEGIN
    -- Create tasks table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        CREATE TABLE tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            due_date TIMESTAMP WITH TIME ZONE,
            status TEXT NOT NULL DEFAULT 'pending',
            priority TEXT NOT NULL DEFAULT 'medium',
            lead_id UUID,
            assigned_to UUID,
            created_by UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create leads table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        CREATE TABLE leads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            status TEXT NOT NULL DEFAULT 'new',
            assigned_to UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Drop existing foreign key constraints if they exist
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop tasks to leads constraint
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'tasks'
        AND ccu.column_name = 'lead_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;

    -- Drop tasks to profiles constraint
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'tasks'
        AND ccu.column_name = 'assigned_to'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Add foreign key constraints
ALTER TABLE tasks
    ADD CONSTRAINT tasks_lead_id_fkey
    FOREIGN KEY (lead_id)
    REFERENCES leads(id)
    ON DELETE SET NULL;

ALTER TABLE tasks
    ADD CONSTRAINT tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "Admins can do everything with tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their tasks and associated leads" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks for their leads" ON tasks;

-- Create new policies
CREATE POLICY "Admins can do everything with tasks"
    ON tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can view their tasks and associated leads"
    ON tasks FOR SELECT
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = tasks.lead_id
            AND leads.assigned_to = auth.uid()
        )
    );

CREATE POLICY "Users can update their tasks"
    ON tasks FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can create tasks for their leads"
    ON tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = tasks.lead_id
            AND (leads.assigned_to = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM profiles
                     WHERE profiles.id = auth.uid()
                     AND profiles.is_admin = true
                 ))
        )
    );

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 