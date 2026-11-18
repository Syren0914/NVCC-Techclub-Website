# 🗄️ Database Setup - Step by Step

## 🚨 **Current Issue**
The error `relation "profiles" does not exist` means the database tables haven't been created yet.

## ✅ **Solution: Create Database Tables**

### **Step 1: Go to Supabase Dashboard**
1. Open your browser
2. Go to [supabase.com](https://supabase.com)
3. Sign in to your account
4. Open your TechClub project

### **Step 2: Open SQL Editor**
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL query

### **Step 3: Run This SQL Script**
Copy and paste this **exact** SQL script into the query editor:

```sql
-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    leetcode_username VARCHAR(255),
    github_username VARCHAR(255),
    linkedin_url TEXT,
    website_url TEXT,
    major VARCHAR(255),
    graduation_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'officer', 'vice_president', 'president')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- Step 4: Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    event_type VARCHAR(50) DEFAULT 'meeting',
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration INTEGER,
    instructor VARCHAR(255),
    capacity INTEGER,
    enrolled INTEGER DEFAULT 0,
    category VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'beginner',
    materials_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(100),
    progress INTEGER DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'medium',
    deadline DATE,
    team_members TEXT[],
    github_url TEXT,
    live_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    url TEXT,
    file_url TEXT,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'general',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workshops" ON workshops
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

-- Step 12: Insert Sample Data
INSERT INTO events (title, description, start_date, start_time, location, event_type, max_attendees) VALUES
('Weekly Tech Club Meeting', 'Regular weekly meeting to discuss club activities and upcoming events', '2024-12-15', '14:30:00', 'LC Building Room 302E', 'meeting', 50),
('Web Development Workshop', 'Learn modern web development with React and Next.js', '2024-12-20', '15:00:00', 'Online', 'workshop', 100)
ON CONFLICT DO NOTHING;

INSERT INTO workshops (title, description, date, start_time, duration, instructor, capacity, category) VALUES
('React Hooks Deep Dive', 'Advanced React Hooks workshop covering custom hooks and state management', '2024-12-18', '16:00:00', 120, 'John Smith', 50, 'Web Development')
ON CONFLICT DO NOTHING;

INSERT INTO resources (title, description, category, url) VALUES
('React Best Practices', 'Comprehensive guide to React best practices and patterns', 'Web Development', 'https://react.dev/learn'),
('Cybersecurity Fundamentals', 'Introduction to cybersecurity concepts and practices', 'Security', 'https://example.com/cybersecurity')
ON CONFLICT DO NOTHING;

-- Step 13: Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

### **Step 4: Execute the Script**
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for the script to complete
3. You should see success messages

### **Step 5: Verify the Setup**
Run this query to check if tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see: `activities`, `events`, `notifications`, `profiles`, `projects`, `resources`, `user_roles`, `workshops`

### **Step 6: Test Your Dashboard**
1. Go back to your app: http://localhost:3002
2. Refresh the page
3. The dashboard should now load without errors

## 🔧 **If You Still Get Errors**

### **Error: "policy already exists"**
If you get policy conflicts, run this first:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Anyone can view workshops" ON workshops;
DROP POLICY IF EXISTS "Authenticated users can create workshops" ON workshops;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can create resources" ON resources;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
```

Then run the main script above.

### **Error: "table already exists"**
If tables already exist, run this first:

```sql
-- Drop existing tables
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

Then run the main script above.

## ✅ **Expected Result**

After running the script:
- ✅ All tables created successfully
- ✅ Sample data loaded
- ✅ RLS policies set up
- ✅ Dashboard loads without errors
- ✅ User profiles work properly

## 🎯 **Next Steps**

1. **Test the dashboard** - it should now load properly
2. **Try logging in** - user profiles should be created automatically
3. **Check all tabs** - Events, Projects, Resources, LeetCode, Devpost, Roles

Your TechClub database is now properly set up! 🚀 