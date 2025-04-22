/*
  # Add admin flag and cleanup functionality
  
  1. Changes
    - Add admin column to users table
    - Add last_login column to users table
    - Add cleanup function for inactive users
    - Add cleanup function for completed progress
  
  2. Security
    - Add policies for admin access
*/

-- Add admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT now();


-- Function to cleanup inactive users (14 days)
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM user_progress
  WHERE user_id IN (
    SELECT id FROM users
    WHERE last_login < now() - INTERVAL '14 days'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup completed progress
CREATE OR REPLACE FUNCTION cleanup_completed_progress()
RETURNS void AS $$
BEGIN
  DELETE FROM user_progress
  WHERE current_step = 'results'
  AND updated_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

create extension if not exists pg_cron;

-- Create scheduled jobs for cleanup
SELECT cron.schedule(
  'cleanup-inactive-users',
  '0 0 * * *', -- Run daily at midnight
  'SELECT cleanup_inactive_users()'
);

SELECT cron.schedule(
  'cleanup-completed-progress',
  '*/15 * * * *', -- Run every 15 minutes
  'SELECT cleanup_completed_progress()'
);

-- Admin policies
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (is_admin = true);

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE TO authenticated
  USING (is_admin = true);

CREATE POLICY "Admins can read all progress" ON user_progress
  FOR SELECT TO authenticated
  USING (is_admin = true);

CREATE POLICY "Admins can update all progress" ON user_progress
  FOR UPDATE TO authenticated
  USING (is_admin = true);