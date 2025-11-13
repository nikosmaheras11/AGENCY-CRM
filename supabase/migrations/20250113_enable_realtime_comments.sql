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
