-- Drop existing tables if they exist
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS membership_applications CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
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

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'workshop', 'meeting', 'hackathon')),
    max_participants INTEGER,
    image_url TEXT,
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

-- Create project_applications table
CREATE TABLE project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_major TEXT,
    user_year TEXT,
    motivation TEXT,
    skills TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership_applications table with all required columns
CREATE TABLE membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id TEXT,
    major TEXT,
    graduation_year INTEGER,
    interests TEXT[] DEFAULT '{}',
    experience TEXT,
    motivation TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

DROP POLICY IF EXISTS "Anyone can read projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

DROP POLICY IF EXISTS "Anyone can read resources" ON resources;
DROP POLICY IF EXISTS "Admins can insert resources" ON resources;
DROP POLICY IF EXISTS "Admins can update resources" ON resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON resources;

DROP POLICY IF EXISTS "Anyone can read team_members" ON team_members;
DROP POLICY IF EXISTS "Admins can insert team_members" ON team_members;
DROP POLICY IF EXISTS "Admins can update team_members" ON team_members;
DROP POLICY IF EXISTS "Admins can delete team_members" ON team_members;

DROP POLICY IF EXISTS "Anyone can read milestones" ON milestones;
DROP POLICY IF EXISTS "Admins can insert milestones" ON milestones;
DROP POLICY IF EXISTS "Admins can update milestones" ON milestones;
DROP POLICY IF EXISTS "Admins can delete milestones" ON milestones;

DROP POLICY IF EXISTS "Anyone can insert project applications" ON project_applications;
DROP POLICY IF EXISTS "Admins can read all project applications" ON project_applications;
DROP POLICY IF EXISTS "Admins can update project applications" ON project_applications;
DROP POLICY IF EXISTS "Admins can delete project applications" ON project_applications;

DROP POLICY IF EXISTS "Anyone can insert applications" ON membership_applications;
DROP POLICY IF EXISTS "Admins can read all applications" ON membership_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON membership_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON membership_applications;

-- Create RLS policies for users
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (true);

-- Create RLS policies for projects
CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE USING (true);

-- Create RLS policies for events
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (true);

-- Create RLS policies for resources
CREATE POLICY "Anyone can read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Admins can insert resources" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update resources" ON resources FOR UPDATE USING (true);
CREATE POLICY "Admins can delete resources" ON resources FOR DELETE USING (true);

-- Create RLS policies for team_members
CREATE POLICY "Anyone can read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert team_members" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update team_members" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Admins can delete team_members" ON team_members FOR DELETE USING (true);

-- Create RLS policies for milestones
CREATE POLICY "Anyone can read milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Admins can insert milestones" ON milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update milestones" ON milestones FOR UPDATE USING (true);
CREATE POLICY "Admins can delete milestones" ON milestones FOR DELETE USING (true);

-- Create RLS policies for project_applications
CREATE POLICY "Anyone can insert project applications" ON project_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all project applications" ON project_applications FOR SELECT USING (true);
CREATE POLICY "Admins can update project applications" ON project_applications FOR UPDATE USING (true);
CREATE POLICY "Admins can delete project applications" ON project_applications FOR DELETE USING (true);

-- Create RLS policies for membership_applications
CREATE POLICY "Anyone can insert applications" ON membership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all applications" ON membership_applications FOR SELECT USING (true);
CREATE POLICY "Admins can update applications" ON membership_applications FOR UPDATE USING (true);
CREATE POLICY "Admins can delete applications" ON membership_applications FOR DELETE USING (true);

