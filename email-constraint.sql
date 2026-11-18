-- Add email domain constraint to user_profiles table
ALTER TABLE user_profiles 
ADD CONSTRAINT check_email_domain 
CHECK (email LIKE '%@email.vccs.edu');

-- Add email domain constraint to membership_applications table
ALTER TABLE membership_applications 
ADD CONSTRAINT check_membership_email_domain 
CHECK (email LIKE '%@email.vccs.edu');

-- Add email domain constraint to auth.users (if possible)
-- Note: This might not work due to permissions, but we can enforce it at application level
-- ALTER TABLE auth.users 
-- ADD CONSTRAINT check_auth_email_domain 
-- CHECK (email LIKE '%@email.vccs.edu'); 