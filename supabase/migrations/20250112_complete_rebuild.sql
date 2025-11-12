-- Drop existing tables (preserving data first if needed)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS slack_messages CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'designer', 'account_manager', 'client', 'guest')) DEFAULT 'designer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests (main table)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('creative', 'performance', 'design', 'ugc')),
  status TEXT NOT NULL DEFAULT 'new-request' CHECK (status IN ('new-request', 'in-progress', 'needs-review', 'needs-edit', 'done')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Form fields
  format TEXT, -- platform
  size TEXT, -- ad format/size
  dimensions TEXT,
  duration TEXT,
  
  -- URLs
  video_url TEXT,
  thumbnail_url TEXT,
  figma_url TEXT,
  
  -- Assignment & dates
  assignee TEXT,
  due_date DATE,
  client TEXT,
  campaign TEXT,
  category TEXT,
  
  -- Arrays
  tags TEXT[],
  
  -- References
  client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (file uploads)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  
  -- File info
  name TEXT NOT NULL,
  original_filename TEXT,
  storage_path TEXT,
  file_type TEXT, -- 'image', 'video', 'document'
  file_size BIGINT,
  mime_type TEXT,
  
  -- URLs
  preview_url TEXT,
  thumbnail_url TEXT,
  
  -- Versioning
  version_number INT DEFAULT 1,
  is_current_version BOOLEAN DEFAULT TRUE,
  parent_asset_id UUID REFERENCES assets(id),
  version_notes TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (threaded)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author
  author TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  
  -- Content
  text TEXT NOT NULL,
  
  -- Positioning (for video/image comments)
  timecode DECIMAL(10, 3), -- for video
  x_position DECIMAL(5, 2), -- for image
  y_position DECIMAL(5, 2), -- for image
  
  -- Status
  resolved BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slack messages
CREATE TABLE slack_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  permalink TEXT,
  thread_ts TEXT,
  is_thread_reply BOOLEAN DEFAULT FALSE,
  parent_message_id UUID REFERENCES slack_messages(id),
  reactions JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_project_type ON requests(project_type);
CREATE INDEX idx_requests_assignee ON requests(assignee);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_due_date ON requests(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX idx_assets_request ON assets(request_id);
CREATE INDEX idx_assets_current ON assets(request_id, is_current_version) WHERE is_current_version = TRUE;

CREATE INDEX idx_comments_request ON comments(request_id, created_at DESC);
CREATE INDEX idx_comments_thread ON comments(parent_comment_id, created_at);
CREATE INDEX idx_comments_unresolved ON comments(request_id, resolved) WHERE resolved = FALSE;

CREATE INDEX idx_slack_channel ON slack_messages(channel_id, created_at DESC);
CREATE INDEX idx_slack_thread ON slack_messages(thread_ts);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for now - refine later)
CREATE POLICY "Enable all for requests" ON requests FOR ALL USING (true);
CREATE POLICY "Enable all for assets" ON assets FOR ALL USING (true);
CREATE POLICY "Enable all for comments" ON comments FOR ALL USING (true);
CREATE POLICY "Enable read for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Storage bucket and policies must be created via Supabase Dashboard
-- Dashboard → Storage → Create bucket: 'creative-assets' (public)
