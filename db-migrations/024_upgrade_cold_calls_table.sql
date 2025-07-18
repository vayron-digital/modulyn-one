-- Migration: 031_upgrade_cold_calls_table.sql
-- Purpose: Add new fields and indexes to cold_calls table for Cold Calls module
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Upgrade cold_calls table for Cold Calls module
ALTER TABLE cold_calls
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS source VARCHAR(100),
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS priority VARCHAR(50),
    ADD COLUMN IF NOT EXISTS comments TEXT,
    ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS is_converted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS converted_by UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_cold_calls_status ON cold_calls(status);
CREATE INDEX IF NOT EXISTS idx_cold_calls_agent_id ON cold_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_cold_calls_is_converted ON cold_calls(is_converted);