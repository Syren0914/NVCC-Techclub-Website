-- Announcements system for TechClub
-- This will track all announcements sent to members

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender_id VARCHAR(255) NOT NULL, -- Admin user who sent it
  sender_name VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(20) DEFAULT 'all' CHECK (recipient_type IN ('all', 'specific')),
  recipient_emails TEXT[], -- Array of specific email addresses if recipient_type = 'specific'
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track individual email deliveries
CREATE TABLE IF NOT EXISTS announcement_deliveries (
  id SERIAL PRIMARY KEY,
  announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  email_id VARCHAR(255), -- Resend email ID for tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_sender ON announcements(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcement_deliveries_announcement ON announcement_deliveries(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_deliveries_email ON announcement_deliveries(recipient_email);
CREATE INDEX IF NOT EXISTS idx_announcement_deliveries_status ON announcement_deliveries(status);

-- Sample announcement
INSERT INTO announcements (
  title,
  message,
  sender_id,
  sender_name,
  recipient_type,
  priority,
  status
) VALUES (
  'Welcome to TechClub!',
  '<h2>Welcome to TechClub!</h2><p>We''re excited to have you as part of our community. Get ready for amazing projects, learning opportunities, and networking events.</p><p>Stay tuned for upcoming events and project announcements!</p><p>Best regards,<br/>TechClub Team</p>',
  'admin',
  'TechClub Admin',
  'all',
  'normal',
  'draft'
);
