# External API Integration Guide

This guide explains how to connect your TechClub app to external services like Devpost and LeetCode.

## 🚀 **Devpost Integration**

### **Approach 1: Web Scraping (Current Implementation)**

The current implementation uses web scraping to fetch hackathon data from Devpost. This approach:

**✅ Pros:**
- No API key required
- Can access public data
- Works immediately

**❌ Cons:**
- May break if Devpost changes their HTML structure
- Rate limiting concerns
- Not officially supported

**Current Setup:**
```typescript
// File: app/api/devpost/route.ts
// Fetches data from: https://devpost.com/hackathons
// Returns: Array of hackathon objects
```

### **Approach 2: RSS Feed (Alternative)**

Devpost provides an RSS feed that's more stable:

```typescript
const rssUrl = 'https://devpost.com/hackathons.rss'
```

### **Approach 3: Third-Party API Services**

Consider using services like:
- **RapidAPI** - Has Devpost endpoints
- **ScrapingBee** - Professional web scraping service
- **Apify** - Web scraping platform

### **Approach 4: Manual Curation (Recommended for Production)**

For a production app, consider manually curating hackathons:

```sql
-- Database table for curated hackathons
CREATE TABLE curated_hackathons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  prizes TEXT,
  participants INTEGER DEFAULT 0,
  devpost_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏆 **LeetCode Integration**

### **Approach 1: LeetCode GraphQL API**

LeetCode has a GraphQL API, but it's not officially documented:

```typescript
// File: app/api/leetcode/route.ts
const leetcodeApiUrl = 'https://leetcode.com/graphql'
```

### **Approach 2: Manual Tracking (Recommended)**

Create a system for members to submit their LeetCode profiles:

```sql
-- Database table for LeetCode profiles
CREATE TABLE leetcode_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  leetcode_username VARCHAR(255) UNIQUE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE
);
```

### **Approach 3: Web Scraping**

Scrape LeetCode profile pages (requires user consent):

```typescript
// Example: Scrape user profile
const profileUrl = `https://leetcode.com/${username}/`
```

## 🔧 **Implementation Steps**

### **Step 1: Set Up Environment Variables**

Add to your `.env.local`:

```env
# API Keys (if using paid services)
RAPIDAPI_KEY=your_rapidapi_key
SCRAPINGBEE_API_KEY=your_scrapingbee_key

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=3600000

# Cache Settings
CACHE_DURATION=3600000
```

### **Step 2: Create API Utilities**

```typescript
// lib/api-utils.ts
export class RateLimiter {
  private requests: number[] = []
  private limit: number
  private window: number

  constructor(limit: number, window: number) {
    this.limit = limit
    this.window = window
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.window)
    
    if (this.requests.length >= this.limit) {
      return false
    }
    
    this.requests.push(now)
    return true
  }
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

### **Step 3: Add Caching**

```typescript
// lib/cache.ts
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class Cache {
  private cache = new Map<string, CacheEntry>()

  set(key: string, data: any, ttl: number = 3600000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
}

export const cache = new Cache()
```

### **Step 4: Update API Routes**

```typescript
// app/api/devpost/route.ts (Enhanced)
import { RateLimiter } from '@/lib/api-utils'
import { cache } from '@/lib/cache'

const rateLimiter = new RateLimiter(100, 3600000) // 100 requests per hour

export async function GET() {
  // Check cache first
  const cached = cache.get('devpost-hackathons')
  if (cached) {
    return NextResponse.json(cached)
  }

  // Check rate limit
  if (!await rateLimiter.checkLimit()) {
    return NextResponse.json({
      success: false,
      error: 'Rate limit exceeded'
    }, { status: 429 })
  }

  // Fetch data...
  const data = await fetchDevpostData()
  
  // Cache the result
  cache.set('devpost-hackathons', data, 1800000) // 30 minutes
  
  return NextResponse.json(data)
}
```

## 🎯 **Production Recommendations**

### **For Devpost:**

1. **Use a Third-Party Service:**
   ```typescript
   // Example with RapidAPI
   const response = await fetch('https://rapidapi.com/devpost-api', {
     headers: {
       'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
       'X-RapidAPI-Host': 'devpost.p.rapidapi.com'
     }
   })
   ```

2. **Manual Curation System:**
   - Create an admin panel to add/remove hackathons
   - Allow users to submit hackathons for review
   - Use webhooks to notify when new hackathons are added

3. **Hybrid Approach:**
   - Use scraping for discovery
   - Manually curate the best ones
   - Store in your database

### **For LeetCode:**

1. **User Self-Reporting:**
   ```typescript
   // Allow users to add their LeetCode profile
   const addLeetCodeProfile = async (userId: string, username: string) => {
     // Verify the profile exists
     const isValid = await verifyLeetCodeProfile(username)
     if (isValid) {
       await supabase.from('leetcode_profiles').upsert({
         user_id: userId,
         leetcode_username: username,
         verified_at: new Date().toISOString()
       })
     }
   }
   ```

2. **Automated Verification:**
   ```typescript
   // Verify LeetCode profile exists
   const verifyLeetCodeProfile = async (username: string) => {
     try {
       const response = await fetch(`https://leetcode.com/${username}/`)
       return response.ok
     } catch {
       return false
     }
   }
   ```

3. **Leaderboard System:**
   ```sql
   -- Create a view for rankings
   CREATE VIEW leetcode_rankings AS
   SELECT 
     lp.user_id,
     up.first_name,
     up.last_name,
     lp.leetcode_username,
     lp.problems_solved,
     lp.rating,
     lp.streak,
     ROW_NUMBER() OVER (ORDER BY lp.rating DESC, lp.problems_solved DESC) as rank
   FROM leetcode_profiles lp
   JOIN user_profiles up ON lp.user_id = up.id
   WHERE lp.is_verified = TRUE
   ORDER BY lp.rating DESC, lp.problems_solved DESC;
   ```

## 🔒 **Security Considerations**

1. **Rate Limiting:** Implement proper rate limiting to avoid being blocked
2. **User-Agent:** Use realistic user agents
3. **Caching:** Cache responses to reduce API calls
4. **Error Handling:** Graceful fallbacks when APIs fail
5. **Data Validation:** Validate all incoming data

## 📊 **Monitoring**

Add monitoring to track API performance:

```typescript
// lib/monitoring.ts
export const trackApiCall = async (apiName: string, duration: number, success: boolean) => {
  // Send to your analytics service
  console.log(`API Call: ${apiName}, Duration: ${duration}ms, Success: ${success}`)
}
```

## 🚀 **Next Steps**

1. **Test the current implementation** - Run your app and check the Devpost tab
2. **Choose your approach** - Decide between scraping, APIs, or manual curation
3. **Implement caching** - Add Redis or in-memory caching
4. **Add monitoring** - Track API performance and errors
5. **Create admin tools** - Build interfaces for manual curation
6. **Set up automated updates** - Use cron jobs or webhooks

## 📝 **Example Usage**

```typescript
// In your dashboard component
const loadExternalData = async () => {
  const [devpostData, leetcodeData] = await Promise.all([
    fetch('/api/devpost').then(r => r.json()),
    fetch('/api/leetcode').then(r => r.json())
  ])
  
  setDevpostHackathons(devpostData.data)
  setLeetcodeRankings(leetcodeData.data)
}
```

This setup gives you a solid foundation for integrating external APIs while maintaining flexibility for different approaches based on your needs and resources. 