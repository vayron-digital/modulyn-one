-- Migration: 006_update_tasks_policies.sql
-- Purpose: Update RLS policies for tasks table
-- Depends on: 004_create_tasks_table.sql
-- Date: 2024-06-09

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything with tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

-- Create new policies with proper lead access
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