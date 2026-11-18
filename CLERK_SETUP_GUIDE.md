# Clerk Authentication Setup Guide

## Overview

This guide will help you set up Clerk authentication for the TechClub application with email domain restrictions for `@email.vccs.edu` addresses.

## Step 1: Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application

## Step 2: Configure Your Application

### Basic Settings
1. In your Clerk dashboard, go to **Settings** → **General**
2. Set your application name to "TechClub"
3. Configure your domain settings

### Email Domain Restrictions
1. Go to **Settings** → **User & Authentication** → **Email, Phone, Username**
2. Enable "Email address" as a required field
3. Go to **Settings** → **User & Authentication** → **Email Addresses**
4. Add `email.vccs.edu` to the allowed domains
5. Set the domain verification to "Required"

### Authentication Settings
1. Go to **Settings** → **User & Authentication** → **Sign-in & Sign-up**
2. Enable "Email address" as a sign-in method
3. Configure password requirements as needed
4. Set up email verification

## Step 3: Get Your API Keys

1. Go to **API Keys** in your Clerk dashboard
2. Copy your **Publishable Key** and **Secret Key**
3. Add them to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Step 4: Configure Email Domain Restrictions

### Option 1: Clerk Dashboard (Recommended)
1. Go to **Settings** → **User & Authentication** → **Email Addresses**
2. Add `email.vccs.edu` to the allowed domains
3. Set domain verification to "Required"

