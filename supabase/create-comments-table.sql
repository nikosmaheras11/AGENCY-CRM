-- Create comments table with correct schema
-- Run this in Supabase SQL Editor

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS comments CASCADE;

-- Create comments table with all required columns
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,  -- Using TEXT to match requests.id type
  version_id UUID,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author (all optional for now)
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
  
  -- External sync (for Figma integration)
  figma_comment_id VARCHAR(255) UNIQUE,
  external_source VARCHAR(50),
  external_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT false,
  thread_depth INT DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_comments_request ON comments(request_id, created_at DESC);
CREATE INDEX idx_comments_thread ON comments(parent_comment_id, created_at);
CREATE INDEX idx_comments_timecode ON comments(request_id, timecode);
CREATE INDEX idx_comments_position ON comments(request_id, x_position, y_position);
CREATE INDEX idx_comments_unresolved ON comments(request_id, resolved) WHERE resolved = false;

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
-- TODO: Refine this for production with proper user authentication
CREATE POLICY "Allow all access to comments" 
  ON comments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'comments'
  AND table_schema = 'public'
ORDER BY ordinal_position;
