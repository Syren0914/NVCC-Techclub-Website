# 🔗 Backend Connection Setup Guide

This guide will help you connect all features to the backend database and APIs.

## 📋 Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Environment Variables**: Configure your `.env.local` file
3. **Database Access**: Access to your Supabase database

## 🗄️ Database Setup

### Step 1: Run the Complete Schema

Execute the complete database schema to create all tables:

```sql
-- Run this in your Supabase SQL editor
-- Copy and paste the contents of database-complete-schema.sql
```

### Step 2: Run the Roles Schema

Execute the roles and permissions schema:

```sql
-- Run this in your Supabase SQL editor
-- Copy and paste the contents of database-roles-schema.sql
```

### Step 3: Run the LeetCode Schema

Execute the LeetCode integration schema:

```sql
-- Run this in your Supabase SQL editor
-- Copy and paste the contents of database-leetcode-schema.sql
```

## 🔧 Environment Configuration

### Step 1: Update `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External APIs (Optional)
LEETCODE_API_KEY=your_leetcode_api_key
DEVPOST_API_KEY=your_devpost_api_key
```

### Step 2: Verify Environment Variables

Check that your environment variables are loaded correctly:

```typescript
// In your app, you can test this:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)
```

## 🚀 API Endpoints

### Available Endpoints

1. **Dashboard API**: `/api/dashboard?userId={userId}`
   - Fetches all dashboard data from database
   - Includes user profile, roles, events, projects, etc.

2. **Roles API**: `/api/roles`
   - GET: Fetch user roles and permissions
   - POST: Assign roles to users
   - PUT: Update role permissions
   - DELETE: Remove user roles

3. **LeetCode APIs**:
   - `/api/leetcode` - Rankings and user data
   - `/api/leetcode/daily` - Daily problems
   - `/api/leetcode/progress` - User progress
   - `/api/leetcode/execute` - Code execution

4. **Devpost API**: `/api/devpost`
   - Fetches hackathon data

## 🔐 Authentication & Authorization

### User Roles Hierarchy

```
👑 President (Highest)
├── Manage all roles and permissions
├── Access admin panel
├── Delete events and manage club settings
└── Full administrative access

🛡️ Vice President
├── Manage officers and members
├── Approve events and manage budget
├── Send notifications
└── High administrative access

✅ Officer
├── Create and edit events
├── Manage resources and moderate discussions
├── View analytics
└── Moderate administrative access

👤 Member (Base)
├── View and join events
├── Participate in LeetCode
├── Submit feedback
└── Basic access
```

### Permission System

Each role has specific permissions:

- **Member**: `view_events`, `join_events`, `view_resources`, `participate_leetcode`, `view_projects`, `submit_feedback`
- **Officer**: All member permissions + `create_events`, `edit_events`, `manage_resources`, `moderate_discussions`, `view_analytics`
- **Vice President**: All officer permissions + `manage_officers`, `approve_events`, `manage_budget`, `view_member_list`, `send_notifications`
- **President**: All vice president permissions + `manage_all_roles`, `delete_events`, `manage_club_settings`, `access_admin_panel`

## 📊 Database Tables

### Core Tables

1. **profiles** - User profiles with extended information
2. **user_roles** - Role assignments and permissions
3. **events** - Club events and meetings
4. **workshops** - Educational workshops
5. **projects** - User projects and contributions
6. **resources** - Learning resources and materials
7. **notifications** - User notifications
8. **activities** - User activity tracking

### LeetCode Tables

1. **leetcode_progress** - Individual problem progress
2. **leetcode_user_stats** - User statistics and rankings
3. **leetcode_problems** - Problem metadata
4. **leetcode_categories** - Problem categories
5. **leetcode_daily_submissions** - Daily submission tracking

### Junction Tables

1. **event_attendees** - Event registrations
2. **workshop_enrollments** - Workshop enrollments
3. **resource_views** - Resource view tracking
4. **resource_ratings** - Resource ratings and reviews

## 🔄 Data Flow

### Dashboard Data Flow

```
User Login → Get Current User → Fetch Dashboard Data → Display
     ↓
Check Permissions → Load Role-Specific Data → Update UI
```

### API Data Flow

```
Frontend Request → API Route → Database Query → Process Data → Return Response
```

## 🧪 Testing the Backend

### Step 1: Test Database Connection

```typescript
// Test in your browser console or API route
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Database connection:', error ? 'Failed' : 'Success')
```

### Step 2: Test API Endpoints

```bash
# Test dashboard API
curl "http://localhost:3000/api/dashboard?userId=your_user_id"

# Test roles API
curl "http://localhost:3000/api/roles"

# Test LeetCode API
curl "http://localhost:3000/api/leetcode"
```

### Step 3: Test Role Management

```typescript
// Test role assignment
const response = await fetch('/api/roles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_id',
    role: 'member',
    assignedBy: 'admin_id'
  })
})
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase URL and API key
   - Verify environment variables
   - Check network connectivity

2. **RLS Policies Blocking Access**
   - Verify user authentication
   - Check role assignments
   - Review policy definitions

3. **API Endpoints Not Working**
   - Check server logs
   - Verify route handlers
   - Test individual endpoints

4. **Role Permissions Not Working**
   - Check role assignments in database
   - Verify permission arrays
   - Test permission functions

### Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
npm run dev
# Then check browser console for connection logs

# Check API routes
curl -v http://localhost:3000/api/dashboard
```

## 📈 Performance Optimization

### Database Indexes

All tables have appropriate indexes for:
- User lookups
- Date-based queries
- Status filtering
- Foreign key relationships

### Caching Strategy

- API responses cached for 5 minutes
- Static data cached longer
- User-specific data not cached

### Query Optimization

- Use specific column selection
- Implement pagination
- Add appropriate WHERE clauses
- Use database functions for complex operations

## 🚀 Production Deployment

### Environment Variables

```bash
# Production environment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Migrations

1. Run schema files in order
2. Test all functionality
3. Backup existing data
4. Deploy to production

### Monitoring

- Set up error tracking
- Monitor API response times
- Track database performance
- Set up alerts for failures

## ✅ Verification Checklist

- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Role system working
- [ ] LeetCode integration functional
- [ ] Dashboard loading data
- [ ] Permissions enforced
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Production ready

## 🎯 Next Steps

1. **Test all features** with real data
2. **Add more sample data** for testing
3. **Implement additional APIs** as needed
4. **Set up monitoring** and logging
5. **Deploy to production** when ready

Your TechClub backend is now fully connected! 🎉 