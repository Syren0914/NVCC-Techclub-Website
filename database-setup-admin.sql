-- Create users table for admin access
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'officer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user for test@email.vccs.edu
-- Note: You'll need to replace the UUID with the actual user ID from auth.users
-- You can find this by checking the auth.users table in Supabase dashboard
INSERT INTO users (id, email, role) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1),
    'test@email.vccs.edu',
    'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Create membership_applications table
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

-- Create events table
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

-- Create projects table
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

-- Create resources table
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

-- Insert sample membership applications
INSERT INTO membership_applications (first_name, last_name, email, major, areas_of_interest, technical_experience_level, goals, github_username, linkedin_url, phone, graduation_year, preferred_contact_method, status) VALUES
('John', 'Doe', 'john.doe@vccs.edu', 'Computer Science', 'Web Development, Machine Learning', 'intermediate', 'Learn React and build full-stack applications', 'johndoe123', 'https://linkedin.com/in/johndoe', '555-0123', '2025', 'email', 'pending'),
('Jane', 'Smith', 'jane.smith@vccs.edu', 'Information Technology', 'Cybersecurity, Database Management', 'beginner', 'Gain hands-on experience in cybersecurity', 'janesmith456', 'https://linkedin.com/in/janesmith', '555-0456', '2026', 'phone', 'approved'),
('Mike', 'Johnson', 'mike.johnson@vccs.edu', 'Software Engineering', 'Mobile Development, UI/UX Design', 'advanced', 'Lead mobile app development projects', 'mikejohnson789', 'https://linkedin.com/in/mikejohnson', '555-0789', '2024', 'email', 'rejected');

-- Insert sample events
INSERT INTO events (title, description, date, location, type, max_participants, created_by) VALUES
('React Workshop', 'Learn the basics of React and build your first component', '2024-02-15 18:00:00+00', 'Room 101, Building A', 'workshop', 25, (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('Hackathon 2024', '24-hour coding challenge with prizes', '2024-03-20 09:00:00+00', 'Computer Lab, Building B', 'hackathon', 50, (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('Monthly Meeting', 'Regular club meeting to discuss upcoming events', '2024-02-01 17:00:00+00', 'Conference Room', 'meeting', 30, (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1));

-- Insert sample projects
INSERT INTO projects (title, description, technologies, github_url, live_url, status, team_members, created_by) VALUES
('TechClub Website', 'Official website for the TechClub with member management', ARRAY['React', 'TypeScript', 'Next.js', 'Supabase'], 'https://github.com/techclub/website', 'https://techclub.vccs.edu', 'active', ARRAY['John Doe', 'Jane Smith'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('Mobile App', 'Cross-platform mobile app for event management', ARRAY['React Native', 'Firebase', 'Redux'], 'https://github.com/techclub/mobile-app', 'https://apps.apple.com/techclub', 'completed', ARRAY['Mike Johnson', 'Sarah Wilson'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('AI Chatbot', 'Intelligent chatbot for student support', ARRAY['Python', 'TensorFlow', 'Flask'], 'https://github.com/techclub/chatbot', NULL, 'on-hold', ARRAY['Alex Brown'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1));

-- Insert sample resources
INSERT INTO resources (title, description, url, type, category, tags, created_by) VALUES
('React Documentation', 'Official React documentation and tutorials', 'https://react.dev', 'documentation', 'programming', ARRAY['React', 'JavaScript', 'Frontend'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('CSS Grid Tutorial', 'Complete guide to CSS Grid layout', 'https://css-tricks.com/snippets/css/complete-guide-grid/', 'tutorial', 'design', ARRAY['CSS', 'Grid', 'Layout'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('Git Best Practices', 'Video tutorial on Git workflow and best practices', 'https://youtube.com/watch?v=git-best-practices', 'video', 'tools', ARRAY['Git', 'Version Control', 'Workflow'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1)),
('TypeScript Handbook', 'Comprehensive TypeScript guide for beginners', 'https://typescriptlang.org/docs/', 'documentation', 'programming', ARRAY['TypeScript', 'JavaScript', 'Programming'], (SELECT id FROM auth.users WHERE email = 'test@email.vccs.edu' LIMIT 1));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_created_at ON membership_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

-- Admin users can read all data
CREATE POLICY "Admins can read all data" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Anyone can read membership applications (for public viewing)
CREATE POLICY "Anyone can read membership applications" ON membership_applications FOR SELECT USING (true);

-- Only admins can insert/update/delete membership applications
CREATE POLICY "Admins can manage membership applications" ON membership_applications FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Anyone can read events, projects, and resources (for public viewing)
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Anyone can read resources" ON resources FOR SELECT USING (true);

-- Only admins can manage events, projects, and resources
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage resources" ON resources FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
