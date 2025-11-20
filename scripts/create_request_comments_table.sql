-- Run this script directly in Supabase SQL Editor
-- Creates request_comments table for task-level discussions

-- Request-level commenting table (separate from asset comments)
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES request_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_parent ON request_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_created ON request_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_comments_user ON request_comments(user_id);

-- Enable RLS
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view request comments"
ON request_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_comments.request_id
  )
);

CREATE POLICY "Users can create request comments"
ON request_comments FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_comments.request_id
  )
);

CREATE POLICY "Users can update own request comments"
ON request_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own request comments"
ON request_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_request_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_comments_updated_at
  BEFORE UPDATE ON request_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_request_comments_updated_at();

-- Enable realtime (if not already enabled)
-- You may need to enable this in Supabase Dashboard > Database > Replication
