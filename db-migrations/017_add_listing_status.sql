-- Migration: 017_add_listing_status.sql
-- Purpose: Add listing_status column to properties table
-- Depends on: 002_add_properties_table.sql
-- Date: 2024-06-09

-- Create property status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('available', 'pending', 'sold', 'off_market');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add listing_status column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE properties 
    ADD COLUMN listing_status property_status DEFAULT 'available';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties(listing_status);

-- Update existing records to have a default status
UPDATE properties 
SET listing_status = 'available' 
WHERE listing_status IS NULL;

-- Add comment to column
COMMENT ON COLUMN properties.listing_status IS 'Current status of the property listing'; 