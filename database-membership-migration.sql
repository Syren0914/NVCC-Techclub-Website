-- Migration script to add missing columns to membership_applications table
-- Run this in your Supabase SQL editor

-- Add missing columns to existing membership_applications table
ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS technical_experience_level VARCHAR(50) DEFAULT 'beginner';

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS goals TEXT;

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS github_username VARCHAR(255);

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(10);

ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) DEFAULT 'email';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_membership_applications_created_at ON membership_applications(created_at);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'membership_applications' 
ORDER BY ordinal_position; 