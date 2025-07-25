-- Update lead_status enum to match frontend pipeline stages
-- Run this in your Supabase SQL editor

-- Step 1: Fix problematic follow_up_date values first (set past dates to NULL)
UPDATE leads SET follow_up_date = NULL WHERE follow_up_date <= NOW();

-- Step 2: Temporarily disable the follow_up_date check constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_follow_up_date_check;

-- Step 3: Remove the default value that depends on the enum
ALTER TABLE leads ALTER COLUMN status DROP DEFAULT;

-- Step 4: Temporarily change column type to text (so we can update to any value)
ALTER TABLE leads ALTER COLUMN status TYPE TEXT;

-- Step 5: Update existing leads to use new status values
UPDATE leads SET status = 'new' WHERE status = 'active';
UPDATE leads SET status = 'contacted' WHERE status = 'warm';
UPDATE leads SET status = 'qualified' WHERE status = 'hot';
UPDATE leads SET status = 'closed_won' WHERE status = 'closed';
-- 'dumped' stays as 'dumped'

-- Step 6: Drop the old enum
DROP TYPE IF EXISTS lead_status;

-- Step 7: Create the new enum with pipeline stages
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

-- Step 8: Convert the text column back to the new enum
ALTER TABLE leads ALTER COLUMN status TYPE lead_status USING status::lead_status;

-- Step 9: Set default value
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

-- Step 10: Re-add the follow_up_date check constraint (allowing null values)
ALTER TABLE leads ADD CONSTRAINT leads_follow_up_date_check 
  CHECK (follow_up_date IS NULL OR follow_up_date > NOW()); 