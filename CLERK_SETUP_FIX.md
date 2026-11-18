# 🔧 Clerk Configuration Fix Guide

## 🚨 Current Issue
You're getting this error:
```
Configuration Error
Clerk authentication is not properly configured
Please ensure that NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set in your environment variables.
```

## 📋 Step-by-Step Fix

### **Step 1: Create/Update Environment File**

Create a `.env.local` file in your project root (if it doesn't exist) or update your existing one:

```bash
# Create the file
touch .env.local
```

### **Step 2: Add Clerk Environment Variables**

Add these variables to your `.env.local` file:

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (OPTIONAL but recommended)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Your existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key_here
```

### **Step 3: Get Your Clerk Keys**

#### **Option A: If you already have a Clerk account**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** in the sidebar
4. Copy your keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

#### **Option B: If you don't have a Clerk account**
1. Go to [Clerk.com](https://clerk.com/)
2. Click **"Get Started"**
3. Create a new account
4. Create a new application
5. Go to **API Keys** and copy your keys

### **Step 4: Update Your Environment File**

Replace the placeholder values with your actual Clerk keys:

```env
# Example with real keys (replace with your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_1234567890abcdef
CLERK_SECRET_KEY=sk_test_1234567890abcdef
```

### **Step 5: Restart Your Development Server**

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 🔍 Verification Steps

### **Step 1: Check Environment Variables**
Make sure your `.env.local` file is in the project root and contains the correct keys.

### **Step 2: Verify Clerk Keys**
Your keys should look like this:
- **Publishable Key**: `pk_test_...` or `pk_live_...`
- **Secret Key**: `sk_test_...` or `sk_live_...`

### **Step 3: Test the Application**
1. Restart your development server
2. Go to `http://localhost:3000`
3. Try to access `/admin/applications`
4. You should see the Clerk sign-in page instead of the configuration error

## 🛠️ Troubleshooting

### **Issue 1: Keys not being read**
- Make sure your `.env.local` file is in the project root (same level as `package.json`)
- Make sure there are no spaces around the `=` sign
- Make sure there are no quotes around the values

### **Issue 2: Still getting configuration error**
1. Check that your keys are valid by testing them in the Clerk dashboard
2. Make sure you're using the correct environment (test vs live)
3. Restart your development server completely

### **Issue 3: Clerk dashboard not working**
1. Make sure your domain is added to Clerk's allowed domains
2. For local development, `localhost:3000` should be automatically allowed

## 📝 Complete Example

Here's what your `.env.local` file should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
CLERK_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Resend Email Service
RESEND_API_KEY=re_your_resend_api_key_here
```

## 🚀 Next Steps

After fixing the Clerk configuration:

1. **Test Authentication**: Try signing in/signing up
2. **Test Admin Access**: Access `/admin/applications` with an admin user
3. **Set Up Admin User**: Create an admin user in your database
4. **Test Email Functionality**: Test the approval email system

## 📞 Need Help?

If you're still having issues:
1. Check the Clerk documentation: https://clerk.com/docs
2. Verify your keys in the Clerk dashboard
3. Make sure your domain is properly configured in Clerk

---

**Remember**: Never commit your `.env.local` file to version control. It should already be in your `.gitignore` file. 