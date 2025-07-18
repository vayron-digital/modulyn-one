-- Migration: 015_add_notification_remind_later.sql
-- Purpose: Add remind_later column to notifications table
-- Depends on: 012_create_notifications.sql
-- Date: 2024-06-09

-- Add remind_later column to notifications
ALTER TABLE notifications
ADD COLUMN remind_later TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_dismissed BOOLEAN DEFAULT FALSE;

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 