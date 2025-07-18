-- Migration: 016_add_property_fields.sql
-- Purpose: Add new fields to properties table
-- Depends on: 002_add_properties_table.sql
-- Date: 2024-06-09

-- Migration: Add all required columns to properties table for new CRM features

ALTER TABLE properties
  -- Hero/Stats fields
  ADD COLUMN IF NOT EXISTS market_cap NUMERIC,
  ADD COLUMN IF NOT EXISTS token_nav NUMERIC,
  ADD COLUMN IF NOT EXISTS current_price NUMERIC,
  ADD COLUMN IF NOT EXISTS floor_size NUMERIC,
  ADD COLUMN IF NOT EXISTS iro_sale_price NUMERIC,
  ADD COLUMN IF NOT EXISTS iro_participants INTEGER,
  ADD COLUMN IF NOT EXISTS distance TEXT,

  -- Features & Description
  ADD COLUMN IF NOT EXISTS features TEXT[], -- Array of bullet points
  ADD COLUMN IF NOT EXISTS full_description TEXT,

  -- Owner/Contact
  ADD COLUMN IF NOT EXISTS owner TEXT,
  ADD COLUMN IF NOT EXISTS contact TEXT,

  -- Documents (brochures, floor plans, etc.)
  ADD COLUMN IF NOT EXISTS documents JSONB, -- [{name: 'Brochure', url: '...'}, ...]

  -- Tags/Custom
  ADD COLUMN IF NOT EXISTS tags TEXT[],

  -- Neighborhood/Location Info
  ADD COLUMN IF NOT EXISTS neighborhood_info JSONB, -- {schools: '', transport: '', ...}

  -- Virtual Tour/Media
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,

  -- Integration/Automation
  ADD COLUMN IF NOT EXISTS mls_id TEXT,
  ADD COLUMN IF NOT EXISTS portal_sync BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activity_log JSONB, -- [{action: '', user: '', timestamp: ''}, ...]

  -- Status/Meta
  ADD COLUMN IF NOT EXISTS listing_status TEXT, -- e.g. available, sold, under_offer
  ADD COLUMN IF NOT EXISTS listing_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW();

-- Indexes for fast search/filtering
CREATE INDEX IF NOT EXISTS idx_properties_tags ON properties USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties (listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties (owner); 