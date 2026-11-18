-- Authentication and User Management Schema

-- Enable Row Level Security for authentication
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- User Profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  major VARCHAR(255),
  year_of_study VARCHAR(50),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  github_username VARCHAR(100),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  areas_of_interest TEXT[],
  technical_experience_level VARCHAR(50) DEFAULT 'Beginner',
  membership_status VARCHAR(50) DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'inactive', 'suspended')),
  membership_type VARCHAR(50) DEFAULT 'regular',
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2FA Backup Codes table
CREATE TABLE two_factor_backup_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Events (tracking which events members are registered for)
CREATE TABLE member_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  registration_status VARCHAR(50) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_date TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  UNIQUE(user_id, event_id)
);

-- Member Projects (tracking which projects members are working on)
CREATE TABLE member_projects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  contribution TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, project_id)
);

-- Member Resources (tracking which resources members have accessed)
CREATE TABLE member_resources (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_status VARCHAR(50) DEFAULT 'started' CHECK (completion_status IN ('started', 'completed', 'bookmarked')),
  notes TEXT,
  UNIQUE(user_id, resource_id)
);

-- Hackathons table
CREATE TABLE hackathons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  prizes TEXT,
  requirements TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hackathon Participants
CREATE TABLE hackathon_participants (
  id SERIAL PRIMARY KEY,
  hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name VARCHAR(255),
  project_title VARCHAR(255),
  project_description TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'participating', 'completed', 'dropped')),
  UNIQUE(hackathon_id, user_id)
);

-- Workshops table
CREATE TABLE workshops (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  skill_level VARCHAR(50) DEFAULT 'Beginner',
  prerequisites TEXT,
  materials_needed TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop Participants
CREATE TABLE workshop_participants (
  id SERIAL PRIMARY KEY,
  workshop_id INTEGER REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_status VARCHAR(50) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  feedback TEXT,
  UNIQUE(workshop_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_membership_status ON user_profiles(membership_status);
CREATE INDEX idx_member_events_user_id ON member_events(user_id);
CREATE INDEX idx_member_events_event_id ON member_events(event_id);
CREATE INDEX idx_member_projects_user_id ON member_projects(user_id);
CREATE INDEX idx_member_projects_project_id ON member_projects(project_id);
CREATE INDEX idx_hackathons_active ON hackathons(is_active);
CREATE INDEX idx_hackathons_dates ON hackathons(start_date, end_date);
CREATE INDEX idx_workshops_active ON workshops(is_active);
CREATE INDEX idx_workshops_dates ON workshops(date);

-- Row Level Security Policies

-- User profiles can only be accessed by the user themselves or admins
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Member events policies
CREATE POLICY "Users can view own event registrations" ON member_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own event registrations" ON member_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own event registrations" ON member_events FOR UPDATE USING (auth.uid() = user_id);

-- Member projects policies
CREATE POLICY "Users can view own project participations" ON member_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project participations" ON member_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project participations" ON member_projects FOR UPDATE USING (auth.uid() = user_id);

-- Member resources policies
CREATE POLICY "Users can view own resource access" ON member_resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resource access" ON member_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resource access" ON member_resources FOR UPDATE USING (auth.uid() = user_id);

-- Hackathon participants policies
CREATE POLICY "Users can view own hackathon participations" ON hackathon_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hackathon participations" ON hackathon_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hackathon participations" ON hackathon_participants FOR UPDATE USING (auth.uid() = user_id);

-- Workshop participants policies
CREATE POLICY "Users can view own workshop registrations" ON workshop_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workshop registrations" ON workshop_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workshop registrations" ON workshop_participants FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for events, projects, resources, hackathons, workshops
CREATE POLICY "Public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access to resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public read access to hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public read access to workshops" ON workshops FOR SELECT USING (true);

-- Insert sample data

-- Sample Hackathons
INSERT INTO hackathons (title, description, start_date, end_date, location, is_online, max_participants, registration_deadline, prizes, requirements) VALUES
('TechClub Spring Hackathon 2025', 'Build innovative solutions using cutting-edge technologies. Focus on AI, Web3, or IoT.', '2025-04-15 09:00:00+00', '2025-04-17 18:00:00+00', 'Innovation Hub, LC Building', false, 50, '2025-04-10 23:59:00+00', '1st Place: $1000, 2nd Place: $500, 3rd Place: $250', 'Basic programming knowledge, laptop required'),
('Virtual AI Challenge', 'Create AI-powered applications using machine learning and data science.', '2025-05-20 10:00:00+00', '2025-05-22 16:00:00+00', 'Online (Discord + Zoom)', true, 100, '2025-05-15 23:59:00+00', '1st Place: $800, 2nd Place: $400, 3rd Place: $200', 'Python knowledge, GitHub account');

-- Sample Workshops
INSERT INTO workshops (title, description, instructor, date, start_time, end_time, location, is_online, max_participants, skill_level, prerequisites, materials_needed) VALUES
('Advanced React Patterns', 'Learn advanced React concepts including hooks, context, and performance optimization.', 'Erdene Batbayar', '2025-04-05', '14:30:00', '16:30:00', 'LC 302E', false, 25, 'Intermediate', 'Basic React knowledge, laptop with Node.js installed', 'Laptop, VS Code, Node.js'),
('Cybersecurity Fundamentals', 'Introduction to ethical hacking, penetration testing, and security best practices.', 'Christian Galvez', '2025-04-12', '14:30:00', '16:30:00', 'LC 302E', false, 20, 'Beginner', 'Basic computer knowledge', 'Laptop with Kali Linux VM'),
('Unity Game Development', 'Create your first 3D game using Unity and C#.', 'Deigo Foncesca', '2025-04-19', '14:30:00', '16:30:00', 'LC 302E', false, 15, 'Beginner', 'No prior experience required', 'Laptop with Unity Hub installed'),
('Data Science with Python', 'Learn data analysis, visualization, and machine learning with Python.', 'Jun Ip', '2025-04-26', '14:30:00', '16:30:00', 'Online (Zoom)', true, 30, 'Intermediate', 'Basic Python knowledge', 'Laptop with Python, Jupyter Notebook');

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_participants ENABLE ROW LEVEL SECURITY; 