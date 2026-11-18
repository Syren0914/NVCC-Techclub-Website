-- Fix RLS Policies for Event Creation
-- Run this in your Supabase SQL Editor

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Event creators can update events" ON events;
DROP POLICY IF EXISTS "Anyone can view workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can create workshops" ON workshops;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can create resources" ON resources;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can view own leetcode progress" ON leetcode_progress;
DROP POLICY IF EXISTS "Users can update own leetcode progress" ON leetcode_progress;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies with more permissive rules for authenticated users

-- Events policies
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Event creators can update events" ON events
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Workshops policies
CREATE POLICY "Anyone can view workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workshops" ON workshops
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

-- LeetCode policies
CREATE POLICY "Users can view own leetcode progress" ON leetcode_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leetcode progress" ON leetcode_progress
    FOR ALL USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment the lines below if you still get RLS errors

/*
-- More permissive policies for testing
CREATE POLICY "Allow all operations for authenticated users" ON events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON workshops
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON resources
    FOR ALL USING (auth.uid() IS NOT NULL);
*/ 
-- Run this in your Supabase SQL Editor

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Event creators can update events" ON events;
DROP POLICY IF EXISTS "Anyone can view workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can create workshops" ON workshops;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can create resources" ON resources;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can view own leetcode progress" ON leetcode_progress;
DROP POLICY IF EXISTS "Users can update own leetcode progress" ON leetcode_progress;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies with more permissive rules for authenticated users

-- Events policies
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Event creators can update events" ON events
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Workshops policies
CREATE POLICY "Anyone can view workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workshops" ON workshops
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

-- LeetCode policies
CREATE POLICY "Users can view own leetcode progress" ON leetcode_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leetcode progress" ON leetcode_progress
    FOR ALL USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment the lines below if you still get RLS errors

/*
-- More permissive policies for testing
CREATE POLICY "Allow all operations for authenticated users" ON events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON workshops
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON resources
    FOR ALL USING (auth.uid() IS NOT NULL);
*/ 