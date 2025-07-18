-- Migration: 014_add_task_delete_policy.sql
-- Purpose: Add delete policy for tasks table
-- Depends on: 004_create_tasks_table.sql
-- Date: 2024-06-09

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Add policy for deleting tasks
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to
);

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 