-- Add team hierarchy fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role varchar(255),
ADD COLUMN IF NOT EXISTS department varchar(255),
ADD COLUMN IF NOT EXISTS reports_to uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS phone varchar(255),
ADD COLUMN IF NOT EXISTS joined_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

-- Add an index on reports_to for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_profiles_reports_to ON profiles(reports_to);

-- Create a function to get all reports (direct and indirect) for a given user
CREATE OR REPLACE FUNCTION get_all_reports(user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  role text,
  department text,
  reports_to uuid,
  level int
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY WITH RECURSIVE subordinates AS (
    -- Base case: direct reports
    SELECT 
      p.id,
      p.full_name,
      p.email,
      p.role,
      p.department,
      p.reports_to,
      1 as level
    FROM profiles p
    WHERE p.reports_to = user_id

    UNION ALL

    -- Recursive case: reports of reports
    SELECT 
      p.id,
      p.full_name,
      p.email,
      p.role,
      p.department,
      p.reports_to,
      s.level + 1
    FROM profiles p
    INNER JOIN subordinates s ON p.reports_to = s.id
  )
  SELECT * FROM subordinates ORDER BY level, full_name;
END;
$$; 