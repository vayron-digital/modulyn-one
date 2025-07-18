-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lead', 'property', 'task', 'document')),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_type_idx ON activity_log(type);
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log(created_at);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_type TEXT,
  p_action TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_log (
    user_id,
    type,
    action,
    description,
    metadata
  ) VALUES (
    auth.uid(),
    p_type,
    p_action,
    p_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 