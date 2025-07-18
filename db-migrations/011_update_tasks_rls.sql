-- Migration: 011_update_tasks_rls.sql
-- Purpose: Update RLS policies for tasks table
-- Depends on: 004_create_tasks_table.sql
-- Date: 2024-06-09

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

-- Create new policies
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 