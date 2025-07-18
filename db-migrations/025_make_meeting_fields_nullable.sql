-- Migration: 20240608_make_meeting_fields_nullable.sql
-- Purpose: Make lead_id, created_by, and attendees columns nullable in meetings table
-- Depends on: (specify if any)
-- Date: 2024-06-09

ALTER TABLE public.meetings 
  ALTER COLUMN lead_id DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN attendees DROP NOT NULL,
  ALTER COLUMN attendees SET DEFAULT NULL; 
