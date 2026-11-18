-- LeetCode Integration Database Schema
-- This schema supports daily problems, user progress tracking, and leaderboards

-- Problems table to store daily and practice problems
CREATE TABLE leetcode_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id VARCHAR(255) UNIQUE NOT NULL, -- LeetCode problem ID
    title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(10) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category VARCHAR(100),
    description TEXT,
    examples JSONB,
    constraints JSONB,
    starter_code JSONB, -- Different languages
    solution TEXT,
    tags JSONB,
    acceptance_rate DECIMAL(5,2),
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    is_daily BOOLEAN DEFAULT FALSE,
    daily_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE leetcode_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES leetcode_problems(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('not_started', 'attempted', 'solved')) DEFAULT 'not_started',
    submission_date TIMESTAMP WITH TIME ZONE,
    runtime INTEGER, -- in milliseconds
    memory DECIMAL(5,2), -- in MB
    language VARCHAR(50),
    code TEXT,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- User statistics for leaderboards
CREATE TABLE leetcode_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username VARCHAR(100),
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    average_runtime DECIMAL(8,2),
    rating INTEGER DEFAULT 0,
    rank INTEGER,
    last_solved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily challenge submissions
CREATE TABLE leetcode_daily_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES leetcode_problems(id) ON DELETE CASCADE,
    submission_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('solved', 'attempted')),
    runtime INTEGER,
    memory DECIMAL(5,2),
    language VARCHAR(50),
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, submission_date)
);

-- Streak tracking
CREATE TABLE leetcode_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    length INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem categories/tags
CREATE TABLE leetcode_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences for LeetCode
CREATE TABLE leetcode_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_language VARCHAR(50) DEFAULT 'python',
    difficulty_filter JSONB, -- ['Easy', 'Medium', 'Hard']
    category_filter JSONB, -- ['Array', 'String', etc.]
    daily_reminder BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_leetcode_problems_daily ON leetcode_problems(is_daily, daily_date);
CREATE INDEX idx_leetcode_problems_difficulty ON leetcode_problems(difficulty);
CREATE INDEX idx_leetcode_user_progress_user ON leetcode_user_progress(user_id);
CREATE INDEX idx_leetcode_user_progress_problem ON leetcode_user_progress(problem_id);
CREATE INDEX idx_leetcode_user_progress_status ON leetcode_user_progress(status);
CREATE INDEX idx_leetcode_user_stats_rating ON leetcode_user_stats(rating DESC);
CREATE INDEX idx_leetcode_user_stats_solved ON leetcode_user_stats(total_solved DESC);
CREATE INDEX idx_leetcode_daily_submissions_date ON leetcode_daily_submissions(submission_date);
CREATE INDEX idx_leetcode_streaks_user_active ON leetcode_streaks(user_id, is_active);

-- Row Level Security (RLS) policies
ALTER TABLE leetcode_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_daily_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Problems: Everyone can read, only admins can modify
CREATE POLICY "Problems are viewable by everyone" ON leetcode_problems
    FOR SELECT USING (true);

-- User progress: Users can only see their own progress
CREATE POLICY "Users can view own progress" ON leetcode_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON leetcode_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON leetcode_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User stats: Users can see all stats (for leaderboard), but only modify their own
CREATE POLICY "User stats are viewable by everyone" ON leetcode_user_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own stats" ON leetcode_user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON leetcode_user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Daily submissions: Users can only see their own
CREATE POLICY "Users can view own daily submissions" ON leetcode_daily_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily submissions" ON leetcode_daily_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks: Users can only see their own
CREATE POLICY "Users can view own streaks" ON leetcode_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON leetcode_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences: Users can only see and modify their own
CREATE POLICY "Users can view own preferences" ON leetcode_user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON leetcode_user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON leetcode_user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user stats when progress changes
    INSERT INTO leetcode_user_stats (user_id, total_solved, easy_solved, medium_solved, hard_solved)
    SELECT 
        user_id,
        COUNT(*) FILTER (WHERE status = 'solved'),
        COUNT(*) FILTER (WHERE status = 'solved' AND p.difficulty = 'Easy'),
        COUNT(*) FILTER (WHERE status = 'solved' AND p.difficulty = 'Medium'),
        COUNT(*) FILTER (WHERE status = 'solved' AND p.difficulty = 'Hard')
    FROM leetcode_user_progress up
    JOIN leetcode_problems p ON up.problem_id = p.id
    WHERE up.user_id = NEW.user_id
    GROUP BY up.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_solved = EXCLUDED.total_solved,
        easy_solved = EXCLUDED.easy_solved,
        medium_solved = EXCLUDED.medium_solved,
        hard_solved = EXCLUDED.hard_solved,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when progress changes
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE ON leetcode_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to get daily leaderboard
CREATE OR REPLACE FUNCTION get_daily_leaderboard(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    username VARCHAR,
    submission_time TIMESTAMP WITH TIME ZONE,
    runtime INTEGER,
    memory DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ds.created_at) as rank,
        ds.user_id,
        us.username,
        ds.created_at as submission_time,
        ds.runtime,
        ds.memory
    FROM leetcode_daily_submissions ds
    JOIN leetcode_user_stats us ON ds.user_id = us.user_id
    WHERE ds.submission_date = target_date
    AND ds.status = 'solved'
    ORDER BY ds.created_at;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion
INSERT INTO leetcode_categories (name, description, color) VALUES
('Array', 'Array manipulation problems', '#FF6B6B'),
('String', 'String processing problems', '#4ECDC4'),
('Hash Table', 'Hash table and map problems', '#45B7D1'),
('Linked List', 'Linked list problems', '#96CEB4'),
('Tree', 'Tree and binary tree problems', '#FFEAA7'),
('Graph', 'Graph and traversal problems', '#DDA0DD'),
('Dynamic Programming', 'Dynamic programming problems', '#98D8C8'),
('Backtracking', 'Backtracking and recursion problems', '#F7DC6F');

-- Insert sample daily problem
INSERT INTO leetcode_problems (
    problem_id, title, difficulty, category, description, 
    examples, constraints, starter_code, tags, 
    acceptance_rate, likes, dislikes, is_daily, daily_date
) VALUES (
    'daily-2024-12-14',
    'Two Sum',
    'Easy',
    'Array',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    '["Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].", "Input: nums = [3,2,4], target = 6\nOutput: [1,2]", "Input: nums = [3,3], target = 6\nOutput: [0,1]"]',
    '["2 <= nums.length <= 104", "-109 <= nums[i] <= 109", "-109 <= target <= 109", "Only one valid answer exists."]',
    '{"python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Your code here\n        pass", "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Your code here\n};", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}"}',
    '["Array", "Hash Table"]',
    49.2,
    45000,
    1500,
    true,
    '2024-12-14'
); 