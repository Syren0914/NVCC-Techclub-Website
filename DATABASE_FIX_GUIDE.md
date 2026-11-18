# 🔧 Database Fix Guide

## 🚨 Issue: Foreign Key Constraint Error

The error you encountered:
```
ERROR: 42804: foreign key constraint "event_attendees_event_id_fkey" cannot be implemented
DETAIL: Key columns "event_id" and "id" are of incompatible types: uuid and integer.
```

This happens when there's a mismatch between data types in foreign key relationships.

## 🛠️ Solution Steps

### Step 1: Check Current Database State

First, let's see what tables already exist and their data types:

```sql
-- Run this in your Supabase SQL editor to check existing tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'event_attendees', 'workshops', 'workshop_enrollments')
ORDER BY table_name, ordinal_position;
```

### Step 2: Clean Up Existing Tables (If Needed)

If you have existing tables with wrong data types, run this migration script:

```sql
-- Copy and paste the contents of database-migration-fix.sql
-- This will drop and recreate all tables with correct UUID types
```

### Step 3: Alternative - Manual Fix

If you prefer to fix manually, run these commands in order:

```sql
-- 1. Drop junction tables first
DROP TABLE IF EXISTS resource_ratings CASCADE;
DROP TABLE IF EXISTS resource_views CASCADE;
DROP TABLE IF EXISTS workshop_enrollments CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS leetcode_progress CASCADE;
DROP TABLE IF EXISTS leetcode_user_stats CASCADE;

-- 2. Drop main tables
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 3. Now run the complete schema
-- Copy and paste the contents of database-complete-schema.sql
```

### Step 4: Verify the Fix

After running the migration, verify that all tables have correct UUID types:

```sql
-- Check that events table has UUID id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'id';

-- Check that event_attendees has UUID foreign keys
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_attendees' 
AND column_name IN ('id', 'event_id', 'user_id');
```

## 🔍 Common Issues and Solutions

### Issue 1: "Table already exists"
**Solution**: Use `DROP TABLE IF EXISTS` before creating tables

### Issue 2: "Permission denied"
**Solution**: Make sure you're using the correct database user with proper permissions

### Issue 3: "Extension not found"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue 4: "Policy already exists"
**Solution**: Drop existing policies first:
```sql
DROP POLICY IF EXISTS "Anyone can view events" ON events;
-- Then recreate policies
```

## ✅ Verification Checklist

After running the migration, verify:

- [ ] All tables created successfully
- [ ] No foreign key constraint errors
- [ ] UUID extension enabled
- [ ] RLS policies created
- [ ] Indexes created
- [ ] Sample data inserted

## 🧪 Test the Database

```sql
-- Test basic queries
SELECT * FROM events LIMIT 5;
SELECT * FROM workshops LIMIT 5;
SELECT * FROM resources LIMIT 5;

-- Test foreign key relationships
SELECT e.title, ea.status 
FROM events e 
JOIN event_attendees ea ON e.id = ea.event_id 
LIMIT 5;
```

## 🚀 Next Steps

1. **Run the migration script** (`database-migration-fix.sql`)
2. **Verify all tables** are created correctly
3. **Test the API endpoints** to ensure they work
4. **Check the dashboard** loads data properly

## 📞 If You Still Have Issues

If you continue to have problems:

1. **Check the Supabase logs** for detailed error messages
2. **Verify your database connection** settings
3. **Ensure you have proper permissions** in your Supabase project
4. **Try running the scripts in smaller chunks** if needed

The migration script should resolve the foreign key constraint issue by ensuring all ID fields consistently use UUID type throughout the database schema. 