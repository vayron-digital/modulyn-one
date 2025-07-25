-- Create journey_columns table for custom columns per board
CREATE TABLE IF NOT EXISTS journey_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add column_id to journey_cards
ALTER TABLE journey_cards ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES journey_columns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_journey_cards_column_id ON journey_cards(column_id);

-- For migration: Optionally, backfill existing cards to a default column per journey if needed. 