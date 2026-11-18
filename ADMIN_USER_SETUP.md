# Admin User Setup Guide

## Quick Setup

To create an admin user for your TechClub application, follow these steps:

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon public** key

### 2. Create Environment File

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the Admin User Script

```bash
node scripts/create-admin-user.js
```

### 4. Login with Admin Account

- **Email**: admin@techclub.com
- **Password**: adminpassword123

### 5. Access Admin Dashboard

After logging in, you'll see an "Admin" button in your dashboard that takes you to `/admin`.

## Alternative: Run with Environment Variables

If you don't want to create a `.env.local` file, you can run the script directly with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here node scripts/create-admin-user.js
```

## What the Script Does

1. Creates a new user in Supabase Auth
2. Creates a profile entry in the `profiles` table
3. Assigns the 'admin' role in the `user_roles` table
4. Provides login credentials

## Troubleshooting

### "Invalid URL" Error
- Make sure your Supabase URL is correct (should start with `https://`)
- Make sure your anon key is valid

### "User already exists" Error
- The admin user already exists, you can use the existing credentials
- Or change the email in the script to create a different admin user

### Database Connection Errors
- Make sure your database tables are set up (run the SQL scripts in Supabase)
- Check that RLS policies allow the operations

## Admin Features

Once logged in as admin, you can:

- **Manage Users**: View, update roles, delete users
- **Manage Events**: Create, edit, delete events
- **Manage Projects**: Create, edit, delete projects  
- **Manage Resources**: Create, edit, delete resources
- **Manage Team**: Create, edit, delete team members
- **View Analytics**: See counts and recent activity

## Security Notes

- Change the admin password after first login
- The admin user has full access to all data
- Consider creating additional admin users with different emails
- Regularly review admin access and permissions 

## Quick Setup

To create an admin user for your TechClub application, follow these steps:

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon public** key

### 2. Create Environment File

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the Admin User Script

```bash
node scripts/create-admin-user.js
```

### 4. Login with Admin Account

- **Email**: admin@techclub.com
- **Password**: adminpassword123

### 5. Access Admin Dashboard

After logging in, you'll see an "Admin" button in your dashboard that takes you to `/admin`.

## Alternative: Run with Environment Variables

If you don't want to create a `.env.local` file, you can run the script directly with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here node scripts/create-admin-user.js
```

## What the Script Does

1. Creates a new user in Supabase Auth
2. Creates a profile entry in the `profiles` table
3. Assigns the 'admin' role in the `user_roles` table
4. Provides login credentials

## Troubleshooting

### "Invalid URL" Error
- Make sure your Supabase URL is correct (should start with `https://`)
- Make sure your anon key is valid

### "User already exists" Error
- The admin user already exists, you can use the existing credentials
- Or change the email in the script to create a different admin user

### Database Connection Errors
- Make sure your database tables are set up (run the SQL scripts in Supabase)
- Check that RLS policies allow the operations

## Admin Features

Once logged in as admin, you can:

- **Manage Users**: View, update roles, delete users
- **Manage Events**: Create, edit, delete events
- **Manage Projects**: Create, edit, delete projects  
- **Manage Resources**: Create, edit, delete resources
- **Manage Team**: Create, edit, delete team members
- **View Analytics**: See counts and recent activity

## Security Notes

- Change the admin password after first login
- The admin user has full access to all data
- Consider creating additional admin users with different emails
- Regularly review admin access and permissions 