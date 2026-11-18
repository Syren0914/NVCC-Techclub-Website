# Authentication Troubleshooting Guide

## 🔍 **Problem**
When trying to sign in, you get this error:
```
Cannot read properties of undefined (reading 'user')
```

## ✅ **Solutions**

### **Step 1: Check Environment Variables**

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 2: Verify Supabase Configuration**

1. **Go to your Supabase Dashboard**
2. **Navigate to Settings > API**
3. **Copy the URL and anon key**
4. **Update your `.env.local` file**

### **Step 3: Test the Connection**

Add this debug code to your login page temporarily:

```typescript
import { debugAuth, testSupabaseConnection } from '@/lib/auth-debug'

// In your handleLogin function, add this before the signIn call:
await testSupabaseConnection()
const debugResult = await debugAuth(email, password)
console.log('Debug result:', debugResult)
```

### **Step 4: Check Browser Console**

Open your browser's developer tools and check the console for:
- ✅ Environment variables are loaded
- ✅ Supabase connection is successful
- ✅ Authentication response details

### **Step 5: Common Issues & Fixes**

#### **Issue 1: Environment Variables Not Set**
```
❌ NEXT_PUBLIC_SUPABASE_URL: Missing
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing
```

**Fix**: Create or update your `.env.local` file

#### **Issue 2: Wrong Supabase Credentials**
```
🚨 Authentication error: Invalid login credentials
```

**Fix**: 
1. Check your Supabase project settings
2. Verify the URL and anon key are correct
3. Make sure the user exists in your Supabase auth

#### **Issue 3: User Doesn't Exist**
```
🚨 Authentication error: Invalid login credentials
```

**Fix**: 
1. Create a test user in Supabase Dashboard
2. Go to Authentication > Users
3. Add a user with a valid `@email.vccs.edu` address

#### **Issue 4: Database Schema Not Set Up**
```
🚨 Connection error: relation "user_profiles" does not exist
```

**Fix**: 
1. Run the database schema files in Supabase SQL Editor
2. Start with `database-schema-simple.sql`
3. Then run `database-auth-schema-simple.sql`

### **Step 6: Test with a Simple User**

1. **Create a test user in Supabase Dashboard**:
   - Go to Authentication > Users
   - Click "Add User"
   - Email: `test@email.vccs.edu`
   - Password: `testpassword123`

2. **Try logging in with these credentials**

### **Step 7: Debug Steps**

1. **Check the browser console** for detailed error messages
2. **Verify Supabase project is active** (not paused)
3. **Check if RLS policies are blocking access**
4. **Test with a simple sign-in without 2FA**

### **Step 8: Alternative Debug Method**

Add this to your login page to see exactly what's happening:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
    console.log('🔄 Starting login process...')
    console.log('📧 Email:', email)
    
    const data = await signIn(email, password)
    console.log('📊 Sign in response:', data)
    
    if (data && data.user) {
      console.log('✅ User authenticated:', data.user.id)
      // ... rest of your code
    } else {
      console.error('❌ No user data returned')
      throw new Error('Authentication failed')
    }
  } catch (error: any) {
    console.error('🚨 Login error:', error)
    setError(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## 🎯 **Expected Flow**

1. ✅ **User enters email/password**
2. ✅ **Email domain is validated**
3. ✅ **Supabase authentication is called**
4. ✅ **User data is returned**
5. ✅ **Profile is fetched**
6. ✅ **User is redirected to dashboard**

## 🚨 **If Still Having Issues**

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Navigate to Logs
   - Look for authentication errors

2. **Verify Project Status**:
   - Make sure your Supabase project is not paused
   - Check if you're on the correct project

3. **Test with Postman/curl**:
   ```bash
   curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
   -H 'apikey: your-anon-key' \
   -H 'Content-Type: application/json' \
   -d '{"email":"test@email.vccs.edu","password":"testpassword123"}'
   ```

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ No console errors
- ✅ User profile is created automatically
- ✅ Login redirects to dashboard
- ✅ Email validation works
- ✅ 2FA works (if enabled)

The authentication should now work smoothly without any undefined errors! 