-- Migration: 012_create_notifications.sql
-- Purpose: Add notifications table, enums, RLS, policies, and notification functions
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- Create notification_type enum
CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_updated',
  'task_due_soon',
  'task_overdue',
  'task_commented',
  'task_status_changed',
  'task_priority_changed'
);

-- Create notification_status enum
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status notification_status NOT NULL DEFAULT 'unread',
    related_to_type TEXT CHECK (related_to_type IN ('task', 'lead', 'property', 'document')),
    related_to_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_related_to_type TEXT DEFAULT NULL,
  p_related_to_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    related_to_type,
    related_to_id,
    metadata
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_related_to_type,
    p_related_to_id,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'read',
      read_at = timezone('utc'::text, now())
  WHERE id = p_notification_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to archive notification
CREATE OR REPLACE FUNCTION archive_notification(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'archived',
      archived_at = timezone('utc'::text, now())
  WHERE id = p_notification_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 