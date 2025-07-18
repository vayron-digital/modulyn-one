-- Migration: 009_add_assigned_to_to_tasks.sql
-- Purpose: Add assigned_to column to tasks table
-- Depends on: 004_create_tasks_table.sql
-- Date: 2024-06-09

-- Add assigned_to and created_by columns to tasks table if they don't exist
DO $$ 
BEGIN
    -- Add assigned_to column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE tasks ADD COLUMN assigned_to UUID;
    END IF;

    -- Add created_by column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'created_by'
    ) THEN
        -- First add the column as nullable
        ALTER TABLE tasks ADD COLUMN created_by UUID;
        
        -- Update existing rows to use the first admin user as creator
        UPDATE tasks 
        SET created_by = (
            SELECT id 
            FROM profiles 
            WHERE is_admin = true 
            LIMIT 1
        );
        
        -- Now make the column NOT NULL
        ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;
    END IF;
END $$;

-- Drop any existing foreign key constraints
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop assigned_to constraints
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

    -- Drop created_by constraints
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'tasks'
        AND ccu.column_name = 'created_by'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Add foreign key constraints
ALTER TABLE tasks
    ADD CONSTRAINT tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

ALTER TABLE tasks
    ADD CONSTRAINT tasks_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their tasks and associated leads" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

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

CREATE POLICY "Users can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
    );

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 