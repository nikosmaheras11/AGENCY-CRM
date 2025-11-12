-- Enhance requests table with additional tracking fields
ALTER TABLE requests ADD COLUMN IF NOT EXISTS estimate_hours FLOAT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS actual_hours FLOAT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS review_round INTEGER DEFAULT 1;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS review_status TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS reviewers TEXT[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS required_files TEXT[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS reference_urls TEXT[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS brand_guidelines TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS campaign_objectives TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS slack_thread_ts TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS slack_channel_id TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Enhance comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_role TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;

-- Create asset_versions table (separate from assets for better version tracking)
CREATE TABLE IF NOT EXISTS asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in-review', 'approved', 'rejected')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, version_number)
);

-- Create form_templates table for dynamic form generation
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('creative', 'performance', 'design', 'ugc')),
  fields JSONB NOT NULL,
  required_fields TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mentions table for @mentions tracking
CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  mentioned_by UUID REFERENCES auth.users(id),
  seen BOOLEAN DEFAULT FALSE,
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'request', 'comment', 'asset', etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed', etc.
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_requests_review_status ON requests(review_status) WHERE review_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_slack_thread ON requests(slack_thread_ts) WHERE slack_thread_ts IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_deleted ON requests(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asset_versions_request ON asset_versions(request_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_asset_versions_status ON asset_versions(status);

CREATE INDEX IF NOT EXISTS idx_mentions_user ON mentions(user_id, seen);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON mentions(comment_id);

CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_id, created_at DESC);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_asset_versions_updated_at ON asset_versions CASCADE;
CREATE TRIGGER update_asset_versions_updated_at
  BEFORE UPDATE ON asset_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_form_templates_updated_at ON form_templates CASCADE;
CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS on new tables
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable all for asset_versions" ON asset_versions FOR ALL USING (true);
CREATE POLICY "Enable all for form_templates" ON form_templates FOR ALL USING (true);
CREATE POLICY "Users can view their mentions" ON mentions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable all for activity_log" ON activity_log FOR ALL USING (true);

-- Enable realtime for critical tables (configure in Supabase Dashboard → Database → Publications)
-- Dashboard: Add requests, comments, asset_versions, mentions to supabase_realtime publication

-- Set replica identity for proper realtime updates
ALTER TABLE requests REPLICA IDENTITY FULL;
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE asset_versions REPLICA IDENTITY FULL;

-- Create helper function for activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (entity_type, entity_id, action, actor_id, details)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    COALESCE(NEW.created_by, NEW.author_id, auth.uid()),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add activity logging triggers
DROP TRIGGER IF EXISTS log_requests_activity ON requests CASCADE;
CREATE TRIGGER log_requests_activity
  AFTER INSERT OR UPDATE OR DELETE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_comments_activity ON comments CASCADE;
CREATE TRIGGER log_comments_activity
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

-- Insert default form template for creative requests
INSERT INTO form_templates (name, description, project_type, fields, required_fields)
VALUES (
  'Creative Request Form',
  'Standard creative brief form',
  'creative',
  '{
    "title": {"type": "text", "label": "Creative Name", "placeholder": "Write something"},
    "platform": {"type": "text", "label": "Platform", "placeholder": "Write something"},
    "adFormat": {"type": "text", "label": "Ad Size / Format", "placeholder": "1080x1920, Carousel, etc."},
    "priority": {"type": "select", "label": "Priority", "options": ["low", "medium", "high", "urgent"]},
    "dueDate": {"type": "date", "label": "Due Date"},
    "description": {"type": "textarea", "label": "Creative Description", "rows": 4},
    "inspiration": {"type": "textarea", "label": "Inspiration", "rows": 4, "optional": true},
    "figmaLinks": {"type": "textarea", "label": "Figma / Asset Link(s)", "rows": 4, "optional": true},
    "assetFile": {"type": "file", "label": "Asset File", "optional": true, "accept": "image/*,video/*,.pdf,.doc,.docx"}
  }'::jsonb,
  ARRAY['title', 'priority', 'dueDate', 'description']
)
ON CONFLICT DO NOTHING;
