-- Migration: 035_create_team_revenue_tracking.sql
-- Purpose: Track team revenue targets and actuals per month
-- Depends on: 034_create_teams_and_hierarchy.sql
-- Date: 2024-06-09

CREATE TABLE IF NOT EXISTS team_revenue_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    revenue_target NUMERIC(16,2) NOT NULL DEFAULT 0,
    revenue_actual NUMERIC(16,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_month UNIQUE (team_id, month)
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_team_revenue_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_team_revenue_tracking_updated_at ON team_revenue_tracking;
CREATE TRIGGER trg_update_team_revenue_tracking_updated_at
    BEFORE UPDATE ON team_revenue_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_team_revenue_tracking_updated_at(); 