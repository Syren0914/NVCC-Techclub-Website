-- Create tables for TechClub website

-- Team Members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership Applications table
CREATE TABLE membership_applications (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  areas_of_interest VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_membership_applications_status ON membership_applications(status);

-- Insert sample data

-- Sample Team Members
INSERT INTO team_members (name, role, bio, image) VALUES
('Jun Ip', 'Former President', 'Computer Science major with a passion for AI and machine learning.', '/placeholder.svg?height=100&width=100'),
('Erdene Batbayar', 'Club President', 'Full-stack developer specializing in React and Node.js applications.', '/erdene.jpg'),
('Estabon Gandarillas', 'Media Officer', 'Computer Science major with a passion for VR and AR technologies.', '/placeholder.svg?height=100&width=100'),
('Deigo Foncesca', 'Former Officer', 'Game developer with a creative approach to problem-solving.', '/deigo.jpg'),
('Christian Galvez', 'Former Treasurer', 'Electrical Engineering student with a focus on IoT and embedded systems.', '/christian.jpg'),
('Hashem Anwari', 'Advisor', 'Professor of Computer Science with expertise in computer engineering and data science.', '/placeholder.svg?height=100&width=100');

-- Sample Events
INSERT INTO events (title, date, time, location, description, type, is_online, is_featured) VALUES
('Blender Workshop', '2025-04-03', '2:30 PM - 4:00 PM', 'LC 302E', 'Learn 3D modeling and animation with Blender in this hands-on workshop.', 'Workshop', false, true),
('Intro to Ethical Hacking', '2025-04-10', '2:30 PM - 4:00 PM', 'Tech Building, Room 302', 'Learn the basics of ethical hacking and penetration testing in this hands-on workshop.', 'Workshop', false, false),
('Web Development Bootcamp', '2025-04-17', '2:30 PM - 4:00 PM', 'Online (Zoom)', 'A beginner-friendly introduction to HTML, CSS, and JavaScript for web development.', 'Workshop', true, false),
('Data Center Field Trip', '2025-04-24', '1:00 PM - 4:00 PM', 'City Data Center', 'Visit the local data center to see how large-scale computing infrastructure works.', 'Field Trip', false, false),
('Game Jam Weekend', '2025-05-01', 'Starts at 5:00 PM Friday', 'Innovation Hub', '48-hour game development challenge. Form teams and create a game from scratch!', 'Competition', false, false);

-- Sample Projects
INSERT INTO projects (name, description, link, category) VALUES
('Club Website', 'Our own website built with Next.js and Tailwind CSS.', 'https://github.com/techclub/website', 'Web Development'),
('Student Portal', 'A portal for students to access resources and track their progress.', 'https://github.com/techclub/student-portal', 'Web Development'),
('2D Platformer', 'A 2D platformer game built with Unity.', 'https://github.com/techclub/2d-platformer', 'Game Development'),
('Browser Game', 'A browser-based game using JavaScript and HTML5 Canvas.', 'https://github.com/techclub/browser-game', 'Game Development'),
('Autonomous Robot', 'An autonomous robot that can navigate through obstacles.', 'https://github.com/techclub/autonomous-robot', 'Robotics'),
('Drone Project', 'A custom-built drone with programmable flight patterns.', 'https://github.com/techclub/drone-project', 'Robotics'),
('CTF Challenges', 'Capture the Flag challenges for members to practice security skills.', 'https://github.com/techclub/ctf-challenges', 'Cybersecurity'),
('Security Scanner', 'A tool to scan websites for common security vulnerabilities.', 'https://github.com/techclub/security-scanner', 'Cybersecurity');

-- Sample Resources
INSERT INTO resources (title, description, link, category, icon) VALUES
('Ethical Hacking Guide', 'A comprehensive guide to ethical hacking methodologies and tools.', '/resources/ethical-hacking', 'Cybersecurity', 'Shield'),
('Reverse Engineering Basics', 'Learn how to analyze and understand compiled programs.', '/resources/reverse-engineering', 'Cybersecurity', 'FileCode'),
('Full-Stack Development Tutorial', 'Step-by-step guide to building a complete web application.', '/resources/fullstack-tutorial', 'Web Development', 'Code'),
('API Design Best Practices', 'Learn how to design robust and scalable APIs.', '/resources/api-design', 'Web Development', 'Server'),
('LaTeX for Tech Resumes', 'Create professional resumes using LaTeX templates.', '/resources/latex-resumes', 'Career Development', 'FileCode'),
('Technical Interview Prep', 'Practice problems and strategies for technical interviews.', '/resources/interview-prep', 'Career Development', 'Terminal'); 