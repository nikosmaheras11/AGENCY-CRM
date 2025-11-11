-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE request_status AS ENUM (
  'new_request',
  'in_progress',
  'needs_review',
  'needs_edit',
  'completed'
);

CREATE TYPE request_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

---------------------------
-- CORE DATA TABLES
---------------------------

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leverage Supabase Auth for users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  slack_id VARCHAR(255),
  slack_access_token TEXT,
  slack_notification_preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main requests table
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  request_type VARCHAR(50) NOT NULL, -- 'creative', 'performance', 'project'
  status request_status DEFAULT 'new_request',
  priority request_priority DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Tag system
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  board_type VARCHAR(50), -- 'creative', 'performance', 'project'
  category VARCHAR(50), -- 'client', 'department', 'campaign', etc.
  description VARCHAR(255)
);

CREATE TABLE request_tags (
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, tag_id)
);

-- Assets table with enhanced versioning support
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- 'image', 'video', 'figma', 'document'
  original_filename VARCHAR(255),
  storage_path VARCHAR(255),
  preview_url VARCHAR(255),
  thumbnail_url VARCHAR(255),
  embed_url VARCHAR(255), -- For Figma or other embeds
  metadata JSONB, -- For file-specific metadata (dimensions, duration, etc.)
  version_number INTEGER DEFAULT 1,
  is_current_version BOOLEAN DEFAULT TRUE,
  parent_asset_id UUID REFERENCES assets(id), -- For versioning
  version_notes TEXT,
  version_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Comments system
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id), -- For threaded comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  position_x FLOAT, -- For positioned comments on assets
  position_y FLOAT, -- For positioned comments on assets
  is_resolved BOOLEAN DEFAULT FALSE
);

-- Enhanced performance metrics with source tracking
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  platform VARCHAR(50), -- 'facebook', 'instagram', 'google', etc.
  metric_type VARCHAR(50), -- 'impressions', 'clicks', 'conversions', etc.
  value NUMERIC,
  date DATE,
  source VARCHAR(50), -- 'api_sync', 'manual_entry'
  source_detail JSONB, -- API-specific details or user who entered manual data
  sync_id UUID, -- Group metrics from same sync batch
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform connections for API sync
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  credentials JSONB,
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  sync_frequency INTEGER DEFAULT 1440, -- minutes between syncs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Metric sync logs
CREATE TABLE metric_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_connection_id UUID REFERENCES platform_connections(id),
  status VARCHAR(50), -- 'success', 'partial', 'failed'
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  metrics_updated INTEGER,
  metrics_created INTEGER,
  error_message TEXT,
  details JSONB
);

-- Project tasks
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  sort_order INTEGER,
  parent_task_id UUID REFERENCES project_tasks(id), -- For subtasks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  entity_type VARCHAR(50) NOT NULL, -- 'request', 'asset', 'comment', etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change', etc.
  details JSONB, -- Changes made
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for old activities
CREATE TABLE archived_activity_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------
-- AUTOMATION & INTEGRATION TABLES
---------------------------

-- Status history for audit trail
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  old_status request_status,
  new_status request_status,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  comments TEXT
);

-- Enhanced Slack integration tables
CREATE TABLE slack_connected_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type VARCHAR(50), -- 'creative', 'performance', 'project', or NULL for all
  channel_id VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255),
  notification_types JSONB, -- Array of event types to notify
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_type, channel_id)
);

-- For tracking Slack messages that become requests
CREATE TABLE slack_message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  slack_channel_id VARCHAR(255) NOT NULL,
  slack_thread_ts VARCHAR(255),
  slack_message_ts VARCHAR(255) NOT NULL,
  slack_user_id VARCHAR(255) NOT NULL,
  message_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For mapping Slack threads to request comments
CREATE TABLE slack_comment_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  slack_channel_id VARCHAR(255) NOT NULL,
  slack_thread_ts VARCHAR(255) NOT NULL,
  slack_parent_ts VARCHAR(255),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slack_channel_id, slack_thread_ts)
);

