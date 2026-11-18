# Database Connection Guide

## 🔧 **Complete Database Setup**

### **Step 1: Fix RLS Issues (Required)**

Run this SQL in your Supabase SQL Editor to temporarily disable RLS for testing:

```sql
-- Disable RLS on all tables temporarily for testing
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_stats DISABLE ROW LEVEL SECURITY;
```

### **Step 2: Test Database Connection**

1. **Visit the database test endpoint:**
   ```
   http://localhost:3000/api/database-test
   ```

2. **Check the response** - it should show:
   - ✅ All tables exist
   - ✅ Connection status: "healthy"
   - ✅ No errors

### **Step 3: Create Test User**

**Option A: Use Registration Page**
1. Go to `http://localhost:3000/register`
2. Create account with:
   - Email: `test@techclub.com`
   - Password: `testpassword123`
   - Fill out all fields

**Option B: Use Supabase Dashboard**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Enter: `test@techclub.com` / `testpassword123`
4. Check "Email confirm"

### **Step 4: Test All Features**

1. **Login** at `http://localhost:3000/login`
2. **Test Dashboard** at `http://localhost:3000/dashboard`
3. **Test User Dashboard** at `http://localhost:3000/dashboard/user`
4. **Test Community** at `http://localhost:3000/community`

## 🚨 **Troubleshooting Database Issues**

### **If you get "relation does not exist" errors:**

Run this complete setup script in Supabase SQL Editor:

```sql
-- Complete Database Setup
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (if they exist)
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

-- Create profiles table
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

-- Create events table
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

-- Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration INTEGER,
    instructor VARCHAR(255),
    capacity INTEGER DEFAULT 50,
    enrolled INTEGER DEFAULT 0,
    location VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium',
    deadline DATE,
    team_members TEXT[],
    github_url TEXT,
    live_url TEXT,
    progress INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
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

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(date);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Insert sample data
INSERT INTO profiles (id, first_name, last_name, email, major, graduation_year) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin@techclub.com', 'Computer Science', 2025);

INSERT INTO events (title, description, start_date, start_time, location, event_type, created_by) VALUES
('Welcome Meeting', 'First meeting of the semester', '2024-01-15', '18:00:00', 'LC 302E', 'meeting', '00000000-0000-0000-0000-000000000001'),
('Web Development Workshop', 'Learn React and Next.js', '2024-01-20', '14:00:00', 'LC 302E', 'workshop', '00000000-0000-0000-0000-000000000001');

INSERT INTO workshops (title, description, date, start_time, duration, instructor, capacity) VALUES
('Introduction to React', 'Learn the basics of React development', '2024-01-25', '15:00:00', 120, 'Dr. Smith', 30),
('Advanced JavaScript', 'Deep dive into modern JavaScript', '2024-02-01', '16:00:00', 90, 'Prof. Johnson', 25);

INSERT INTO projects (name, description, user_id, role, priority, deadline) VALUES
('TechClub Website', 'Redesign the club website', '00000000-0000-0000-0000-000000000001', 'Developer', 'high', '2024-03-01'),
('Mobile App', 'Create a mobile app for the club', '00000000-0000-0000-0000-000000000001', 'Lead Developer', 'medium', '2024-04-15');

INSERT INTO resources (title, description, category, url, created_by) VALUES
('React Tutorial', 'Complete React tutorial for beginners', 'Web Development', 'https://react.dev', '00000000-0000-0000-0000-000000000001'),
('JavaScript Guide', 'Modern JavaScript concepts', 'Web Development', 'https://javascript.info', '00000000-0000-0000-0000-000000000001');

INSERT INTO notifications (user_id, title, message, type) VALUES
('00000000-0000-0000-0000-000000000001', 'Welcome!', 'Welcome to TechClub!', 'info'),
('00000000-0000-0000-0000-000000000001', 'New Event', 'Web Development Workshop scheduled', 'info');

INSERT INTO activities (user_id, action, target) VALUES
('00000000-0000-0000-0000-000000000001', 'joined', 'TechClub'),
('00000000-0000-0000-0000-000000000001', 'created', 'project');
```

### **If you get authentication errors:**

1. **Check your `.env.local` file:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Verify the values in Supabase Dashboard:**
   - Go to Settings > API
   - Copy the Project URL and anon public key

### **If features don't work:**

1. **Test database connection:**
   ```
   http://localhost:3000/api/database-test
   ```

2. **Check browser console** for errors

3. **Verify user is logged in** by checking:
   ```
   http://localhost:3000/dashboard
   ```

## ✅ **Success Indicators**

When everything is working correctly, you should see:

1. **Database Test** shows "healthy" status
2. **Login** works without errors
3. **Dashboard** loads with data
4. **Create Event/Project/Resource** works
5. **All tabs** show content
6. **No console errors**

## 🔄 **Re-enable RLS (Optional)**

Once everything is working, you can re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_stats ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations for authenticated users" ON events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON workshops
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON resources
    FOR ALL USING (auth.uid() IS NOT NULL);