### Option 2: Custom Middleware (Advanced)
If you need more control, you can create a custom middleware that checks email domains:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const user = auth.userId ? auth.user : null;
    
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress;
      
      if (email && !email.endsWith('@email.vccs.edu')) {
        return Response.redirect(new URL('/unauthorized', req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Try to register with a non-VCCS email - it should be rejected
3. Try to register with a VCCS email - it should work
4. Test the login flow
5. Verify that the dashboard is accessible only to authenticated users

## Step 6: Customize the UI

### Login Page
The login page is located at `app/login/page.tsx` and uses Clerk's `SignIn` component.

### Register Page
The register page is located at `app/register/page.tsx` and uses Clerk's `SignUp` component.

### Unauthorized Page
The unauthorized page is located at `app/unauthorized/page.tsx` and shows when users try to access protected routes with non-VCCS emails.

## Step 7: Update Database Integration

Since we're now using Clerk for authentication, you'll need to update your database integration:

1. **User Profiles**: Create a webhook to sync Clerk users with your Supabase profiles table
2. **Roles**: Update your role management to work with Clerk user IDs
3. **API Routes**: Update your API routes to use Clerk's `auth()` helper

### Example Webhook Handler
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create user profile in your database
    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    
    // Add to your Supabase profiles table
    // await supabase.from('profiles').insert({
    //   id: id,
    //   email: email,
    //   first_name: first_name,
    //   last_name: last_name,
    //   role: 'member'
    // });
  }

  return new Response('', { status: 200 });
}
```

## Troubleshooting

### Common Issues

1. **"authMiddleware is not exported"**
   - Use `clerkMiddleware` instead of `authMiddleware`
   - Make sure you're using the correct import path

2. **Email domain restrictions not working**
   - Check your Clerk dashboard settings
   - Verify the domain is added to allowed domains
   - Test with the exact domain format

3. **Webhook not working**
   - Check your webhook secret
   - Verify the webhook URL is correct
   - Check your server logs for errors

4. **Users can't access dashboard**
   - Check if the user is properly authenticated
   - Verify the email domain restrictions
   - Check the middleware configuration

### Environment Variables

Make sure these are in your `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Optional: Webhook secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Security Notes

- Keep your Clerk secret keys secure
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your application logs for suspicious activity
- Consider implementing rate limiting for authentication endpoints

## Next Steps

1. Set up webhooks to sync user data
2. Update your admin system to work with Clerk
3. Implement role-based access control
4. Add additional security measures as needed
5. Test thoroughly with different email domains 

## Overview

This guide will help you set up Clerk authentication for the TechClub application with email domain restrictions for `@email.vccs.edu` addresses.

## Step 1: Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application

## Step 2: Configure Your Application

### Basic Settings
1. In your Clerk dashboard, go to **Settings** → **General**
2. Set your application name to "TechClub"
3. Configure your domain settings

### Email Domain Restrictions
1. Go to **Settings** → **User & Authentication** → **Email, Phone, Username**
2. Enable "Email address" as a required field
3. Go to **Settings** → **User & Authentication** → **Email Addresses**
4. Add `email.vccs.edu` to the allowed domains
5. Set the domain verification to "Required"

### Authentication Settings
1. Go to **Settings** → **User & Authentication** → **Sign-in & Sign-up**
2. Enable "Email address" as a sign-in method
3. Configure password requirements as needed
4. Set up email verification

## Step 3: Get Your API Keys

1. Go to **API Keys** in your Clerk dashboard
2. Copy your **Publishable Key** and **Secret Key**
3. Add them to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Step 4: Configure Email Domain Restrictions

### Option 1: Clerk Dashboard (Recommended)
1. Go to **Settings** → **User & Authentication** → **Email Addresses**
2. Add `email.vccs.edu` to the allowed domains
3. Set domain verification to "Required"

### Option 2: Custom Middleware (Advanced)
If you need more control, you can create a custom middleware that checks email domains:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const user = auth.userId ? auth.user : null;
    
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress;
      
      if (email && !email.endsWith('@email.vccs.edu')) {
        return Response.redirect(new URL('/unauthorized', req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Try to register with a non-VCCS email - it should be rejected
3. Try to register with a VCCS email - it should work
4. Test the login flow
5. Verify that the dashboard is accessible only to authenticated users

## Step 6: Customize the UI

### Login Page
The login page is located at `app/login/page.tsx` and uses Clerk's `SignIn` component.

### Register Page
The register page is located at `app/register/page.tsx` and uses Clerk's `SignUp` component.

### Unauthorized Page
The unauthorized page is located at `app/unauthorized/page.tsx` and shows when users try to access protected routes with non-VCCS emails.

## Step 7: Update Database Integration

Since we're now using Clerk for authentication, you'll need to update your database integration:

1. **User Profiles**: Create a webhook to sync Clerk users with your Supabase profiles table
2. **Roles**: Update your role management to work with Clerk user IDs
3. **API Routes**: Update your API routes to use Clerk's `auth()` helper

### Example Webhook Handler
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create user profile in your database
    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    
    // Add to your Supabase profiles table
    // await supabase.from('profiles').insert({
    //   id: id,
    //   email: email,
    //   first_name: first_name,
    //   last_name: last_name,
    //   role: 'member'
    // });
  }

  return new Response('', { status: 200 });
}
```

## Troubleshooting

### Common Issues

1. **"authMiddleware is not exported"**
   - Use `clerkMiddleware` instead of `authMiddleware`
   - Make sure you're using the correct import path

2. **Email domain restrictions not working**
   - Check your Clerk dashboard settings
   - Verify the domain is added to allowed domains
   - Test with the exact domain format

3. **Webhook not working**
   - Check your webhook secret
   - Verify the webhook URL is correct
   - Check your server logs for errors

4. **Users can't access dashboard**
   - Check if the user is properly authenticated
   - Verify the email domain restrictions
   - Check the middleware configuration

### Environment Variables

Make sure these are in your `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Optional: Webhook secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Security Notes

- Keep your Clerk secret keys secure
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your application logs for suspicious activity
- Consider implementing rate limiting for authentication endpoints

## Next Steps

1. Set up webhooks to sync user data
2. Update your admin system to work with Clerk
3. Implement role-based access control
4. Add additional security measures as needed
5. Test thoroughly with different email domains 