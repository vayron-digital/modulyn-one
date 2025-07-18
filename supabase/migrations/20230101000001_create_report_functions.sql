-- Function to get leads by status
CREATE OR REPLACE FUNCTION get_leads_by_status(user_id UUID)
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT l.status, COUNT(*)::BIGINT
  FROM leads l
  WHERE l.user_id = $1
  GROUP BY l.status;
END;
$$;

-- Function to get calls by type
CREATE OR REPLACE FUNCTION get_calls_by_type(user_id UUID)
RETURNS TABLE (
  call_type TEXT,
  count BIGINT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.call_type, COUNT(*)::BIGINT
  FROM calls c
  WHERE c.user_id = $1
  GROUP BY c.call_type;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_leads_by_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calls_by_type(UUID) TO authenticated; 