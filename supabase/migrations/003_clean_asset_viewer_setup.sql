-- Clean setup for asset viewer tables
-- Drops existing tables and recreates with correct schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS comment_mentions CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS version_comparisons CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS asset_versions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS boards CASCADE;

-- Create teams table first
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100),
  cover_image_url TEXT,
  view_settings JSONB DEFAULT '{}',
  parent_board_id UUID REFERENCES boards(id),
  position INT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (for internal tracking, separate from auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) CHECK (role IN ('admin', 'designer', 'account_manager', 'client', 'guest')),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Create asset_versions table
CREATE TABLE asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  version_number INT NOT NULL,
  
  -- File references
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT,
  
  -- Metadata
  file_size BIGINT,
  mime_type VARCHAR(100),
  duration INT,
  dimensions VARCHAR(20),
  
  -- Version info
  change_description TEXT,
  change_type VARCHAR(50),
  
  -- User tracking
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Approval tracking
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Relationships
  parent_version_id UUID REFERENCES asset_versions(id),
  replaces_version_id UUID REFERENCES asset_versions(id),
  
  -- Metadata
  metadata JSONB,
  
  UNIQUE(request_id, version_number)
);

-- Auto-increment version numbers
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM asset_versions WHERE request_id = NEW.request_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_version_number
  BEFORE INSERT ON asset_versions
  FOR EACH ROW
  WHEN (NEW.version_number IS NULL)
  EXECUTE FUNCTION set_version_number();

-- Create comments table with all required columns
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  version_id UUID REFERENCES asset_versions(id),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author (references auth.users if available, otherwise nullable)
  author_id UUID,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  
  -- Content
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Positioning (for video/image comments)
  timecode DECIMAL(10, 3),
  x_position DECIMAL(5, 2),
  y_position DECIMAL(5, 2),
  
  -- Status
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  -- Reactions
  reactions JSONB DEFAULT '{}',
  
  -- External sync
  figma_comment_id VARCHAR(255) UNIQUE,
  external_source VARCHAR(50),
  external_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT false,
  thread_depth INT DEFAULT 0
);

-- Create activity_log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  request_id TEXT,
  action_type VARCHAR(100) NOT NULL,
  action_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_versions_request ON asset_versions(request_id, version_number DESC);
CREATE INDEX idx_versions_approved ON asset_versions(request_id, approved, version_number DESC);
CREATE INDEX idx_versions_created ON asset_versions(created_at DESC);

CREATE INDEX idx_comments_request ON comments(request_id, created_at DESC);
CREATE INDEX idx_comments_thread ON comments(parent_comment_id, created_at);
CREATE INDEX idx_comments_timecode ON comments(request_id, timecode);
CREATE INDEX idx_comments_position ON comments(request_id, x_position, y_position);
CREATE INDEX idx_comments_unresolved ON comments(request_id, resolved) WHERE resolved = false;

CREATE INDEX idx_activity_request ON activity_log(request_id, created_at DESC);
CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all policies (for development)
CREATE POLICY "Allow all access to versions" ON asset_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to activity" ON activity_log FOR ALL USING (true) WITH CHECK (true);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'designer', 'account_manager', 'client', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
