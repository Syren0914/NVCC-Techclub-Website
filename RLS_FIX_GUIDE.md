# Fix for "new row violates row-level security policy" Error

## 🔍 **Problem**
When users try to sign up, they get this error:
```
new row violates row-level security policy for table "user_profiles"
```

This happens because the RLS (Row Level Security) policy prevents the trigger from creating the user profile during signup.

## ✅ **Solution**

### **Step 1: Use the Simplified Schema**

1. Go to your **Supabase SQL Editor**
2. Create a **New Query**
3. Copy and paste the content from `database-auth-schema-simple.sql`
4. Click **Run**

This simplified version:
- ✅ Removes complex RLS policies that cause permission issues
- ✅ Uses a trigger to automatically create user profiles
- ✅ Works with Supabase's built-in authentication

### **Step 2: Alternative - Disable RLS Temporarily**

If you want to keep the original schema, you can temporarily disable RLS:

```sql
-- Temporarily disable RLS on user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Run your signup process

-- Re-enable RLS after testing
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### **Step 3: Test the Fix**

1. **Try signing up** with a valid `@email.vccs.edu` address
2. **Check if the user profile is created** automatically
3. **Verify the user can log in** successfully

## 🎯 **How It Works**

### **The Trigger Approach**
```sql
-- This trigger automatically creates a user profile when a user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### **The Function**
```sql
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
```

## 🔧 **Why This Works**

1. **SECURITY DEFINER**: The function runs with the privileges of the function creator (not the user)
2. **Trigger Timing**: Runs AFTER INSERT on auth.users, so the user is already created
3. **No RLS Conflicts**: The trigger bypasses RLS policies during profile creation

## 📋 **Verification Steps**

After running the simplified schema:

1. **Check if tables exist**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%';
```

2. **Check if trigger exists**:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

3. **Test signup process**:
   - Go to your app's register page
   - Use a valid `@email.vccs.edu` email
   - Complete the signup process
   - Check if user profile was created

## 🚨 **If Still Having Issues**

If you're still getting RLS errors:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Navigate to Logs
   - Look for authentication errors

2. **Verify Environment Variables**:
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` is set
   - Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

3. **Test with a simple signup**:
   - Try signing up with minimal data
   - Check if the basic profile creation works

## 🎉 **Expected Result**

After implementing this fix:
- ✅ Users can sign up without RLS errors
- ✅ User profiles are created automatically
- ✅ Email validation works correctly
- ✅ Users can log in and access the dashboard

The signup process should now work smoothly without any permission errors! 