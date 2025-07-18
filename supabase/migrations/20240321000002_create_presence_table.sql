-- Create presence table
CREATE TABLE IF NOT EXISTS presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all presence records"
  ON presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence"
  ON presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_presence_updated_at
  BEFORE UPDATE ON presence
  FOR EACH ROW
  EXECUTE FUNCTION update_presence_updated_at();

-- Create function to handle user presence
CREATE OR REPLACE FUNCTION handle_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update presence record
  INSERT INTO presence (user_id, status, last_seen)
  VALUES (NEW.id, 'online', CURRENT_TIMESTAMP)
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = 'online',
    last_seen = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user presence
CREATE TRIGGER handle_user_presence
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_presence(); 