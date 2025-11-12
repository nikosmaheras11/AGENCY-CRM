-- =========================================
-- VIDEO VERSIONING & TIMECODE COMMENTS SCHEMA
-- =========================================

-- 1. VIDEO ASSETS TABLE (Master records)
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID, -- Link to your requests/projects table
  
  -- Current version tracking
  current_version_id UUID, -- FK to video_versions (set after versions created)
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID, -- Link to auth.users or team member
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- 2. VIDEO VERSIONS TABLE (Each upload/revision)
CREATE TABLE IF NOT EXISTS video_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_asset_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  
  -- Version tracking
  version_number INTEGER NOT NULL,
  version_label TEXT, -- e.g., "v1", "Final", "Director's Cut"
  
  -- File details
  file_url TEXT NOT NULL, -- Supabase Storage URL or CDN
  file_size_bytes BIGINT,
  mime_type TEXT,
  
  -- Video properties
  duration_seconds DECIMAL(10, 3), -- Supports millisecond precision
  width INTEGER,
  height INTEGER,
  frame_rate DECIMAL(5, 2), -- e.g., 29.97, 30, 60
  codec TEXT,
  bitrate INTEGER,
  
  -- Thumbnail generation
  poster_url TEXT, -- Main thumbnail
  thumbnails_sprite_url TEXT, -- Sprite sheet for scrubbing preview
  thumbnails_vtt_url TEXT, -- WebVTT file for thumbnail timeline
  
  -- Status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID, -- Link to auth.users
  
  -- Version notes
  change_notes TEXT,
  
  -- Constraints
  UNIQUE(video_asset_id, version_number)
);

-- 3. TIMECODE COMMENTS TABLE
CREATE TABLE IF NOT EXISTS timecode_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to specific version
  video_version_id UUID NOT NULL REFERENCES video_versions(id) ON DELETE CASCADE,
  
  -- Timecode position (in seconds with millisecond precision)
  timecode_seconds DECIMAL(10, 3) NOT NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  
  -- Author
  author_id UUID NOT NULL, -- Link to auth.users or team members
  author_name TEXT, -- Denormalized for display
  author_avatar_url TEXT,
  
  -- Threading support
  parent_comment_id UUID REFERENCES timecode_comments(id) ON DELETE CASCADE,
  thread_root_id UUID REFERENCES timecode_comments(id) ON DELETE CASCADE, -- For efficient thread queries
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived', 'deleted')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  -- Reactions/likes
  reactions JSONB DEFAULT '[]'::jsonb, -- e.g., [{"emoji": "👍", "user_id": "...", "created_at": "..."}]
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  
  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal vs client-facing comments
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb -- e.g., [{"url": "...", "type": "image", "name": "..."}]
);

-- 4. COMMENT MENTIONS TABLE (for @mentions)
CREATE TABLE IF NOT EXISTS comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES timecode_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, mentioned_user_id)
);

-- 5. COMMENT NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS comment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES timecode_comments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('mention', 'reply', 'resolved', 'new_on_thread')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VIDEO PLAYBACK SESSIONS (Optional: track who watched what)
CREATE TABLE IF NOT EXISTS video_playback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_version_id UUID NOT NULL REFERENCES video_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Playback tracking
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_position_seconds DECIMAL(10, 3),
  completed BOOLEAN DEFAULT false,
  
  -- Session metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- INDEXES for Performance
-- =========================================

