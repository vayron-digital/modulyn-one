-- Update existing tenants with their primary locations
-- Run this after applying the migration

-- Update your current tenant (replace with actual tenant ID if needed)
UPDATE tenants 
SET primary_location = 'Dubai AE' 
WHERE id = (
  SELECT DISTINCT tenant_id 
  FROM profiles 
  WHERE email = 'syedmaarifhk@gmail.com'
  LIMIT 1
);

-- Or update all tenants with a default location
-- UPDATE tenants SET primary_location = 'Dubai AE' WHERE primary_location IS NULL;

-- Verify the update
SELECT id, name, primary_location FROM tenants; 