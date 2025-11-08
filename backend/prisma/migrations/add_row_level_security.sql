-- Enable Row-Level Security for sensitive tables
-- This migration adds RLS policies to ensure data isolation between users

-- Enable RLS on cutting_lists
ALTER TABLE cutting_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cutting lists
CREATE POLICY cutting_list_user_isolation ON cutting_lists
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE)::text);

-- Enable RLS on optimizations
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own optimizations
CREATE POLICY optimization_user_isolation ON optimizations
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE)::text);

-- Enable RLS on user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activities
CREATE POLICY user_activity_user_isolation ON user_activities
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE)::text);

-- Admin bypass policy (for superuser operations)
-- Admins can see all data when app.user_role = 'admin'
CREATE POLICY cutting_list_admin_access ON cutting_lists
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY optimization_admin_access ON optimizations
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.user_role', TRUE) = 'admin');

CREATE POLICY user_activity_admin_access ON user_activities
  FOR ALL
  TO PUBLIC
  USING (current_setting('app.user_role', TRUE) = 'admin');

-- Function to set user context (called at the start of each request)
CREATE OR REPLACE FUNCTION set_user_context(p_user_id text, p_user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id, FALSE);
  PERFORM set_config('app.user_role', p_user_role, FALSE);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION set_user_context(text, text) TO lemnix_user;

COMMENT ON POLICY cutting_list_user_isolation ON cutting_lists IS 
  'Ensures users can only access their own cutting lists';
COMMENT ON POLICY optimization_user_isolation ON optimizations IS 
  'Ensures users can only access their own optimizations';
COMMENT ON POLICY user_activity_user_isolation ON user_activities IS 
  'Ensures users can only access their own activity logs';

