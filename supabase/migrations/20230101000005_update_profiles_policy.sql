-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a new policy that allows authenticated users to view all profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);  -- This allows any authenticated user to view all profiles

-- Keep the existing update and insert policies restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id); 