-- Migration: 029_create_brochures_table.sql
-- Purpose: Create brochures table for property marketing
-- Depends on: 002_add_properties_table.sql
-- Date: 2024-06-09

-- Create brochures table
CREATE TABLE IF NOT EXISTS brochures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid,
  developer_name text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Optional: Add index for faster search
CREATE INDEX IF NOT EXISTS idx_brochures_developer_name ON brochures (developer_name);

-- Optional: Add foreign key if you have a developers table
-- ALTER TABLE brochures ADD CONSTRAINT fk_brochures_developer FOREIGN KEY (developer_id) REFERENCES developers(id); 