-- Insert admin user for test@email.vccs.edu
INSERT INTO users (id, email, role) 
VALUES ('c6077857-5638-43af-81b1-ddb4954cb4fa', 'test@email.vccs.edu', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample team members
INSERT INTO team_members (name, role, bio, image, year, contact, specialties, github, linkedin) VALUES
('Sarah Johnson', 'President', 'Computer Science major with a passion for web development and AI. Leading TechClub to new heights.', '/team/sarah.jpg', 'Senior', 'sarah.johnson@email.vccs.edu', ARRAY['Web Development', 'AI/ML', 'Leadership'], 'https://github.com/sarahjohnson', 'https://linkedin.com/in/sarahjohnson'),
('Michael Chen', 'Vice President', 'Software Engineering student specializing in mobile app development and cloud computing.', '/team/michael.jpg', 'Senior', 'michael.chen@email.vccs.edu', ARRAY['Mobile Development', 'Cloud Computing', 'DevOps'], 'https://github.com/michaelchen', 'https://linkedin.com/in/michaelchen'),
('Emily Rodriguez', 'Secretary', 'Information Technology major focused on cybersecurity and network administration.', '/team/emily.jpg', 'Junior', 'emily.rodriguez@email.vccs.edu', ARRAY['Cybersecurity', 'Networking', 'System Administration'], 'https://github.com/emilyrodriguez', 'https://linkedin.com/in/emilyrodriguez'),
('David Kim', 'Treasurer', 'Computer Science student with expertise in data science and machine learning.', '/team/david.jpg', 'Senior', 'david.kim@email.vccs.edu', ARRAY['Data Science', 'Machine Learning', 'Python'], 'https://github.com/davidkim', 'https://linkedin.com/in/davidkim'),
('Lisa Wang', 'Events Coordinator', 'Information Systems major organizing workshops and hackathons for the club.', '/team/lisa.jpg', 'Junior', 'lisa.wang@email.vccs.edu', ARRAY['Event Planning', 'Project Management', 'UI/UX'], 'https://github.com/lisawang', 'https://linkedin.com/in/lisawang'),
('Alex Thompson', 'Technical Lead', 'Computer Engineering student leading technical workshops and mentoring new members.', '/team/alex.jpg', 'Senior', 'alex.thompson@email.vccs.edu', ARRAY['Hardware', 'Embedded Systems', 'C/C++'], 'https://github.com/alextompson', 'https://linkedin.com/in/alextompson');

-- Insert sample milestones
INSERT INTO milestones (year, title, description) VALUES
('2020', 'Club Founded', 'TechClub was established by a group of 10 Computer Science students looking to expand their learning beyond the classroom.'),
('2020', 'First Hackathon', 'Organized our first internal 24-hour hackathon with 25 participants, resulting in 8 completed projects.'),
('2021', '50 Members Milestone', 'Reached 50 active members from various departments across the college.'),
('2021', 'Industry Partnership', 'Established our first industry partnership with TechCorp, providing internship opportunities for members.'),
('2022', 'Regional Hackathon Winners', 'Our team won first place at the Regional University Hackathon with their project ''EcoTrack''.'),
('2022', 'Workshop Series Launch', 'Launched our weekly workshop series covering topics from web development to cybersecurity.'),
('2023', '100 Members Milestone', 'Celebrated reaching 100 active members and expanded to include students from neighboring universities.'),
('2023', 'First Annual Tech Conference', 'Organized our first annual tech conference with 200+ attendees and speakers from major tech companies.'),
('2024', 'Robotics Competition Win', 'Our robotics team won the National University Robotics Challenge with their autonomous navigation robot.'),
('2024', 'New Club Space', 'Secured a dedicated club space in the Technology Building with workstations, meeting areas, and a small hardware lab.'),
('2025', '200+ Members', 'Currently at over 200 active members with four specialized divisions: Web Development, Cybersecurity, Game Development, and Robotics.');

-- Insert a test membership application for test@email.vccs.edu
INSERT INTO membership_applications (name, email, student_id, major, graduation_year, interests, experience, motivation, status) VALUES
('Test User', 'test@email.vccs.edu', '12345', 'Computer Science', 2025, ARRAY['Web Development', 'AI/ML'], 'Some programming experience', 'Want to join TechClub to learn and grow', 'approved');
