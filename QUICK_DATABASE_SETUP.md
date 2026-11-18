# 🚀 Quick Database Setup Guide

## 🎯 **Step-by-Step Solution**

The error `policy "Anyone can view events" for table "events" already exists` means some policies already exist. Here's how to fix it:

### **Step 1: Run the Clean Setup Script**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the contents of `database-clean-setup.sql`**
5. **Click "Run"**

This script will:
- ✅ Drop existing policies safely
- ✅ Drop existing tables safely  
- ✅ Create all tables with correct UUID types
- ✅ Set up proper RLS policies
- ✅ Add sample data
- ✅ Grant necessary permissions

### **Step 2: Verify the Setup**

After running the script, test with these queries:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if sample data exists
SELECT * FROM events LIMIT 5;
SELECT * FROM workshops LIMIT 5;
SELECT * FROM resources LIMIT 5;
```

### **Step 3: Test Your Dashboard**

1. **Refresh your dashboard page** (http://localhost:3002)
2. **Check the browser console** for success messages
3. **The dashboard should now load** with data

## 🔧 **If You Still Get Errors**

### **Option 1: Manual Clean Setup**
If the script doesn't work, run these commands one by one:

```sql
-- 1. Drop all policies first
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

-- 2. Drop all tables
DROP TABLE IF EXISTS resource_ratings CASCADE;
DROP TABLE IF EXISTS resource_views CASCADE;
DROP TABLE IF EXISTS workshop_enrollments CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS leetcode_progress CASCADE;
DROP TABLE IF EXISTS leetcode_user_stats CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Now run the complete setup script
-- Copy and paste the contents of database-clean-setup.sql
```

### **Option 2: Create Just Essential Tables**
If you want to start with just the basics:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'officer', 'vice_president', 'president')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- Create basic tables
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    start_time TIME,
    location VARCHAR(255),
    event_type VARCHAR(50) DEFAULT 'meeting',
    max_attendees INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    duration INTEGER,
    instructor VARCHAR(255),
    capacity INTEGER,
    category VARCHAR(100),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

-- Insert sample data
INSERT INTO events (title, description, start_date, start_time, location, event_type, max_attendees) VALUES
('Weekly Tech Club Meeting', 'Regular weekly meeting', '2024-12-15', '14:30:00', 'LC Building Room 302E', 'meeting', 50),
('Web Development Workshop', 'Learn React and Next.js', '2024-12-20', '15:00:00', 'Online', 'workshop', 100)
ON CONFLICT DO NOTHING;

INSERT INTO workshops (title, description, date, start_time, duration, instructor, capacity, category) VALUES
('React Hooks Deep Dive', 'Advanced React workshop', '2024-12-18', '16:00:00', 120, 'John Smith', 50, 'Web Development')
ON CONFLICT DO NOTHING;

INSERT INTO resources (title, description, category, url) VALUES
('React Best Practices', 'Comprehensive guide to React', 'Web Development', 'https://react.dev/learn'),
('Cybersecurity Fundamentals', 'Introduction to cybersecurity', 'Security', 'https://example.com/cybersecurity')
ON CONFLICT DO NOTHING;
```

## ✅ **Expected Result**

After running the setup:
- ✅ No more policy conflicts
- ✅ All tables created with correct UUID types
- ✅ Sample data loaded
- ✅ Dashboard loads without errors
- ✅ User profiles work properly

## 🔍 **Troubleshooting**

### **If you get "permission denied" errors:**
Make sure you're using the correct database user with proper permissions in your Supabase project.

### **If tables still don't exist:**
Check that you're running the script in the correct database (your Supabase project's database).

### **If the dashboard still shows errors:**
1. Check the browser console for specific error messages
2. Verify your environment variables are set correctly
3. Make sure your Supabase project is active

Your TechClub database should now be properly set up! 🎉 