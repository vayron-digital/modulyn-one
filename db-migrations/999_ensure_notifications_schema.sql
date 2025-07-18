-- Migration: 999_ensure_notifications_schema.sql
-- Purpose: Ensure notifications system is fully set up for CRM
-- Date: 2024-06-09

-- 1. ENUMS for notification type and status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'lead_created',
      'lead_updated',
      'lead_dumped',
      'lead_assigned',
      'cold_call_assigned',
      'cold_call_updated',
      'task_assigned',
      'task_updated',
      'task_commented',
      'call_scheduled',
      'call_updated',
      'offer_created',
      'offer_status_changed',
      'reminder',
      'system'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');
  END IF;
END$$;

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'unread',
  related_to_type TEXT CHECK (related_to_type IN ('task', 'lead', 'property', 'document', 'cold_call', 'call', 'offer')),
  related_to_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RPC FUNCTIONS
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

-- 6. REFRESH SCHEMA CACHE (for PostgREST)
NOTIFY pgrst, 'reload schema'; 