-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'appointment')),
    start TIMESTAMP WITH TIME ZONE NOT NULL,
    "end" TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    color TEXT,
    recurring JSONB,
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on start and end dates for faster queries
CREATE INDEX IF NOT EXISTS events_start_idx ON events (start);
CREATE INDEX IF NOT EXISTS events_end_idx ON events ("end");

-- Create index on type and status for faster filtering
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);

-- Create index on assigned_to for faster lookups
CREATE INDEX IF NOT EXISTS events_assigned_to_idx ON events (assigned_to);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own events"
    ON events FOR SELECT
    USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can create their own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
    ON events FOR UPDATE
    USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own events"
    ON events FOR DELETE
    USING (auth.uid() = created_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
