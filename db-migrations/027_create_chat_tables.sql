-- Migration: 027_create_chat_tables.sql
-- Purpose: Add chat tables for real-time messaging, attachments, and sharing CRM entities
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Chat Threads
CREATE TABLE IF NOT EXISTS chat_threads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Comma-separated user IDs for now (normalize later if needed)
    participants TEXT NOT NULL
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'text', -- text, file, lead, event, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- For quick lookup
    is_read BOOLEAN DEFAULT FALSE
);

-- Chat Attachments
CREATE TABLE IF NOT EXISTS chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT,
    meta JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Entities (leads, events, docs, etc.)
CREATE TABLE IF NOT EXISTS chat_shared_entities (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- lead, event, property, document, etc.
    entity_id TEXT NOT NULL,
    action TEXT, -- share, transfer, invite
    meta JSONB,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 