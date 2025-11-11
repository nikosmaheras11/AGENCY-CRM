-- Teams (create first, referenced by users)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Teams
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) CHECK (role IN ('admin', 'designer', 'account_manager', 'client', 'guest')),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Asset Versions
CREATE TABLE IF NOT EXISTS asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
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

-- Version comparison cache
CREATE TABLE IF NOT EXISTS version_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_a_id UUID REFERENCES asset_versions(id),
  version_b_id UUID REFERENCES asset_versions(id),
  comparison_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(version_a_id, version_b_id)
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

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  version_id UUID REFERENCES asset_versions(id),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  
  -- Content
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Positioning
  timecode DECIMAL(10, 3),
  x_position DECIMAL(5, 2),
  y_position DECIMAL(5, 2),
  
  -- Status
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
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

-- Comment mentions
CREATE TABLE IF NOT EXISTS comment_mentions (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT false,
  PRIMARY KEY (comment_id, user_id)
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  request_id UUID REFERENCES requests(id),
  action_type VARCHAR(100) NOT NULL,
  action_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards (Collections)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100),
  cover_image_url TEXT,
  view_settings JSONB DEFAULT '{}',
  parent_board_id UUID REFERENCES boards(id),
  position INT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES boards(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS version_count INT DEFAULT 1;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS current_version INT DEFAULT 1;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS favorited_by UUID[] DEFAULT '{}';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_versions_request ON asset_versions(request_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_versions_approved ON asset_versions(request_id, approved, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_versions_created ON asset_versions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_request ON comments(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(parent_comment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_timecode ON comments(request_id, timecode);
CREATE INDEX IF NOT EXISTS idx_comments_position ON comments(request_id, x_position, y_position);
CREATE INDEX IF NOT EXISTS idx_comments_unresolved ON comments(request_id, resolved) WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_activity_request ON activity_log(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for now - refine later)
CREATE POLICY "Allow all access to versions" ON asset_versions FOR ALL USING (true);
CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all access to activity" ON activity_log FOR ALL USING (true);
