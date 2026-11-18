-- Step 1: Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'officer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'general',
    max_participants INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT[] DEFAULT '{}',
    github_url VARCHAR(255),
    live_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
    team_members TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'link' CHECK (type IN ('link', 'video', 'article', 'tutorial', 'documentation')),
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'programming', 'design', 'tools', 'frameworks')),
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create membership_applications table
CREATE TABLE IF NOT EXISTS membership_applications (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    major VARCHAR(100),
    areas_of_interest TEXT,
    technical_experience_level VARCHAR(50),
    goals TEXT,
    github_username VARCHAR(100),
    linkedin_url VARCHAR(255),
    phone VARCHAR(20),
    graduation_year VARCHAR(4),
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Insert sample data
INSERT INTO membership_applications (first_name, last_name, email, major, areas_of_interest, technical_experience_level, goals, github_username, linkedin_url, phone, graduation_year, preferred_contact_method, status) VALUES
('John', 'Doe', 'john.doe@vccs.edu', 'Computer Science', 'Web Development, Machine Learning', 'intermediate', 'Learn React and build full-stack applications', 'johndoe123', 'https://linkedin.com/in/johndoe', '555-0123', '2025', 'email', 'pending'),
('Jane', 'Smith', 'jane.smith@vccs.edu', 'Information Technology', 'Cybersecurity, Database Management', 'beginner', 'Gain hands-on experience in cybersecurity', 'janesmith456', 'https://linkedin.com/in/janesmith', '555-0456', '2026', 'phone', 'approved'),
('Mike', 'Johnson', 'mike.johnson@vccs.edu', 'Software Engineering', 'Mobile Development, UI/UX Design', 'advanced', 'Lead mobile app development projects', 'mikejohnson789', 'https://linkedin.com/in/mikejohnson', '555-0789', '2024', 'email', 'rejected');

-- Step 7: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Step 8: Create basic RLS policies
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Anyone can read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Anyone can read membership applications" ON membership_applications FOR SELECT USING (true);

-- Step 9: Create admin policies
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage resources" ON resources FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage membership applications" ON membership_applications FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
