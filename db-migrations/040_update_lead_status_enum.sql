-- Migration: 040_update_lead_status_enum.sql
-- Purpose: Update lead_status enum to match frontend pipeline stages
-- Date: 2024-12-19

-- First, we need to update any existing leads to use the new status values
-- Map old values to new ones
UPDATE leads SET status = 'new' WHERE status = 'active';
UPDATE leads SET status = 'contacted' WHERE status = 'warm';
UPDATE leads SET status = 'qualified' WHERE status = 'hot';
UPDATE leads SET status = 'closed_won' WHERE status = 'closed';
-- 'dumped' stays as 'dumped' or we can map it to 'closed_lost'

-- Drop the old enum type (this will fail if there are still references)
-- We need to temporarily change the column type to text first
ALTER TABLE leads ALTER COLUMN status TYPE TEXT;

-- Drop the old enum
DROP TYPE IF EXISTS lead_status;

-- Create the new enum with pipeline stages
CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted', 
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
  'dumped'
);

-- Convert the text column back to the new enum
ALTER TABLE leads ALTER COLUMN status TYPE lead_status USING status::lead_status;

-- Set default value
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

-- Add comment for documentation
COMMENT ON TYPE lead_status IS 'Pipeline stages for leads: new, contacted, qualified, proposal, negotiation, closed_won, closed_lost, dumped'; 