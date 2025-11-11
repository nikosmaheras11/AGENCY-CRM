-- Slack Message Monitoring Schema
-- This extends the existing Agency Dashboard OS schema with message tracking

-- Store Slack messages that contain mentions
CREATE TABLE slack_messages (
  id TEXT PRIMARY KEY, -- Slack message timestamp serves as unique ID
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  text TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  permalink TEXT,
  thread_ts TEXT,
  is_thread_reply BOOLEAN DEFAULT FALSE,
  parent_message_id TEXT,
  reactions JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which users are mentioned in which messages
CREATE TABLE user_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT REFERENCES slack_messages(id) ON DELETE CASCADE,
  user_slack_id TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link user_mentions to profiles table
ALTER TABLE user_mentions
ADD CONSTRAINT fk_user_mentions_profile
FOREIGN KEY (user_slack_id) 
REFERENCES profiles(slack_id) 
ON DELETE CASCADE;

-- Create indexes for efficient lookups
CREATE INDEX idx_slack_messages_timestamp ON slack_messages(timestamp DESC);
CREATE INDEX idx_slack_messages_channel ON slack_messages(channel_id);
CREATE INDEX idx_user_mentions_user ON user_mentions(user_slack_id);
CREATE INDEX idx_user_mentions_message ON user_mentions(message_id);
CREATE INDEX idx_user_mentions_read ON user_mentions(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_user_mentions_created ON user_mentions(created_at DESC);

-- Function to automatically update read_at timestamp
CREATE OR REPLACE FUNCTION set_mention_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mention_read_at
BEFORE UPDATE ON user_mentions
FOR EACH ROW
EXECUTE FUNCTION set_mention_read_at();

-- Enable Row Level Security
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slack_messages
-- Users can view messages where they're mentioned
CREATE POLICY "Users can view messages they're mentioned in"
ON slack_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_mentions um
    INNER JOIN profiles p ON p.slack_id = um.user_slack_id
    WHERE um.message_id = slack_messages.id
    AND p.id = auth.uid()
  )
);

-- RLS Policies for user_mentions
-- Users can view their own mentions
CREATE POLICY "Users can view their own mentions"
ON user_mentions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.slack_id = user_mentions.user_slack_id
    AND profiles.id = auth.uid()
  )
);

-- Users can update their own mentions (mark as read)
CREATE POLICY "Users can update their own mentions"
ON user_mentions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.slack_id = user_mentions.user_slack_id
    AND profiles.id = auth.uid()
  )
);

-- Enable Realtime for mentions
ALTER TABLE slack_messages REPLICA IDENTITY FULL;
ALTER TABLE user_mentions REPLICA IDENTITY FULL;

-- Create a view for easy mention queries with message details
CREATE OR REPLACE VIEW user_mention_details AS
SELECT 
  um.id as mention_id,
  um.user_slack_id,
  um.is_read,
  um.read_at,
  um.created_at as mention_created_at,
  sm.id as message_id,
  sm.channel_id,
  sm.channel_name,
  sm.user_id,
  sm.user_name,
  sm.text,
  sm.timestamp as message_timestamp,
  sm.permalink,
  sm.thread_ts,
  sm.is_thread_reply,
  sm.reactions,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.avatar_url
FROM user_mentions um
INNER JOIN slack_messages sm ON um.message_id = sm.id
INNER JOIN profiles p ON um.user_slack_id = p.slack_id;

-- Grant access to the view
GRANT SELECT ON user_mention_details TO authenticated;

-- Function to get unread mention count for a user
CREATE OR REPLACE FUNCTION get_unread_mention_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  mention_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO mention_count
  FROM user_mentions um
  INNER JOIN profiles p ON um.user_slack_id = p.slack_id
  WHERE p.id = user_id
  AND um.is_read = FALSE;
  
  RETURN mention_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all mentions as read for a user
CREATE OR REPLACE FUNCTION mark_all_mentions_read(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE user_mentions
    SET is_read = TRUE, read_at = NOW()
    WHERE user_slack_id IN (
      SELECT slack_id FROM profiles WHERE id = user_id
    )
    AND is_read = FALSE
    RETURNING 1
  )
  SELECT COUNT(*) INTO updated_count FROM updated;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert notification config for new mentions
INSERT INTO notification_config (entity_type, event_type, template, is_active)
VALUES (
  'mention',
  'new_mention',
  '💬 You were mentioned in #{{channel_name}} by {{user_name}}: {{message_text}}',
  FALSE -- Disabled by default since users will see mentions in dashboard
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE slack_messages IS 'Stores Slack messages that contain user mentions';
COMMENT ON TABLE user_mentions IS 'Tracks which users are mentioned in which Slack messages';
COMMENT ON VIEW user_mention_details IS 'Convenient view combining mention and message data';
