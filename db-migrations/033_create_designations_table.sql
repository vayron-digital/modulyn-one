-- Migration: 033_create_designations_table.sql
-- Purpose: Create designations table for user employment info
-- Depends on: 032_add_extended_user_fields.sql
-- Date: 2024-06-09

CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_designations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_designations_updated_at ON designations;
CREATE TRIGGER trg_update_designations_updated_at
    BEFORE UPDATE ON designations
    FOR EACH ROW
    EXECUTE FUNCTION update_designations_updated_at(); 