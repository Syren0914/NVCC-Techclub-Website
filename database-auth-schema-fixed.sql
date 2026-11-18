-- Authentication and User Management Schema
-- This version fixes permission issues by using triggers instead of direct auth.users modifications

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    major TEXT,
    year_of_study TEXT,
    areas_of_interest TEXT[],
    technical_experience_level TEXT DEFAULT 'Beginner',
    goals TEXT,
    bio TEXT,
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two-Factor Backup Codes Table
CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Events (for tracking event participation)
CREATE TABLE IF NOT EXISTS member_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered', -- registered, attended, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Member Projects (for tracking project participation)
CREATE TABLE IF NOT EXISTS member_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT, -- contributor, lead, reviewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Member Resources (for tracking resource access)
CREATE TABLE IF NOT EXISTS member_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Hackathons Table
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    registration_deadline DATE,
    prizes TEXT[],
    technologies TEXT[],
    difficulty_level TEXT DEFAULT 'Intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshops Table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER, -- in minutes
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    instructor TEXT,
    topics TEXT[],
    difficulty_level TEXT DEFAULT 'Beginner',
    materials_required TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hackathon Participants
CREATE TABLE IF NOT EXISTS hackathon_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    team_name TEXT,
    project_title TEXT,
    project_description TEXT,
    github_url TEXT,
    demo_url TEXT,
    status TEXT DEFAULT 'registered', -- registered, submitted, winner, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Workshop Participants
CREATE TABLE IF NOT EXISTS workshop_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered', -- registered, attended, cancelled
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workshop_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_major ON user_profiles(major);
CREATE INDEX IF NOT EXISTS idx_two_factor_backup_codes_user_id ON two_factor_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_member_events_user_id ON member_events(user_id);
CREATE INDEX IF NOT EXISTS idx_member_events_event_id ON member_events(event_id);
CREATE INDEX IF NOT EXISTS idx_member_projects_user_id ON member_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_member_projects_project_id ON member_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_member_resources_user_id ON member_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_member_resources_resource_id ON member_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_hackathon_id ON hackathon_participants(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user_id ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_workshop_id ON workshop_participants(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_user_id ON workshop_participants(user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for two_factor_backup_codes
CREATE POLICY "Users can manage own backup codes" ON two_factor_backup_codes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for member_events
CREATE POLICY "Users can manage own event registrations" ON member_events
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for member_projects
CREATE POLICY "Users can manage own project participation" ON member_projects
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for member_resources
CREATE POLICY "Users can manage own resource access" ON member_resources
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for hackathons (public read, authenticated insert/update)
CREATE POLICY "Anyone can view hackathons" ON hackathons
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hackathons" ON hackathons
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hackathons" ON hackathons
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for workshops (public read, authenticated insert/update)
CREATE POLICY "Anyone can view workshops" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workshops" ON workshops
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update workshops" ON workshops
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for hackathon_participants
CREATE POLICY "Users can manage own hackathon participation" ON hackathon_participants
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for workshop_participants
CREATE POLICY "Users can manage own workshop participation" ON workshop_participants
    FOR ALL USING (auth.uid() = user_id);

-- Sample data for hackathons
INSERT INTO hackathons (title, description, start_date, end_date, location, is_online, max_participants, prizes, technologies, difficulty_level) VALUES
('TechClub Winter Hackathon 2024', 'Build innovative solutions using modern web technologies', '2024-12-15', '2024-12-17', 'LC Building Room 302E', false, 50, ARRAY['$1000 First Prize', '$500 Second Prize', '$250 Third Prize'], ARRAY['React', 'Node.js', 'Python', 'AI/ML'], 'Intermediate'),
('AI Innovation Challenge', 'Create AI-powered applications that solve real-world problems', '2024-11-20', '2024-11-22', 'Online', true, 100, ARRAY['$2000 Grand Prize', '$1000 Runner-up', 'Internship Opportunities'], ARRAY['Python', 'TensorFlow', 'OpenAI API', 'Computer Vision'], 'Advanced'),
('Web Development Sprint', 'Rapid prototyping challenge for web applications', '2024-10-10', '2024-10-11', 'LC Building Room 302E', false, 30, ARRAY['$500 Best App', '$250 Most Creative', '$100 Best UI/UX'], ARRAY['HTML/CSS', 'JavaScript', 'React', 'Next.js'], 'Beginner');

-- Sample data for workshops
INSERT INTO workshops (title, description, date, time, duration, location, is_online, max_participants, instructor, topics, difficulty_level, materials_required) VALUES
('Introduction to React Hooks', 'Learn how to use React Hooks for state management and side effects', '2024-12-05', '14:00:00', 120, 'LC Building Room 302E', false, 25, 'John Smith', ARRAY['useState', 'useEffect', 'useContext', 'Custom Hooks'], 'Beginner', ARRAY['Laptop', 'Node.js installed']),
('Cybersecurity Fundamentals', 'Learn the basics of cybersecurity and ethical hacking', '2024-12-12', '15:30:00', 90, 'Online', true, 40, 'Sarah Johnson', ARRAY['Network Security', 'Password Security', 'Social Engineering', 'Basic Penetration Testing'], 'Beginner', ARRAY['Computer', 'Kali Linux VM']),
('Advanced Python for Data Science', 'Master Python libraries for data analysis and visualization', '2024-12-19', '16:00:00', 150, 'LC Building Room 302E', false, 20, 'Mike Chen', ARRAY['Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn'], 'Intermediate', ARRAY['Laptop', 'Python 3.8+', 'Jupyter Notebook']); 