```

## 🎯 **Next Steps**

1. **Test all features** thoroughly
2. **Create real content** (events, projects, resources)
3. **Invite other users** to test
4. **Monitor database performance**
5. **Set up proper RLS policies** for production 

## 🔧 **Complete Database Setup**

### **Step 1: Fix RLS Issues (Required)**

Run this SQL in your Supabase SQL Editor to temporarily disable RLS for testing:

```sql
-- Disable RLS on all tables temporarily for testing
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_stats DISABLE ROW LEVEL SECURITY;
```

### **Step 2: Test Database Connection**

1. **Visit the database test endpoint:**
   ```
   http://localhost:3000/api/database-test
   ```

2. **Check the response** - it should show:
   - ✅ All tables exist
   - ✅ Connection status: "healthy"
   - ✅ No errors

### **Step 3: Create Test User**

**Option A: Use Registration Page**
1. Go to `http://localhost:3000/register`
2. Create account with:
   - Email: `test@techclub.com`
   - Password: `testpassword123`
   - Fill out all fields

**Option B: Use Supabase Dashboard**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Enter: `test@techclub.com` / `testpassword123`
4. Check "Email confirm"

### **Step 4: Test All Features**

1. **Login** at `http://localhost:3000/login`
2. **Test Dashboard** at `http://localhost:3000/dashboard`
3. **Test User Dashboard** at `http://localhost:3000/dashboard/user`
4. **Test Community** at `http://localhost:3000/community`

## 🚨 **Troubleshooting Database Issues**

### **If you get "relation does not exist" errors:**

Run this complete setup script in Supabase SQL Editor:

```sql
-- Complete Database Setup
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (if they exist)
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

-- Create profiles table
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

-- Create events table
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

-- Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration INTEGER,
    instructor VARCHAR(255),
    capacity INTEGER DEFAULT 50,
    enrolled INTEGER DEFAULT 0,
    location VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium',
    deadline DATE,
    team_members TEXT[],
    github_url TEXT,
    live_url TEXT,
    progress INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
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

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(date);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Insert sample data
INSERT INTO profiles (id, first_name, last_name, email, major, graduation_year) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin@techclub.com', 'Computer Science', 2025);

INSERT INTO events (title, description, start_date, start_time, location, event_type, created_by) VALUES
('Welcome Meeting', 'First meeting of the semester', '2024-01-15', '18:00:00', 'LC 302E', 'meeting', '00000000-0000-0000-0000-000000000001'),
('Web Development Workshop', 'Learn React and Next.js', '2024-01-20', '14:00:00', 'LC 302E', 'workshop', '00000000-0000-0000-0000-000000000001');

INSERT INTO workshops (title, description, date, start_time, duration, instructor, capacity) VALUES
('Introduction to React', 'Learn the basics of React development', '2024-01-25', '15:00:00', 120, 'Dr. Smith', 30),
('Advanced JavaScript', 'Deep dive into modern JavaScript', '2024-02-01', '16:00:00', 90, 'Prof. Johnson', 25);

INSERT INTO projects (name, description, user_id, role, priority, deadline) VALUES
('TechClub Website', 'Redesign the club website', '00000000-0000-0000-0000-000000000001', 'Developer', 'high', '2024-03-01'),
('Mobile App', 'Create a mobile app for the club', '00000000-0000-0000-0000-000000000001', 'Lead Developer', 'medium', '2024-04-15');

INSERT INTO resources (title, description, category, url, created_by) VALUES
('React Tutorial', 'Complete React tutorial for beginners', 'Web Development', 'https://react.dev', '00000000-0000-0000-0000-000000000001'),
('JavaScript Guide', 'Modern JavaScript concepts', 'Web Development', 'https://javascript.info', '00000000-0000-0000-0000-000000000001');

INSERT INTO notifications (user_id, title, message, type) VALUES
('00000000-0000-0000-0000-000000000001', 'Welcome!', 'Welcome to TechClub!', 'info'),
('00000000-0000-0000-0000-000000000001', 'New Event', 'Web Development Workshop scheduled', 'info');

INSERT INTO activities (user_id, action, target) VALUES
('00000000-0000-0000-0000-000000000001', 'joined', 'TechClub'),
('00000000-0000-0000-0000-000000000001', 'created', 'project');
```

### **If you get authentication errors:**

1. **Check your `.env.local` file:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Verify the values in Supabase Dashboard:**
   - Go to Settings > API
   - Copy the Project URL and anon public key

### **If features don't work:**

1. **Test database connection:**
   ```
   http://localhost:3000/api/database-test
   ```

2. **Check browser console** for errors

3. **Verify user is logged in** by checking:
   ```
   http://localhost:3000/dashboard
   ```

## ✅ **Success Indicators**

When everything is working correctly, you should see:

1. **Database Test** shows "healthy" status
2. **Login** works without errors
3. **Dashboard** loads with data
4. **Create Event/Project/Resource** works
5. **All tabs** show content
6. **No console errors**

## 🔄 **Re-enable RLS (Optional)**

Once everything is working, you can re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_stats ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations for authenticated users" ON events
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON workshops
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON resources
    FOR ALL USING (auth.uid() IS NOT NULL);
```

## 🎯 **Next Steps**

1. **Test all features** thoroughly
2. **Create real content** (events, projects, resources)
3. **Invite other users** to test
4. **Monitor database performance**
5. **Set up proper RLS policies** for production 