-- Migration: 004_create_tasks_table.sql
-- Purpose: Create tasks table, enums, RLS, and policies
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Create task status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    priority task_priority NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can do everything with tasks"
    ON tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Users can view tasks assigned to them"
    ON tasks FOR SELECT
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can update tasks assigned to them"
    ON tasks FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can create tasks"
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

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 