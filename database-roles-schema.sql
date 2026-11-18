-- Roles and Permissions Schema for TechClub
-- This schema defines the role-based access control system

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'officer', 'vice_president', 'president')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Hierarchy Table
CREATE TABLE IF NOT EXISTS role_hierarchy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    can_manage_roles TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default role permissions
INSERT INTO role_permissions (role, permissions, description) VALUES
('member', ARRAY[
    'view_events',
    'join_events', 
    'view_resources',
    'participate_leetcode',
    'view_projects',
    'submit_feedback'
], 'Basic member with limited access'),
('officer', ARRAY[
    'view_events',
    'join_events',
    'view_resources', 
    'participate_leetcode',
    'view_projects',
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics'
], 'Officer with moderate administrative access'),
('vice_president', ARRAY[
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode', 
    'view_projects',
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics',
    'manage_officers',
    'approve_events',
    'manage_budget',
    'view_member_list',
    'send_notifications'
], 'Vice President with high administrative access'),
('president', ARRAY[
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode',
    'view_projects', 
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics',
    'manage_officers',
    'approve_events',
    'manage_budget',
    'view_member_list',
    'send_notifications',
    'manage_all_roles',
    'delete_events',
    'manage_club_settings',
    'access_admin_panel'
], 'President with full administrative access')
ON CONFLICT (role) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert role hierarchy
INSERT INTO role_hierarchy (role, can_manage_roles) VALUES
('member', ARRAY[]),
('officer', ARRAY['member']),
('vice_president', ARRAY['member', 'officer']),
('president', ARRAY['member', 'officer', 'vice_president'])
ON CONFLICT (role) DO UPDATE SET
    can_manage_roles = EXCLUDED.can_manage_roles;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Presidents can view all roles
CREATE POLICY "Presidents can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'president' 
            AND ur.is_active = true
        )
    );

-- Presidents can manage all roles
CREATE POLICY "Presidents can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'president' 
            AND ur.is_active = true
        )
    );

-- Vice Presidents can manage officers and members
CREATE POLICY "Vice Presidents can manage lower roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'vice_president' 
            AND ur.is_active = true
        )
        AND role IN ('member', 'officer')
    );

-- Officers can view member roles
CREATE POLICY "Officers can view member roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'officer' 
            AND ur.is_active = true
        )
        AND role = 'member'
    );

-- Functions for role management
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN (
        SELECT array_agg(DISTINCT permission)
        FROM user_roles ur
        CROSS JOIN LATERAL unnest(ur.permissions) AS permission
        WHERE ur.user_id = user_uuid 
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) > 0
        FROM user_roles ur
        WHERE ur.user_id = user_uuid 
        AND ur.is_active = true
        AND required_permission = ANY(ur.permissions)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_manage_role(manager_uuid UUID, target_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) > 0
        FROM user_roles ur
        JOIN role_hierarchy rh ON ur.role = rh.role
        WHERE ur.user_id = manager_uuid 
        AND ur.is_active = true
        AND target_role = ANY(rh.can_manage_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO user_roles (user_id, role, assigned_by, permissions) VALUES
-- Replace these UUIDs with actual user IDs from your auth.users table
('00000000-0000-0000-0000-000000000001', 'president', NULL, ARRAY[
    'view_events', 'join_events', 'view_resources', 'participate_leetcode',
    'view_projects', 'submit_feedback', 'create_events', 'edit_events',
    'manage_resources', 'moderate_discussions', 'view_analytics',
    'manage_officers', 'approve_events', 'manage_budget', 'view_member_list',
    'send_notifications', 'manage_all_roles', 'delete_events',
    'manage_club_settings', 'access_admin_panel'
]),
('00000000-0000-0000-0000-000000000002', 'vice_president', '00000000-0000-0000-0000-000000000001', ARRAY[
    'view_events', 'join_events', 'view_resources', 'participate_leetcode',
    'view_projects', 'submit_feedback', 'create_events', 'edit_events',
    'manage_resources', 'moderate_discussions', 'view_analytics',
    'manage_officers', 'approve_events', 'manage_budget', 'view_member_list',
    'send_notifications'
]),
('00000000-0000-0000-0000-000000000003', 'officer', '00000000-0000-0000-0000-000000000001', ARRAY[
    'view_events', 'join_events', 'view_resources', 'participate_leetcode',
    'view_projects', 'submit_feedback', 'create_events', 'edit_events',
    'manage_resources', 'moderate_discussions', 'view_analytics'
]),
('00000000-0000-0000-0000-000000000004', 'member', '00000000-0000-0000-0000-000000000001', ARRAY[
    'view_events', 'join_events', 'view_resources', 'participate_leetcode',
    'view_projects', 'submit_feedback'
])
ON CONFLICT (user_id, role) DO NOTHING; 