# 🔧 User Profile Fix Guide

## 🚨 Issue: "User profile not found"

This error occurs when a user signs up but their profile isn't automatically created in the database.

## 🛠️ Quick Fix Steps

### Step 1: Run the Database Migration

First, run the migration script to ensure all tables exist:

```sql
-- Copy and paste the contents of database-migration-fix.sql
-- This will create all necessary tables with correct UUID types
```

### Step 2: Run the User Trigger Setup

```sql
-- Copy and paste the contents of database-user-trigger.sql
-- This will set up automatic profile creation for new users
```

### Step 3: Create Profile for Existing User (If Needed)

If you already have a user account, manually create their profile:

```sql
-- Replace 'your-user-id' with your actual user ID
INSERT INTO profiles (
    id,
    first_name,
    last_name,
    email,
    created_at,
    updated_at
) VALUES (
    'your-user-id',
    'Your',
    'Name',
    'your-email@example.com',
    NOW(),
    NOW()
);

-- Assign default member role
INSERT INTO user_roles (
    user_id,
    role,
    assigned_at,
    is_active,
    permissions
) VALUES (
    'your-user-id',
    'member',
    NOW(),
    true,
    ARRAY[
        'view_events',
        'join_events',
        'view_resources',
        'participate_leetcode',
        'view_projects',
        'submit_feedback'
    ]
);
```

## 🔍 How to Find Your User ID

### Method 1: Check Browser Console
1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Look for logs that show your user ID
4. It will look something like: `👤 Current user: {id: "12345678-1234-1234-1234-123456789abc"}`

### Method 2: Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Find your user account
4. Copy the User ID

### Method 3: Use the API
```javascript
// In your browser console, run:
const { data: { user } } = await supabase.auth.getUser()
console.log('User ID:', user.id)
```

## ✅ Verification

After running the fixes, test by:

1. **Refresh your dashboard page**
2. **Check the browser console** for success messages
3. **Verify the dashboard loads** with data

## 🚀 What the Fix Does

### ✅ Automatic Profile Creation
- Creates user profile when user signs up
- Assigns default "member" role
- Sets up basic permissions

### ✅ Fallback Data
- Provides sample data if database is empty
- Ensures dashboard always loads
- Graceful error handling

### ✅ Role Management
- Automatic role assignment
- Permission-based access control
- Role hierarchy enforcement

## 🔧 If You Still Have Issues

### Check Database Connection
```sql
-- Test if you can connect to the database
SELECT * FROM profiles LIMIT 1;
```

### Check User Authentication
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log('Authenticated user:', user)
```

### Check Environment Variables
Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📞 Common Solutions

### Issue: "Permission denied"
**Solution**: Run the migration script first to create tables

### Issue: "Table doesn't exist"
**Solution**: Run `database-migration-fix.sql` to create all tables

### Issue: "User not authenticated"
**Solution**: Sign out and sign back in to refresh authentication

### Issue: "RLS policy violation"
**Solution**: Run the user trigger setup to create proper policies

## 🎯 Expected Result

After applying the fixes:
- ✅ Dashboard loads without errors
- ✅ User profile is created automatically
- ✅ Default member role is assigned
- ✅ All features work properly
- ✅ No more "User profile not found" errors

Your TechClub dashboard should now work perfectly! 🎉 