-- Video assets
CREATE INDEX idx_video_assets_project ON video_assets(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_video_assets_created_by ON video_assets(created_by);

-- Video versions
CREATE INDEX idx_video_versions_asset ON video_versions(video_asset_id);
CREATE INDEX idx_video_versions_status ON video_versions(processing_status);
CREATE INDEX idx_video_versions_created ON video_versions(created_at DESC);

-- Timecode comments
CREATE INDEX idx_timecode_comments_version ON timecode_comments(video_version_id);
CREATE INDEX idx_timecode_comments_timecode ON timecode_comments(video_version_id, timecode_seconds);
CREATE INDEX idx_timecode_comments_author ON timecode_comments(author_id);
CREATE INDEX idx_timecode_comments_status ON timecode_comments(status);
CREATE INDEX idx_timecode_comments_thread ON timecode_comments(thread_root_id) WHERE thread_root_id IS NOT NULL;
CREATE INDEX idx_timecode_comments_parent ON timecode_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_timecode_comments_created ON timecode_comments(created_at DESC);

-- Comment mentions
CREATE INDEX idx_comment_mentions_user ON comment_mentions(mentioned_user_id);

-- Comment notifications
CREATE INDEX idx_comment_notifications_user ON comment_notifications(user_id) WHERE read_at IS NULL;

-- Playback sessions
CREATE INDEX idx_playback_sessions_user ON video_playback_sessions(user_id, video_version_id);

-- =========================================
-- TRIGGERS for auto-updating timestamps
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_assets_updated_at 
  BEFORE UPDATE ON video_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timecode_comments_updated_at 
  BEFORE UPDATE ON timecode_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playback_sessions_updated_at 
  BEFORE UPDATE ON video_playback_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- HELPER FUNCTIONS
-- =========================================

-- Function to get all comments for a video version with thread structure
CREATE OR REPLACE FUNCTION get_video_comments(p_video_version_id UUID)
RETURNS TABLE (
  id UUID,
  timecode_seconds DECIMAL,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  author_avatar_url TEXT,
  parent_comment_id UUID,
  thread_root_id UUID,
  status TEXT,
  reactions JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  reply_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id,
    tc.timecode_seconds,
    tc.content,
    tc.author_id,
    tc.author_name,
    tc.author_avatar_url,
    tc.parent_comment_id,
    tc.thread_root_id,
    tc.status,
    tc.reactions,
    tc.created_at,
    tc.updated_at,
    (SELECT COUNT(*) FROM timecode_comments WHERE parent_comment_id = tc.id) as reply_count
  FROM timecode_comments tc
  WHERE tc.video_version_id = p_video_version_id
    AND tc.status != 'deleted'
  ORDER BY tc.timecode_seconds ASC, tc.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment thread
CREATE OR REPLACE FUNCTION get_comment_thread(p_thread_root_id UUID)
RETURNS TABLE (
  id UUID,
  timecode_seconds DECIMAL,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  parent_comment_id UUID,
  depth INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Root comment
    SELECT 
      tc.id,
      tc.timecode_seconds,
      tc.content,
      tc.author_id,
      tc.author_name,
      tc.parent_comment_id,
      0 as depth,
      tc.created_at
    FROM timecode_comments tc
    WHERE tc.id = p_thread_root_id
    
    UNION ALL
    
    -- Recursive: get replies
    SELECT 
      tc.id,
      tc.timecode_seconds,
      tc.content,
      tc.author_id,
      tc.author_name,
      tc.parent_comment_id,
      ct.depth + 1,
      tc.created_at
    FROM timecode_comments tc
    INNER JOIN comment_tree ct ON tc.parent_comment_id = ct.id
    WHERE tc.status != 'deleted'
  )
  SELECT * FROM comment_tree
  ORDER BY depth ASC, created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- ROW LEVEL SECURITY (RLS) Examples
-- =========================================

-- Enable RLS on tables (uncomment when you have auth set up)
-- ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE video_versions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE timecode_comments ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup):
-- 
-- -- Anyone can read non-deleted video assets
-- CREATE POLICY "video_assets_select_policy" ON video_assets
--   FOR SELECT USING (deleted_at IS NULL);
-- 
-- -- Only authenticated users can create comments
-- CREATE POLICY "comments_insert_policy" ON timecode_comments
--   FOR INSERT WITH CHECK (auth.uid() = author_id);
-- 
-- -- Users can update their own comments
-- CREATE POLICY "comments_update_policy" ON timecode_comments
--   FOR UPDATE USING (auth.uid() = author_id);
