-- First, create the property_status enum type
DO $$ BEGIN
    CREATE TYPE property_status AS ENUM (
      -- Core Statuses
      'Available', 'Under Offer', 'Sold', 'Rented', 'Off Market',
      -- Development Statuses
      'Off-Plan', 'Under Construction', 'Completed', 'Delayed',
      -- Transactional Statuses
      'Reserved', 'Mortgaged', 'Restrained', 'Pending DLD Approval',
      -- Rental Statuses
      'Vacant', 'Leasehold', 'Active Rental Dispute',
      -- Market Statuses
      'Price Reduced', 'Exclusive Listing', 'Coming Soon'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the new status column with the enum type
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS status property_status NOT NULL DEFAULT 'Available';

-- Update existing records to use the new status values
UPDATE properties 
SET status = CASE 
  WHEN listing_status = 'available' THEN 'Available'::property_status
  WHEN listing_status = 'pending' THEN 'Under Offer'::property_status
  WHEN listing_status = 'sold' THEN 'Sold'::property_status
  WHEN listing_status = 'off_market' THEN 'Off Market'::property_status
  ELSE 'Available'::property_status
END
WHERE listing_status IS NOT NULL;

-- Finally, drop the old column
ALTER TABLE properties 
  DROP COLUMN IF EXISTS listing_status; 