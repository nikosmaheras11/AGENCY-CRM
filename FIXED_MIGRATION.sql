-- =====================================================
-- MIGRATION 1: Add Missing Comment Fields (CORRECTED)
-- =====================================================

-- Add video_timestamp field if it doesn't exist
ALTER TABLE comments 
  ADD COLUMN IF NOT EXISTS video_timestamp DECIMAL(10, 3);

-- Note: Skipping realtime setup as it's already configured
-- ALTER PUBLICATION supabase_realtime ADD TABLE comments; -- ALREADY DONE

-- Set replica identity to FULL for realtime updates
ALTER TABLE comments REPLICA IDENTITY FULL;

-- Create index for video timestamp queries
CREATE INDEX IF NOT EXISTS idx_comments_video_timestamp 
  ON comments(request_id, video_timestamp) 
  WHERE video_timestamp IS NOT NULL;

-- Create index for position-based queries
CREATE INDEX IF NOT EXISTS idx_comments_position 
  ON comments(request_id, x_position, y_position) 
  WHERE x_position IS NOT NULL AND y_position IS NOT NULL;

-- =====================================================
-- MIGRATION 2: Create Share Links Table
-- =====================================================

-- Share Links Table
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to asset/request
  asset_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  -- Secure token for URL
  token TEXT NOT NULL UNIQUE,
  
  -- Permissions
  can_comment BOOLEAN DEFAULT TRUE,
  can_download BOOLEAN DEFAULT TRUE,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_asset ON share_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_share_links_expires ON share_links(expires_at) WHERE expires_at IS NOT NULL;

-- Function to cleanup expired links
CREATE OR REPLACE FUNCTION cleanup_expired_share_links()
RETURNS void AS $$
BEGIN
  DELETE FROM share_links WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow public read for valid share links
CREATE POLICY IF NOT EXISTS share_links_public_read ON share_links
  FOR SELECT
  USING (
    expires_at IS NULL OR expires_at > NOW()
  );

-- Allow authenticated users to create share links
CREATE POLICY IF NOT EXISTS share_links_user_insert ON share_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to delete their own share links
CREATE POLICY IF NOT EXISTS share_links_user_delete ON share_links
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- Add share_links to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'share_links'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE share_links;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE share_links IS 'Shareable links for assets with granular permissions and expiration';
COMMENT ON COLUMN share_links.token IS 'Secure random token used in shareable URL';
COMMENT ON COLUMN share_links.can_comment IS 'Whether viewers with this link can add comments';
COMMENT ON COLUMN share_links.can_download IS 'Whether viewers with this link can download assets';