-- Notification configuration table
CREATE TABLE notification_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'request', 'asset', etc.
  event_type VARCHAR(50) NOT NULL, -- 'status_change', 'comment_added', etc.
  channel_id VARCHAR(255), -- Slack channel ID
  user_id UUID REFERENCES auth.users(id), -- For direct messages
  is_active BOOLEAN DEFAULT TRUE,
  template TEXT, -- Message template with placeholders
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced notification queue table with retry logic
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID REFERENCES notification_config(id),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Automation rule templates
CREATE TABLE automation_rule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  condition_template JSONB,
  action_type VARCHAR(50) NOT NULL,
  action_template JSONB,
  ui_schema JSONB, -- UI configuration for form generation
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation rules (enhanced)
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type VARCHAR(50), -- NULL for all types
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID REFERENCES automation_rule_templates(id),
  is_custom BOOLEAN DEFAULT FALSE,
  trigger_type VARCHAR(50) NOT NULL, -- 'created', 'commented', 'tagged', etc.
  trigger_conditions JSONB, -- Conditions to match
  action_type VARCHAR(50) NOT NULL, -- 'change_status', 'assign_user', etc.
  action_parameters JSONB, -- Parameters for the action
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100, -- Lower numbers run first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Retention policies
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  active_retention_days INTEGER NOT NULL,
  archive_retention_days INTEGER NOT NULL,
  last_archived_at TIMESTAMPTZ,
  last_purged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------
-- FUNCTIONS & TRIGGERS
---------------------------

-- Ensure new requests always start with 'new_request' status
CREATE OR REPLACE FUNCTION set_default_request_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status = 'new_request';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_default_request_status
BEFORE INSERT ON requests
FOR EACH ROW
EXECUTE FUNCTION set_default_request_status();

