-- Migration: 018_create_or_update_report_functions.sql
-- Purpose: Create and update report functions for analytics (used in AllReports.tsx and admin dashboard)
-- Merges: 018_fix_report_functions.sql, 019_fix_report_functions_types.sql, 020_fix_report_functions_column_names.sql, 021_fix_report_functions_column_names.sql, 022_fix_report_functions_correct_columns.sql, 023_fix_report_functions_type_mismatch.sql, 024_fix_report_functions_correct_columns.sql
-- Date: 2024-06-09

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_leads_by_status(UUID);
DROP FUNCTION IF EXISTS get_calls_by_type(UUID);

-- Function: get_leads_by_status
-- Used in: frontend/src/pages/admin/AllReports.tsx (via supabase.rpc)
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
  WHERE l.created_by = $1 OR l.assigned_to = $1
  GROUP BY l.status;
END;
$$;

-- Function: get_calls_by_type
-- Used in: frontend/src/pages/admin/AllReports.tsx (via supabase.rpc)
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
  WHERE c.created_by = $1
  GROUP BY c.call_type;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_leads_by_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calls_by_type(UUID) TO authenticated;

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema'; 