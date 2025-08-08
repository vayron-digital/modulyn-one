-- Migration: Add primary_location to tenants table
-- This will be used to determine property type options based on location

-- Add primary_location column to tenants table
ALTER TABLE tenants 
ADD COLUMN primary_location VARCHAR(100);

-- Create an enum for primary locations (optional - for validation)
CREATE TYPE tenant_location AS ENUM (
  'Dubai AE',
  'Fort Worth TX', 
  'Dallas TX',
  'Chicago IL',
  'New York NY',
  'Sharjah AE',
  'Ajman AE',
  'London UK',
  'Northamptonshire UK',
  'Other'
);

-- Update existing tenants with their primary locations
-- You can modify these based on your actual tenant data
UPDATE tenants 
SET primary_location = 'Dubai AE' 
WHERE id IN (
  SELECT DISTINCT tenant_id 
  FROM profiles 
  WHERE email LIKE '%@%' 
  LIMIT 1
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_primary_location ON tenants(primary_location);

-- Add comment for documentation
COMMENT ON COLUMN tenants.primary_location IS 'Primary location of the tenant, used to determine property type options (UAE vs USA)'; 