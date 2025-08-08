-- Migration: Expand property_status enum with USA-specific real estate statuses
-- This migration adds comprehensive property status options for USA markets

-- First, create a new enum with all the detailed USA statuses
CREATE TYPE property_status_detailed AS ENUM (
  -- USA Active Statuses
  'active',
  'coming_soon',
  'active_under_contract',
  'pending',
  'contingent',
  
  -- USA Closed Statuses
  'sold',
  'leased_rented',
  
  -- USA Inactive Statuses
  'withdrawn',
  'expired',
  'canceled',
  'temporarily_off_market',
  
  -- Legacy/International Statuses (keeping for backward compatibility)
  'available',
  'off_market'
);

-- Add the new column to properties table
ALTER TABLE properties ADD COLUMN property_status_detailed property_status_detailed;

-- Create an index on the new column
CREATE INDEX IF NOT EXISTS idx_properties_status_detailed ON properties(property_status_detailed);

-- Add comment for documentation
COMMENT ON COLUMN properties.property_status_detailed IS 'Detailed property status classification for location-specific statuses (USA, UAE, UK)';

-- Update existing properties to have a default detailed status based on their current status
UPDATE properties 
SET property_status_detailed = 
  CASE 
    WHEN status = 'available' THEN 'active'::property_status_detailed
    WHEN status = 'pending' THEN 'pending'::property_status_detailed
    WHEN status = 'sold' THEN 'sold'::property_status_detailed
    WHEN status = 'off_market' THEN 'temporarily_off_market'::property_status_detailed
    ELSE 'active'::property_status_detailed
  END
WHERE property_status_detailed IS NULL;

-- Make the new column NOT NULL after setting defaults
ALTER TABLE properties ALTER COLUMN property_status_detailed SET NOT NULL;

-- Create a function to get property statuses by location
CREATE OR REPLACE FUNCTION get_property_statuses_by_location(location VARCHAR(100))
RETURNS TABLE(status_value property_status_detailed, status_label TEXT, category TEXT) AS $$
BEGIN
  -- USA Locations
  IF location LIKE '%TX%' OR location LIKE '%CA%' OR location LIKE '%NY%' OR 
     location LIKE '%IL%' OR location LIKE '%PA%' OR location LIKE '%AZ%' OR
     location LIKE '%FL%' OR location LIKE '%GA%' OR location LIKE '%NC%' THEN
    RETURN QUERY VALUES
      ('active'::property_status_detailed, 'Active', 'Active'),
      ('coming_soon'::property_status_detailed, 'Coming Soon', 'Active'),
      ('active_under_contract'::property_status_detailed, 'Active Under Contract / Pending', 'Active'),
      ('contingent'::property_status_detailed, 'Contingent', 'Active'),
      ('sold'::property_status_detailed, 'Sold', 'Closed'),
      ('leased_rented'::property_status_detailed, 'Leased / Rented', 'Closed'),
      ('withdrawn'::property_status_detailed, 'Withdrawn', 'Inactive'),
      ('expired'::property_status_detailed, 'Expired', 'Inactive'),
      ('canceled'::property_status_detailed, 'Canceled', 'Inactive'),
      ('temporarily_off_market'::property_status_detailed, 'Temporarily Off Market', 'Inactive');
  
  -- UAE Locations
  ELSIF location LIKE '%AE%' THEN
    RETURN QUERY VALUES
      ('available'::property_status_detailed, 'Available', 'Active'),
      ('pending'::property_status_detailed, 'Pending', 'Active'),
      ('sold'::property_status_detailed, 'Sold', 'Closed'),
      ('off_market'::property_status_detailed, 'Off Market', 'Inactive');
  
  -- UK Locations
  ELSIF location LIKE '%UK%' THEN
    RETURN QUERY VALUES
      ('available'::property_status_detailed, 'Available', 'Active'),
      ('pending'::property_status_detailed, 'Under Offer', 'Active'),
      ('sold'::property_status_detailed, 'Sold', 'Closed'),
      ('leased_rented'::property_status_detailed, 'Let', 'Closed'),
      ('withdrawn'::property_status_detailed, 'Withdrawn', 'Inactive'),
      ('off_market'::property_status_detailed, 'Off Market', 'Inactive');
  
  -- Default fallback
  ELSE
    RETURN QUERY VALUES
      ('available'::property_status_detailed, 'Available', 'Active'),
      ('pending'::property_status_detailed, 'Pending', 'Active'),
      ('sold'::property_status_detailed, 'Sold', 'Closed'),
      ('off_market'::property_status_detailed, 'Off Market', 'Inactive');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_property_statuses_by_location(VARCHAR) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_property_statuses_by_location(VARCHAR) IS 'Returns property statuses appropriate for a given location (USA, UAE, UK)'; 