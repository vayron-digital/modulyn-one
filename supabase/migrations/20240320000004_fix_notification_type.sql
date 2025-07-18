-- Drop the existing function
DROP FUNCTION IF EXISTS create_notification;

-- Recreate the function with the correct parameter name
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