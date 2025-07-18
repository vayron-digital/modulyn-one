-- Migration: 030_brochures_rls.sql
-- Purpose: Add RLS policies for brochures table
-- Depends on: 029_create_brochures_table.sql
-- Date: 2024-06-09

-- Enable RLS on brochures
ALTER TABLE brochures ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert
CREATE POLICY "Allow insert for authenticated users" ON brochures
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by); 