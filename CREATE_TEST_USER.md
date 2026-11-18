# Creating a Test User for TechClub

## Option 1: Create User via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your TechClub project

2. **Navigate to Authentication > Users**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Add a new user manually**
   - Click "Add user" or "New user"
   - Enter the following details:
     - **Email**: `test@techclub.com`
     - **Password**: `testpassword123`
     - **Email confirm**: Check this if required
   - Click "Create user"

4. **Verify the user was created**
   - The user should appear in the users list
   - Status should show as "Confirmed"

## Option 2: Create User via SQL (if you have database access)

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert a test user into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@techclub.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);
```

## Option 3: Use the Registration Page

1. **Go to your app's registration page**
   - Navigate to `http://localhost:3000/register`
   - Create a new account with:
     - **Email**: `test@techclub.com`
     - **Password**: `testpassword123`
     - **First Name**: `Test`
     - **Last Name**: `User`

## Test Login Credentials

Once you've created a user, you can test with:

- **Email**: `test@techclub.com`
- **Password**: `testpassword123`

## Troubleshooting

### If you still get "Invalid login credentials":

1. **Check Supabase Configuration**
   - Verify your `.env.local` file has correct Supabase URL and anon key
   - Make sure the environment variables are loaded

2. **Check Database Setup**
   - Run the database setup scripts in Supabase SQL Editor
   - Ensure the `profiles` table exists

3. **Check User Status**
   - In Supabase Dashboard > Authentication > Users
   - Make sure the user status is "Confirmed"
   - If not, manually confirm the user

4. **Clear Browser Cache**
   - Clear your browser's cache and cookies
   - Try in an incognito/private window

### Common Issues:

- **User not confirmed**: Manually confirm the user in Supabase Dashboard
- **Wrong environment variables**: Check your `.env.local` file
- **Database not set up**: Run the database setup scripts
- **Password too weak**: Use a stronger password (8+ characters, mixed case, numbers)

## Next Steps

After creating a test user:

1. **Test the login** at `http://localhost:3000/login`
2. **Verify dashboard access** - should redirect to `/dashboard`
3. **Test all features** - events, projects, resources, etc.

If you continue having issues, check the browser console for more detailed error messages. 

## Option 1: Create User via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your TechClub project

2. **Navigate to Authentication > Users**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Add a new user manually**
   - Click "Add user" or "New user"
   - Enter the following details:
     - **Email**: `test@techclub.com`
     - **Password**: `testpassword123`
     - **Email confirm**: Check this if required
   - Click "Create user"

4. **Verify the user was created**
   - The user should appear in the users list
   - Status should show as "Confirmed"

## Option 2: Create User via SQL (if you have database access)

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert a test user into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@techclub.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);
```

## Option 3: Use the Registration Page

1. **Go to your app's registration page**
   - Navigate to `http://localhost:3000/register`
   - Create a new account with:
     - **Email**: `test@techclub.com`
     - **Password**: `testpassword123`
     - **First Name**: `Test`
     - **Last Name**: `User`

## Test Login Credentials

Once you've created a user, you can test with:

- **Email**: `test@techclub.com`
- **Password**: `testpassword123`

## Troubleshooting

### If you still get "Invalid login credentials":

1. **Check Supabase Configuration**
   - Verify your `.env.local` file has correct Supabase URL and anon key
   - Make sure the environment variables are loaded

2. **Check Database Setup**
   - Run the database setup scripts in Supabase SQL Editor
   - Ensure the `profiles` table exists

3. **Check User Status**
   - In Supabase Dashboard > Authentication > Users
   - Make sure the user status is "Confirmed"
   - If not, manually confirm the user

4. **Clear Browser Cache**
   - Clear your browser's cache and cookies
   - Try in an incognito/private window

### Common Issues:

- **User not confirmed**: Manually confirm the user in Supabase Dashboard
- **Wrong environment variables**: Check your `.env.local` file
- **Database not set up**: Run the database setup scripts
- **Password too weak**: Use a stronger password (8+ characters, mixed case, numbers)

## Next Steps

After creating a test user:

1. **Test the login** at `http://localhost:3000/login`
2. **Verify dashboard access** - should redirect to `/dashboard`
3. **Test all features** - events, projects, resources, etc.

If you continue having issues, check the browser console for more detailed error messages. 