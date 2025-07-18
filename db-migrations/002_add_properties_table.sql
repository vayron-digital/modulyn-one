-- Migration: 002_add_properties_table.sql
-- Purpose: Add properties table, enums, RLS, and policies
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Create property type enum
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'land');

-- Create property status enum
CREATE TYPE property_status AS ENUM ('available', 'pending', 'sold', 'off_market');

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    status property_status NOT NULL DEFAULT 'available',
    type property_type NOT NULL,
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_footage INTEGER,
    year_built INTEGER,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Properties are viewable by everyone"
    ON properties FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert properties"
    ON properties FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update properties"
    ON properties FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete properties"
    ON properties FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create trigger for updating timestamps
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 