-- Status transition validation
CREATE OR REPLACE FUNCTION check_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow valid transitions
  IF OLD.status = 'new_request' AND NEW.status NOT IN ('in_progress', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from new_request to %', NEW.status;
  END IF;
  
  IF OLD.status = 'in_progress' AND NEW.status NOT IN ('needs_review', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from in_progress to %', NEW.status;
  END IF;
  
  IF OLD.status = 'needs_review' AND NEW.status NOT IN ('in_progress', 'needs_edit', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from needs_review to %', NEW.status;
  END IF;
  
  IF OLD.status = 'needs_edit' AND NEW.status NOT IN ('in_progress', 'needs_review', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from needs_edit to %', NEW.status;
  END IF;
  
  -- Completed is terminal state, but allow reopening
  IF OLD.status = 'completed' AND NEW.status NOT IN ('in_progress', 'needs_edit') THEN
    RAISE EXCEPTION 'Cannot transition from completed to %', NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_status_transition
BEFORE UPDATE ON requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION check_status_transition();

-- Track status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history
      (request_id, old_status, new_status, changed_by)
    VALUES
      (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_request_status_change
AFTER UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION log_status_change();

-- Queue notifications for Slack
CREATE OR REPLACE FUNCTION queue_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue notification for Slack when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notification_queue (
      config_id,
      entity_id,
      entity_type,
      event_data
    )
    SELECT 
      nc.id,
      NEW.id,
      'request',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'request_id', NEW.id,
        'request_title', NEW.title,
        'changed_by', auth.uid(),
        'client_id', NEW.client_id
      )
    FROM notification_config nc
    WHERE nc.entity_type = 'request' 
      AND nc.event_type = 'status_change'
      AND nc.is_active = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_request_status_notification
AFTER UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION queue_status_notification();

-- Asset versioning trigger
CREATE OR REPLACE FUNCTION handle_asset_versioning()
RETURNS TRIGGER AS $$
DECLARE
  new_version_number INTEGER;
  root_asset_id UUID;
BEGIN
  -- If this is an update to an existing asset's storage path
  IF TG_OP = 'UPDATE' AND OLD.storage_path IS DISTINCT FROM NEW.storage_path THEN
    -- Determine the root asset ID
    root_asset_id := COALESCE(OLD.parent_asset_id, OLD.id);
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO new_version_number
    FROM assets 
    WHERE id = root_asset_id OR parent_asset_id = root_asset_id;
    
    -- Set all versions as not current
    UPDATE assets 
    SET is_current_version = FALSE 
    WHERE id = root_asset_id OR parent_asset_id = root_asset_id;
    
    -- Create new version
    INSERT INTO assets (
      request_id,
      name,
      file_type,
      original_filename,
      storage_path,
      preview_url,
      thumbnail_url,
      embed_url,
      metadata,
      version_number,
      is_current_version,
      parent_asset_id,
      version_notes,
      version_type,
      created_by
    ) VALUES (
      OLD.request_id,
      OLD.name,
      NEW.file_type,
      NEW.original_filename,
      NEW.storage_path,
      NEW.preview_url,
      NEW.thumbnail_url,
      NEW.embed_url,
      NEW.metadata,
      new_version_number,
      TRUE,
      root_asset_id,
      NEW.version_notes,
      COALESCE(NEW.version_type, 'auto'),
      auth.uid()
    );
    
    RETURN NULL; -- Prevent the update, as we've created a new record
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER asset_versioning_trigger
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION handle_asset_versioning();

-- Automation rules processing for comments
CREATE OR REPLACE FUNCTION process_comment_automation()
RETURNS TRIGGER AS $$
DECLARE
  rule_record RECORD;
  user_role VARCHAR(50);
  should_trigger BOOLEAN;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role FROM profiles WHERE id = NEW.user_id;
  
  -- Check automation rules
  FOR rule_record IN 
    SELECT * FROM automation_rules 
    WHERE trigger_type = 'comment_created'
    AND is_active = TRUE
    ORDER BY priority
  LOOP
    should_trigger := FALSE;
    
    -- Check if conditions match
    IF rule_record.trigger_conditions IS NOT NULL THEN
      -- Check role condition
      IF rule_record.trigger_conditions->>'required_role' IS NOT NULL THEN
        IF user_role = rule_record.trigger_conditions->>'required_role' THEN
          should_trigger := TRUE;
        END IF;
      END IF;
      
      -- Check content match
      IF rule_record.trigger_conditions->>'content_contains' IS NOT NULL THEN
        IF NEW.content ILIKE '%' || (rule_record.trigger_conditions->>'content_contains') || '%' THEN
          should_trigger := TRUE;
        END IF;
      END IF;
    ELSE
      should_trigger := TRUE;
    END IF;
    
    -- Execute action if triggered
    IF should_trigger THEN
      IF rule_record.action_type = 'change_status' THEN
        UPDATE requests 
        SET status = (rule_record.action_parameters->>'status')::request_status
        WHERE id = NEW.request_id;
      ELSIF rule_record.action_type = 'assign_user' THEN
        UPDATE requests
        SET assigned_to = (rule_record.action_parameters->>'user_id')::UUID
        WHERE id = NEW.request_id;
      ELSIF rule_record.action_type = 'add_tag' THEN
        INSERT INTO request_tags (request_id, tag_id)
        VALUES (NEW.request_id, (rule_record.action_parameters->>'tag_id')::UUID)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_automation
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION process_comment_automation();

-- Function to set a specific version as current (for rollback)
CREATE OR REPLACE FUNCTION set_asset_version_as_current(asset_id UUID)
RETURNS VOID AS $$
DECLARE
  root_id UUID;
BEGIN
  -- Get the root asset ID
  SELECT COALESCE(parent_asset_id, id) INTO root_id FROM assets WHERE id = asset_id;
  
  -- Set all versions to not current
  UPDATE assets 
  SET is_current_version = FALSE
  WHERE id = root_id OR parent_asset_id = root_id;
  
  -- Set the specified version as current
  UPDATE assets
  SET is_current_version = TRUE
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old activities
CREATE OR REPLACE FUNCTION archive_old_activities(days_to_keep INTEGER)
RETURNS INTEGER AS $$
DECLARE
  archive_before TIMESTAMP;
  archived_count INTEGER;
BEGIN
  archive_before := NOW() - (days_to_keep || ' days')::INTERVAL;
  
  -- Move records to archive
  INSERT INTO archived_activity_log
  SELECT *, NOW() as archived_at FROM activity_log
  WHERE created_at < archive_before;
  
  -- Get count
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Delete from main table
  DELETE FROM activity_log
  WHERE created_at < archive_before;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to lock and get notifications for processing
CREATE OR REPLACE FUNCTION lock_and_get_notifications(batch_size INTEGER)
RETURNS TABLE (
  id UUID,
  config_id UUID,
  entity_id UUID,
  entity_type VARCHAR(50),
  event_data JSONB,
  attempts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nq.id,
    nq.config_id,
    nq.entity_id,
    nq.entity_type,
    nq.event_data,
    nq.attempts
  FROM notification_queue nq
  WHERE nq.is_processed = FALSE
    AND nq.attempts < nq.max_attempts
    AND nq.next_attempt_at <= NOW()
  ORDER BY nq.created_at
  LIMIT batch_size
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

---------------------------
-- INDEXES
---------------------------

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Unique index for Slack user ID
CREATE UNIQUE INDEX profiles_slack_id_idx ON profiles(slack_id) WHERE slack_id IS NOT NULL;

-- Indexes for efficient lookups
CREATE INDEX requests_type_idx ON requests(request_type);
CREATE INDEX requests_status_idx ON requests(status);
CREATE INDEX requests_priority_idx ON requests(priority);
CREATE INDEX requests_client_idx ON requests(client_id);
CREATE INDEX requests_assigned_idx ON requests(assigned_to);
CREATE INDEX assets_request_idx ON assets(request_id);
CREATE INDEX assets_versioning_idx ON assets(parent_asset_id);
CREATE INDEX assets_current_version_idx ON assets(is_current_version) WHERE is_current_version = TRUE;
CREATE INDEX comments_request_idx ON comments(request_id);
CREATE INDEX comments_asset_idx ON comments(asset_id);
CREATE INDEX comments_thread_idx ON comments(parent_comment_id);
CREATE INDEX performance_asset_idx ON performance_metrics(asset_id);
CREATE INDEX performance_request_idx ON performance_metrics(request_id);
CREATE INDEX performance_date_idx ON performance_metrics(date);
CREATE INDEX performance_sync_idx ON performance_metrics(sync_id);
CREATE INDEX tasks_request_idx ON project_tasks(request_id);
CREATE INDEX tasks_parent_idx ON project_tasks(parent_task_id);
CREATE INDEX activity_entity_idx ON activity_log(entity_type, entity_id);
CREATE INDEX activity_created_idx ON activity_log(created_at);
CREATE INDEX slack_message_lookup ON slack_message_requests(slack_channel_id, slack_message_ts);
CREATE INDEX slack_thread_lookup ON slack_comment_threads(slack_channel_id, slack_thread_ts);
CREATE INDEX notification_queue_processing_idx ON notification_queue(is_processed, next_attempt_at) WHERE is_processed = FALSE;
CREATE INDEX automation_rules_trigger_idx ON automation_rules(trigger_type, is_active) WHERE is_active = TRUE;

-- Setup Supabase Realtime
ALTER TABLE requests REPLICA IDENTITY FULL;
ALTER TABLE assets REPLICA IDENTITY FULL;
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE project_tasks REPLICA IDENTITY FULL;

---------------------------
-- RLS POLICIES
---------------------------

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Requests policies
CREATE POLICY "Users can view all requests"
ON requests FOR SELECT
USING (true);

CREATE POLICY "Users can insert requests"
ON requests FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own requests or assigned requests"
ON requests FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own requests"
ON requests FOR DELETE
USING (auth.uid() = created_by);

-- Assets policies
CREATE POLICY "Users can view all assets"
ON assets FOR SELECT
USING (true);

CREATE POLICY "Users can insert assets"
ON assets FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own assets"
ON assets FOR UPDATE
USING (auth.uid() = created_by);

-- Comments policies
CREATE POLICY "Users can view all comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Users can insert comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- Project tasks policies
CREATE POLICY "Users can view all tasks"
ON project_tasks FOR SELECT
USING (true);

CREATE POLICY "Users can insert tasks"
ON project_tasks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update tasks"
ON project_tasks FOR UPDATE
USING (true);

---------------------------
-- SEED DATA
---------------------------

-- Insert default retention policies
INSERT INTO retention_policies
  (entity_type, active_retention_days, archive_retention_days)
VALUES
  ('activity_log', 90, 365),
  ('notification_queue', 30, 90);

-- Insert automation rule templates
INSERT INTO automation_rule_templates (name, description, trigger_type, action_type, icon, condition_template, action_template, ui_schema)
VALUES
  (
    'Auto-assign on comment',
    'Automatically assign a request to the user who comments on it',
    'comment_created',
    'assign_user',
    '💬',
    '{"required_role": null}',
    '{"assign_to": "commenter"}',
    '{"fields": []}'
  ),
  (
    'Status change on tag',
    'Change request status when a specific tag is added',
    'tag_added',
    'change_status',
    '🏷️',
    '{"tag_id": null}',
    '{"status": null}',
    '{"fields": [{"name": "tag_id", "type": "tag_select"}, {"name": "status", "type": "status_select"}]}'
  ),
  (
    'Due date reminder',
    'Send notification when due date is approaching',
    'due_date_approaching',
    'send_notification',
    '⏰',
    '{"days_before": 3}',
    '{"notification_type": "slack"}',
    '{"fields": [{"name": "days_before", "type": "number"}]}'
  ),
  (
    'Inactivity alert',
    'Notify when a request has not been updated for a specified period',
    'inactivity_detected',
    'send_notification',
    '⚠️',
    '{"days_inactive": 7}',
    '{"notification_type": "slack"}',
    '{"fields": [{"name": "days_inactive", "type": "number"}]}'
  );

-- Insert default notification configs
INSERT INTO notification_config (entity_type, event_type, template, is_active)
VALUES
  (
    'request',
    'status_change',
    '🔄 Request *{{request_title}}* status changed from `{{old_status}}` to `{{new_status}}`',
    TRUE
  ),
  (
    'comment',
    'comment_added',
    '💬 New comment on *{{request_title}}*: {{comment_content}}',
    TRUE
  ),
  (
    'asset',
    'asset_uploaded',
    '📎 New asset uploaded to *{{request_title}}*: {{asset_name}}',
    TRUE
  );
