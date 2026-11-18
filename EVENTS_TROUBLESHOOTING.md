# Events Page Troubleshooting Guide

## Common Issues and Solutions

### 1. No Events Loading

**Symptoms:**
- Events page shows "No events available" or "Loading events..."
- Console shows database connection errors

**Possible Causes:**
- Database not set up
- Environment variables missing
- Database connection failed
- Events table doesn't exist

**Solutions:**

#### Check Environment Variables
Make sure you have a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Set Up Database
1. Go to `/admin/database-setup` in your app
2. Follow the instructions to run the SQL script in Supabase
3. Or manually run `database-setup-fixed.sql` in your Supabase SQL editor

#### Test Database Connection
1. Visit `/api/test-db` to check if the database is accessible
2. Check the browser console for detailed error messages

### 2. Events Not Displaying Correctly

**Symptoms:**
- Events show but with missing information
- Wrong dates, times, or locations
- Missing images

**Solutions:**

#### Check Database Schema
Ensure your events table has these fields:
- `id` (UUID)
- `title` (TEXT)
- `description` (TEXT)
- `start_date` (DATE)
- `start_time` (TIME)
- `location` (TEXT)
- `event_type` (TEXT)
- `is_online` (BOOLEAN)

#### Verify Sample Data
Run this query in Supabase to check if events exist:
```sql
SELECT * FROM events LIMIT 5;
```

### 3. Development Debug Features

The events page includes debug features when `NODE_ENV=development`:

- **Database Status Banner**: Shows connection status at the top
- **Retry Connection Button**: Tests database connection again
- **Database Setup Link**: Quick access to setup page

### 4. Fallback Events

If no events are found in the database, the page will show fallback events:
- Welcome to TechClub! (7 days from now)
- Web Development Workshop (14 days from now)

This ensures the page doesn't appear completely empty during development.

## Quick Fix Commands

### Reset Database
```sql
-- Drop and recreate all tables
\i database-setup-fixed.sql
```

### Insert Test Events
```sql
INSERT INTO events (title, description, start_date, start_time, location, event_type) VALUES
('Test Event 1', 'This is a test event', CURRENT_DATE + INTERVAL '1 day', '14:00:00', 'Room 101', 'workshop'),
('Test Event 2', 'Another test event', CURRENT_DATE + INTERVAL '2 days', '16:00:00', 'Online', 'meeting');
```

### Check RLS Policies
```sql
-- Ensure events are publicly readable
SELECT * FROM pg_policies WHERE tablename = 'events';
```

## Still Having Issues?

1. Check the browser console for JavaScript errors
2. Check the Network tab for failed API calls
3. Verify your Supabase project is active and accessible
4. Ensure your database has the correct schema from `database-setup-fixed.sql`
