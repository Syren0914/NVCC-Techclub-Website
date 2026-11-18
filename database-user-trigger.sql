-- Database Trigger for Automatic User Profile Creation
-- This trigger automatically creates a user profile when a new user signs up

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the new user
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Member'),
    NEW.email,
    NOW(),
    NOW()
  );
  
  -- Assign default member role
  INSERT INTO user_roles (
    user_id,
    role,
    assigned_at,
    is_active,
    permissions
  ) VALUES (
    NEW.id,
    'member',
    NOW(),
    true,
    ARRAY[
      'view_events',
      'join_events',
      'view_resources',
      'participate_leetcode',
      'view_projects',
      'submit_feedback'
    ]
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete user profile
  DELETE FROM profiles WHERE id = OLD.id;
  
  -- Delete user roles
  DELETE FROM user_roles WHERE user_id = OLD.id;
  
  -- Delete user notifications
  DELETE FROM notifications WHERE user_id = OLD.id;
  
  -- Delete user activities
  DELETE FROM activities WHERE user_id = OLD.id;
  
  -- Delete user projects
  DELETE FROM projects WHERE user_id = OLD.id;
  
  -- Delete user leetcode progress
  DELETE FROM leetcode_progress WHERE user_id = OLD.id;
  
  -- Delete user leetcode stats
  DELETE FROM leetcode_user_stats WHERE user_id = OLD.id;
  
  -- Delete user feedback
  DELETE FROM feedback WHERE user_id = OLD.id;
  
  -- Delete event attendees
  DELETE FROM event_attendees WHERE user_id = OLD.id;
  
  -- Delete workshop enrollments
  DELETE FROM workshop_enrollments WHERE user_id = OLD.id;
  
  -- Delete resource views
  DELETE FROM resource_views WHERE user_id = OLD.id;
  
  -- Delete resource ratings
  DELETE FROM resource_ratings WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the deletion trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_deletion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for user_roles table
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Test the trigger (optional)
-- This will create a test user profile if needed
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- ); 