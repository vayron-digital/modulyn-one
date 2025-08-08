-- Convert task_status from enum to TEXT with CHECK constraint
-- This is much simpler and more flexible than using enums

-- 1. Drop the enum constraint and convert to TEXT
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ALTER COLUMN status TYPE TEXT;

-- 2. Add the correct check constraint for allowed values
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold'));

-- 3. Update default value
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Make sure it's NOT NULL
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;

-- 5. Do the same for priority (convert from enum to TEXT)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ALTER COLUMN priority TYPE TEXT;

-- 6. Add check constraint for priority
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 7. Update priority default
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';

-- 8. Make sure priority is NOT NULL
ALTER TABLE tasks ALTER COLUMN priority SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name IN ('status', 'priority'); 