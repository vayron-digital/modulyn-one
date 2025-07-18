-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents can view their own cold calls" ON cold_calls;
DROP POLICY IF EXISTS "Admins can view all cold calls" ON cold_calls;

-- Create new policies for cold_calls
CREATE POLICY "Agents can view their own cold calls"
    ON cold_calls FOR SELECT
    USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all cold calls"
    ON cold_calls FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'Administrator'
    ));

CREATE POLICY "Agents can insert their own cold calls"
    ON cold_calls FOR INSERT
    WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Admins can insert cold calls"
    ON cold_calls FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'Administrator'
    ));

CREATE POLICY "Agents can update their own cold calls"
    ON cold_calls FOR UPDATE
    USING (agent_id = auth.uid());

CREATE POLICY "Admins can update all cold calls"
    ON cold_calls FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'Administrator'
    ));

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON cold_calls TO authenticated; 