-- Create slack_messages table
CREATE TABLE IF NOT EXISTS public.slack_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  permalink TEXT,
  thread_ts TEXT,
  is_thread_reply BOOLEAN DEFAULT FALSE,
  parent_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional metadata fields
  reactions JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_slack_messages_timestamp ON public.slack_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_slack_messages_channel ON public.slack_messages(channel_name);
CREATE INDEX IF NOT EXISTS idx_slack_messages_thread ON public.slack_messages(thread_ts);
CREATE INDEX IF NOT EXISTS idx_slack_messages_created_at ON public.slack_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.slack_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access for all authenticated users)
CREATE POLICY "Enable read access for all users" 
  ON public.slack_messages
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for service role" 
  ON public.slack_messages
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON public.slack_messages
  FOR UPDATE 
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.slack_messages IS 'Stores Slack messages from monitored channels for the Agency Dashboard';
