-- Migration: Convert properties.developer_id from integer to uuid (matching developers.developer_id)
-- Date: 2024-06-09

-- 1. Add new UUID column to properties
ALTER TABLE properties ADD COLUMN developer_uuid uuid;

-- 2. Backfill UUIDs (requires mapping from old int id to new UUID)
-- If you have old_id on developers (mapping old int id to new UUID):
-- ALTER TABLE developers ADD COLUMN old_id integer;
-- -- Manually update old_id for each developer to match the old int id.

UPDATE properties
SET developer_uuid = d.developer_id
FROM developers d
WHERE properties.developer_id = d.old_id;

-- 3. Drop the old int column and rename the new one
ALTER TABLE properties DROP COLUMN developer_id;
ALTER TABLE properties RENAME COLUMN developer_uuid TO developer_id;

-- 4. Add the foreign key constraint
ALTER TABLE properties
  ADD CONSTRAINT fk_properties_developer
  FOREIGN KEY (developer_id)
  REFERENCES developers(developer_id);

-- 5. (Optional) Clean up old_id if you added it
-- ALTER TABLE developers DROP COLUMN old_id;

-- ---
-- If you have NO old data or don't care about old links, use this instead:
-- ALTER TABLE properties DROP COLUMN IF EXISTS developer_id;
-- ALTER TABLE properties ADD COLUMN developer_id uuid;
-- ALTER TABLE properties
--   ADD CONSTRAINT fk_properties_developer
--   FOREIGN KEY (developer_id)
--   REFERENCES developers(developer_id); 