-- Share Links Table
-- Enables shareable links for assets with granular permissions

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

  -- Analytics (optional)
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_asset ON share_links(asset_id);
CREATE INDEX idx_share_links_expires ON share_links(expires_at) WHERE expires_at IS NOT NULL;

-- Function to clean up expired links
CREATE OR REPLACE FUNCTION cleanup_expired_share_links()
RETURNS void AS $$
BEGIN
  DELETE FROM share_links
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-links', '0 0 * * *', 'SELECT cleanup_expired_share_links()');

-- RLS Policies
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for public share validation)
CREATE POLICY "Share links are publicly readable" ON share_links
  FOR SELECT USING (true);

-- Only authenticated users can create/delete their own links
CREATE POLICY "Users can create share links" ON share_links
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own share links" ON share_links
  FOR DELETE USING (auth.uid() = created_by);

COMMENT ON TABLE share_links IS 'Shareable links for assets with granular permissions and expiration';
COMMENT ON COLUMN share_links.token IS 'Cryptographically secure random token for URL';
COMMENT ON COLUMN share_links.can_comment IS 'Allow recipients to add comments';
COMMENT ON COLUMN share_links.can_download IS 'Allow recipients to download the asset';
COMMENT ON COLUMN share_links.expires_at IS 'Optional expiration time for the link';
