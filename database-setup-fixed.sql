-- Fixed Database Setup Script for NVCC TechClub
-- This script creates the correct schema that matches the code expectations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS membership_applications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    first_name TEXT,
    last_name TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    areas_of_interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table with the correct schema
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    event_type TEXT DEFAULT 'meeting',
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'workshop', 'meeting', 'hackathon')),
    is_online BOOLEAN DEFAULT false,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming',
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    team_members TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'link' CHECK (type IN ('link', 'document', 'video', 'tutorial')),
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT NOT NULL,
    image TEXT,
    year TEXT NOT NULL,
    contact TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    github TEXT,
    linkedin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership_applications table
CREATE TABLE membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    major TEXT NOT NULL,
    areas_of_interest TEXT NOT NULL,
    technical_experience_level TEXT,
    goals TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    phone TEXT,
    graduation_year TEXT,
    preferred_contact_method TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_applications table
CREATE TABLE project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_major TEXT,
    user_year TEXT,
    motivation TEXT,
    relevant_experience TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON project_applications(status);

-- Insert some sample data
INSERT INTO events (title, description, start_date, start_time, location, event_type) VALUES
('Welcome Meeting', 'Join us for our first meeting of the semester!', CURRENT_DATE + INTERVAL '7 days', '18:00:00', 'Room 123', 'meeting'),
('Web Development Workshop', 'Learn the basics of HTML, CSS, and JavaScript', CURRENT_DATE + INTERVAL '14 days', '14:00:00', 'Computer Lab A', 'workshop'),
('Hackathon Planning', 'Let''s plan our next hackathon event', CURRENT_DATE + INTERVAL '21 days', '19:00:00', 'Conference Room', 'meeting');

INSERT INTO team_members (name, role, bio, year, contact, specialties) VALUES
('John Doe', 'President', 'Computer Science major with passion for web development', 'Senior', 'john@email.com', ARRAY['Web Development', 'JavaScript']),
('Jane Smith', 'Vice President', 'Software Engineering student focused on mobile apps', 'Junior', 'jane@email.com', ARRAY['Mobile Development', 'React Native']),
('Mike Johnson', 'Treasurer', 'IT major specializing in cybersecurity', 'Senior', 'mike@email.com', ARRAY['Cybersecurity', 'Networking']);

INSERT INTO projects (title, description, technologies, status) VALUES
('TechClub Website', 'Modern website for the tech club using Next.js and Tailwind', ARRAY['Next.js', 'Tailwind CSS', 'TypeScript'], 'active'),
('Mobile App', 'Cross-platform mobile app for club management', ARRAY['React Native', 'Firebase'], 'active');

INSERT INTO resources (title, description, url, category, type) VALUES
('React Tutorial', 'Complete guide to React fundamentals', 'https://react.dev/learn', 'Web Development', 'tutorial'),
('Python Basics', 'Learn Python programming from scratch', 'https://python.org/doc/tutorial/', 'Programming', 'tutorial');

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_applications_updated_at BEFORE UPDATE ON membership_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_applications_updated_at BEFORE UPDATE ON project_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

-- Events are publicly readable
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);

-- Projects are publicly readable
CREATE POLICY "Projects are publicly readable" ON projects FOR SELECT USING (true);

-- Resources are publicly readable
CREATE POLICY "Resources are publicly readable" ON resources FOR SELECT USING (true);

-- Team members are publicly readable
CREATE POLICY "Team members are publicly readable" ON team_members FOR SELECT USING (true);

-- Milestones are publicly readable
CREATE POLICY "Milestones are publicly readable" ON milestones FOR SELECT USING (true);

-- Membership applications can be created by anyone, but only admins can view all
CREATE POLICY "Anyone can create membership applications" ON membership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own applications" ON membership_applications FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Project applications can be created by anyone, but only admins can view all
CREATE POLICY "Anyone can create project applications" ON project_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own applications" ON project_applications FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Success message
SELECT 'Database setup completed successfully! All tables created with correct schema.' as message;
