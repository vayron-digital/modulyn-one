-- Migration: 013_add_notification_insert_policy.sql
-- Purpose: Add insert policy for notifications table
-- Depends on: 012_create_notifications.sql
-- Date: 2024-06-09

-- Add policy for inserting notifications
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 