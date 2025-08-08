-- Migration: Expand property_type enum to include detailed USA property types
-- This migration adds comprehensive property types for USA markets

-- First, create a new enum with all the detailed types
CREATE TYPE property_type_detailed AS ENUM (
  -- USA Residential Types
  'single-family-home',
  'condominium', 
  'townhouse',
  'multi-family-2-4',
  'multi-family-5-plus',
  'manufactured-mobile',
  'farm-ranch',
  
  -- USA Commercial Types
  'commercial-office',
  'commercial-retail', 
  'commercial-industrial',
  'commercial-hospitality',
  
  -- USA Land Types
  'land-residential',
  'land-commercial',
  'land-development',
  'land-agricultural',
  
  -- UAE/International Types (keeping existing ones)
  'apartment',
  'villa',
  'penthouse',
  'studio',
  'duplex',
  'office',
  'retail',
  'warehouse',
  'hotel',
  'restaurant',
  'land',
  
  -- UK Types
  'detached-house',
  'semi-detached-house',
  'terraced-house',
  'flat-apartment',
  'maisonette',
  'bungalow',
  'cottage',
  'mansion',
  
  -- Special Purpose
  'mixed-use',
  'special-purpose'
);

-- Add the new column to properties table
ALTER TABLE properties ADD COLUMN property_type_detailed property_type_detailed;

-- Create an index on the new column
CREATE INDEX IF NOT EXISTS idx_properties_type_detailed ON properties(property_type_detailed);

-- Add comment for documentation
COMMENT ON COLUMN properties.property_type_detailed IS 'Detailed property type classification for location-specific property types (USA, UAE, UK)';

-- Update existing properties to have a default detailed type based on their current type
UPDATE properties 
SET property_type_detailed = 
  CASE 
    WHEN type = 'residential' THEN 'apartment'::property_type_detailed
    WHEN type = 'commercial' THEN 'office'::property_type_detailed  
    WHEN type = 'land' THEN 'land'::property_type_detailed
    ELSE 'apartment'::property_type_detailed
  END
WHERE property_type_detailed IS NULL;

-- Make the new column NOT NULL after setting defaults
ALTER TABLE properties ALTER COLUMN property_type_detailed SET NOT NULL;

-- Create a function to get property types by location
CREATE OR REPLACE FUNCTION get_property_types_by_location(location VARCHAR(100))
RETURNS TABLE(type_value property_type_detailed, type_label TEXT, category TEXT) AS $$
BEGIN
  -- USA Locations
  IF location LIKE '%TX%' OR location LIKE '%CA%' OR location LIKE '%NY%' OR 
     location LIKE '%IL%' OR location LIKE '%PA%' OR location LIKE '%AZ%' OR
     location LIKE '%FL%' OR location LIKE '%GA%' OR location LIKE '%NC%' THEN
    RETURN QUERY VALUES
      ('single-family-home'::property_type_detailed, 'Single-Family Home', 'Residential'),
      ('condominium'::property_type_detailed, 'Condominium', 'Residential'),
      ('townhouse'::property_type_detailed, 'Townhouse', 'Residential'),
      ('multi-family-2-4'::property_type_detailed, 'Multi-Family (2-4 Units)', 'Residential'),
      ('multi-family-5-plus'::property_type_detailed, 'Multi-Family (5+ Units / Apartment Complex)', 'Residential'),
      ('manufactured-mobile'::property_type_detailed, 'Manufactured/Mobile Home', 'Residential'),
      ('farm-ranch'::property_type_detailed, 'Farm/Ranch', 'Residential'),
      ('land-residential'::property_type_detailed, 'Land (Residential)', 'Land'),
      ('land-commercial'::property_type_detailed, 'Land (Commercial/Other)', 'Land'),
      ('commercial-office'::property_type_detailed, 'Commercial - Office', 'Commercial'),
      ('commercial-retail'::property_type_detailed, 'Commercial - Retail', 'Commercial'),
      ('commercial-industrial'::property_type_detailed, 'Commercial - Industrial', 'Commercial'),
      ('commercial-hospitality'::property_type_detailed, 'Commercial - Hospitality', 'Commercial'),
      ('mixed-use'::property_type_detailed, 'Mixed-Use', 'Special Purpose'),
      ('special-purpose'::property_type_detailed, 'Special Purpose', 'Special Purpose');
  
  -- UAE Locations
  ELSIF location LIKE '%AE%' THEN
    RETURN QUERY VALUES
      ('apartment'::property_type_detailed, 'Apartment', 'Residential'),
      ('villa'::property_type_detailed, 'Villa', 'Residential'),
      ('penthouse'::property_type_detailed, 'Penthouse', 'Residential'),
      ('studio'::property_type_detailed, 'Studio', 'Residential'),
      ('duplex'::property_type_detailed, 'Duplex', 'Residential'),
      ('office'::property_type_detailed, 'Office', 'Commercial'),
      ('retail'::property_type_detailed, 'Retail', 'Commercial'),
      ('warehouse'::property_type_detailed, 'Warehouse', 'Commercial'),
      ('hotel'::property_type_detailed, 'Hotel', 'Commercial'),
      ('restaurant'::property_type_detailed, 'Restaurant', 'Commercial'),
      ('land'::property_type_detailed, 'Land', 'Land');
  
  -- UK Locations
  ELSIF location LIKE '%UK%' THEN
    RETURN QUERY VALUES
      ('detached-house'::property_type_detailed, 'Detached House', 'Residential'),
      ('semi-detached-house'::property_type_detailed, 'Semi-Detached House', 'Residential'),
      ('terraced-house'::property_type_detailed, 'Terraced House', 'Residential'),
      ('flat-apartment'::property_type_detailed, 'Flat/Apartment', 'Residential'),
      ('maisonette'::property_type_detailed, 'Maisonette', 'Residential'),
      ('bungalow'::property_type_detailed, 'Bungalow', 'Residential'),
      ('cottage'::property_type_detailed, 'Cottage', 'Residential'),
      ('mansion'::property_type_detailed, 'Mansion', 'Residential'),
      ('office'::property_type_detailed, 'Office', 'Commercial'),
      ('retail'::property_type_detailed, 'Retail', 'Commercial'),
      ('land'::property_type_detailed, 'Land', 'Land');
  
  -- Default fallback
  ELSE
    RETURN QUERY VALUES
      ('apartment'::property_type_detailed, 'Apartment', 'Residential'),
      ('villa'::property_type_detailed, 'Villa', 'Residential'),
      ('office'::property_type_detailed, 'Office', 'Commercial'),
      ('retail'::property_type_detailed, 'Retail', 'Commercial'),
      ('land'::property_type_detailed, 'Land', 'Land');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_property_types_by_location(VARCHAR) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_property_types_by_location(VARCHAR) IS 'Returns property types appropriate for a given location (USA, UAE, UK)'; 