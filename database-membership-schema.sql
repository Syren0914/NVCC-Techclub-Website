-- Updated Membership Applications table with new fields
CREATE TABLE IF NOT EXISTS membership_applications (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  areas_of_interest TEXT NOT NULL,
  technical_experience_level VARCHAR(50) DEFAULT 'beginner',
  goals TEXT,
  github_username VARCHAR(255),
  linkedin_url TEXT,
  phone VARCHAR(50),
  graduation_year VARCHAR(10),
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_membership_applications_created_at ON membership_applications(created_at);

-- Insert sample membership application
INSERT INTO membership_applications (
  first_name, 
  last_name, 
  email, 
  major, 
  areas_of_interest, 
  technical_experience_level, 
  goals, 
  github_username, 
  linkedin_url, 
  phone, 
  graduation_year, 
  preferred_contact_method, 
  status
) VALUES (
  'John',
  'Doe',
  'john.doe@email.vccs.edu',
  'Computer Science',
  'Web Development, Cybersecurity, AI/ML',
  'intermediate',
  'I want to learn full-stack development and contribute to open source projects.',
  'johndoe123',
  'https://linkedin.com/in/johndoe',
  '(555) 123-4567',
  '2025',
  'email',
  'pending'
); 