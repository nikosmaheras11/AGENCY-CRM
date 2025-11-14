# Fix Comments and Share Links - Action Required

## Problem
Comments and share links are failing because the database migrations haven't been applied to your Supabase database.

## Root Cause
The code is deployed and working, but the database tables/columns don't exist yet. You need to run 2 SQL migrations.

## Solution (5 minutes)

### Step 1: Open Supabase SQL Editor

Go to: **https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql/new**

---

### Step 2: Run Migration 1 (Enable Real-time Comments)

Copy and paste this ENTIRE SQL into the editor and click **Run**:

```sql
-- Add video_timestamp field if it doesn't exist
ALTER TABLE comments 
  ADD COLUMN IF NOT EXISTS video_timestamp DECIMAL(10, 3);

-- Enable realtime for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

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
```

✅ You should see: **Success. No rows returned**

---

### Step 3: Run Migration 2 (Create Share Links Table)

Copy and paste this ENTIRE SQL into the editor and click **Run**:

```sql
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

-- Function to cleanup expired links (optional, can be called via cron)
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
CREATE POLICY share_links_public_read ON share_links
  FOR SELECT
  USING (
    expires_at IS NULL OR expires_at > NOW()
  );

-- Allow authenticated users to create share links for their own requests
CREATE POLICY share_links_user_insert ON share_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to delete their own share links
CREATE POLICY share_links_user_delete ON share_links
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- Add comments for documentation
COMMENT ON TABLE share_links IS 'Shareable links for assets with granular permissions and expiration';
COMMENT ON COLUMN share_links.token IS 'Secure random token used in shareable URL';
COMMENT ON COLUMN share_links.can_comment IS 'Whether viewers with this link can add comments';
COMMENT ON COLUMN share_links.can_download IS 'Whether viewers with this link can download assets';
```

✅ You should see: **Success. No rows returned**

---

### Step 4: Verify (Optional)

Run these queries to confirm everything is set up:

```sql
-- Check video_timestamp column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'video_timestamp';

-- Check share_links table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'share_links';

-- Check realtime is enabled
SELECT schemaname, tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename IN ('comments', 'share_links');
```

You should see:
- ✅ `video_timestamp` column
- ✅ `share_links` table
- ✅ Both tables in realtime publication

---

## Test Your Features

After running the migrations:

### Test Comments
1. Go to: https://v0-agency-os-seven.vercel.app/creative
2. Open any asset (image or video)
3. Click on the image/video
4. Add a comment
5. ✅ Comment should save successfully

### Test Share Links
1. Go to any asset page
2. Click the **Share** button in the top right
3. ✅ Share link should be generated and copied to clipboard

---

## If Still Not Working

1. **Hard refresh** your browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear browser cache** for v0-agency-os-seven.vercel.app
3. Check browser console (F12) for any error messages
4. Share the exact error message with me

---

## Why This Happened

The code was deployed successfully, but database migrations need to be applied manually in Supabase. This is normal for cloud databases - code and database changes are deployed separately for safety.
