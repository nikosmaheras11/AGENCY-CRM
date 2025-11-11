-- Verify and fix comments table setup
-- Run this in Supabase SQL Editor if comments aren't working

-- 1. Check if comments table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    RAISE NOTICE 'Comments table does not exist. Creating...';
    
    -- Create comments table
    CREATE TABLE comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
      version_id UUID REFERENCES asset_versions(id),
      parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
      
      -- Author
      author_id UUID,
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
    
    -- Create indexes
    CREATE INDEX idx_comments_request ON comments(request_id, created_at DESC);
    CREATE INDEX idx_comments_thread ON comments(parent_comment_id, created_at);
    CREATE INDEX idx_comments_timecode ON comments(request_id, timecode);
    
    -- Enable RLS
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    -- Allow all policy (for development)
    CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true);
    
    RAISE NOTICE 'Comments table created successfully!';
  ELSE
    RAISE NOTICE 'Comments table already exists.';
  END IF;
END $$;

-- 2. Verify RLS is enabled but allows access
DO $$
BEGIN
  -- Check if RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'comments' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE 'RLS is enabled on comments table.';
    
    -- Check if allow-all policy exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'comments'
      AND policyname = 'Allow all access to comments'
    ) THEN
      RAISE NOTICE 'Creating allow-all policy...';
      CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true);
      RAISE NOTICE 'Policy created!';
    ELSE
      RAISE NOTICE 'Allow-all policy exists.';
    END IF;
  ELSE
    RAISE NOTICE 'RLS is not enabled. Enabling...';
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true);
    RAISE NOTICE 'RLS enabled with allow-all policy.';
  END IF;
END $$;

-- 3. Test insert
DO $$
DECLARE
  test_request_id UUID;
  test_comment_id UUID;
BEGIN
  -- Get a request ID to test with
  SELECT id INTO test_request_id FROM requests LIMIT 1;
  
  IF test_request_id IS NULL THEN
    RAISE NOTICE 'No requests found in database to test with.';
  ELSE
    -- Try to insert a test comment
    INSERT INTO comments (request_id, content, author_name, resolved, edited, thread_depth)
    VALUES (test_request_id, 'Test comment - safe to delete', 'Test User', false, false, 0)
    RETURNING id INTO test_comment_id;
    
    RAISE NOTICE 'Test comment inserted successfully with ID: %', test_comment_id;
    
    -- Clean up test comment
    DELETE FROM comments WHERE id = test_comment_id;
    RAISE NOTICE 'Test comment deleted.';
  END IF;
END $$;

-- 4. Show current comments count
SELECT 
  'Total comments: ' || COUNT(*) as status
FROM comments;

-- 5. Show recent comments (if any)
SELECT 
  id,
  request_id,
  author_name,
  content,
  timecode,
  resolved,
  created_at
FROM comments
ORDER BY created_at DESC
LIMIT 5;
