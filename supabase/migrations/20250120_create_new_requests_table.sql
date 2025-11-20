-- Create new_requests table for brief stage (before asset creation)
CREATE TABLE IF NOT EXISTS new_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Form fields from intake
  title VARCHAR(255) NOT NULL, -- Creative Name from form
  platform TEXT[], -- Multiple platforms: ["Meta", "TikTok", etc.]
  ad_size_format TEXT[], -- Multiple formats: ["1080x1920", "Carousel", etc.]
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  due_date DATE,
  description TEXT NOT NULL, -- Creative Description from form
  inspiration TEXT, -- Optional inspiration field
  figma_url TEXT, -- Primary Figma link
  reference_urls TEXT[], -- Additional Figma/asset links
  
  -- Brief-only fields (not in full asset workflow yet)
  status VARCHAR(50) DEFAULT 'new-request' CHECK (status IN ('new-request', 'in-progress')),
  
  -- Metadata
  project_type VARCHAR(50) DEFAULT 'creative',
  client VARCHAR(255),
  client_id UUID,
  campaign VARCHAR(255),
  category VARCHAR(255),
  tags TEXT[],
  
  -- Assignment
  created_by UUID REFERENCES auth.users(id),
  created_by_name VARCHAR(255),
  assigned_to UUID,
  assignee VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Slack integration
  slack_thread_ts VARCHAR(50),
  slack_channel_id VARCHAR(50)
);

-- Enable RLS
ALTER TABLE new_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON new_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON new_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON new_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_new_requests_status ON new_requests(status);
CREATE INDEX idx_new_requests_created_at ON new_requests(created_at DESC);
CREATE INDEX idx_new_requests_project_type ON new_requests(project_type);
CREATE INDEX idx_new_requests_client_id ON new_requests(client_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_new_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_new_requests_updated_at
  BEFORE UPDATE ON new_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_new_requests_updated_at();

-- Migration function: Move brief to requests table when status changes to review/done
CREATE OR REPLACE FUNCTION migrate_brief_to_requests()
RETURNS TRIGGER AS $$
DECLARE
  new_request_id UUID;
BEGIN
  -- Only trigger when status changes to needs-review, needs-edit, or done
  IF NEW.status IN ('needs-review', 'needs-edit', 'done') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('needs-review', 'needs-edit', 'done')) THEN
    
    -- Insert into requests table with all mapped fields
    INSERT INTO requests (
      id, -- Preserve the same ID for continuity
      title,
      description,
      project_type,
      status,
      priority,
      format, -- Map platform array to single format field
      size,
      dimensions,
      duration,
      figma_url,
      video_url,
      thumbnail_url,
      assignee,
      assigned_to,
      due_date,
      client,
      client_id,
      campaign,
      category,
      tags,
      created_by,
      created_by_name,
      created_at,
      updated_at,
      reference_urls,
      inspiration,
      slack_thread_ts,
      slack_channel_id
    )
    VALUES (
      OLD.id, -- Keep same ID
      OLD.title,
      OLD.description,
      OLD.project_type,
      NEW.status, -- Use new status (needs-review, needs-edit, or done)
      OLD.priority,
      CASE 
        WHEN OLD.platform IS NOT NULL AND array_length(OLD.platform, 1) > 0 
        THEN OLD.platform[1] -- Take first platform as primary format
        ELSE NULL 
      END,
      CASE 
        WHEN OLD.ad_size_format IS NOT NULL AND array_length(OLD.ad_size_format, 1) > 0 
        THEN OLD.ad_size_format[1] -- Take first size as primary
        ELSE NULL 
      END,
      NULL, -- dimensions - can be parsed from ad_size_format if needed
      NULL, -- duration - not in brief
      OLD.figma_url,
      NULL, -- video_url - not in brief stage
      NULL, -- thumbnail_url - will be added when assets uploaded
      OLD.assignee,
      OLD.assigned_to,
      OLD.due_date,
      OLD.client,
      OLD.client_id,
      OLD.campaign,
      OLD.category,
      OLD.tags,
      OLD.created_by,
      OLD.created_by_name,
      OLD.created_at,
      NOW(), -- updated_at
      OLD.reference_urls,
      OLD.inspiration,
      OLD.slack_thread_ts,
      OLD.slack_channel_id
    )
    ON CONFLICT (id) DO UPDATE SET
      -- If record already exists (shouldn't happen), update it
      status = EXCLUDED.status,
      updated_at = NOW();
    
    -- Delete from new_requests table (migration complete)
    DELETE FROM new_requests WHERE id = OLD.id;
    
    -- Log the migration
    INSERT INTO activity_log (
      entity_type,
      entity_id,
      action,
      description,
      user_id,
      created_at
    )
    VALUES (
      'request',
      OLD.id,
      'migrated',
      'Brief graduated to asset workflow with status: ' || NEW.status,
      OLD.created_by,
      NOW()
    );
    
    -- Return NULL because we deleted the row
    RETURN NULL;
  END IF;
  
  -- For other updates, return NEW normally
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-migrate when status changes
CREATE TRIGGER trigger_migrate_brief_to_requests
  BEFORE UPDATE OF status ON new_requests
  FOR EACH ROW
  EXECUTE FUNCTION migrate_brief_to_requests();

-- Create activity_log table if it doesn't exist (for tracking migrations)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(50),
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON TABLE new_requests IS 'Brief stage for creative requests. Records automatically migrate to requests table when status changes to needs-review, needs-edit, or done.';
COMMENT ON FUNCTION migrate_brief_to_requests() IS 'Automatically migrates briefs from new_requests to requests table when they enter the asset review workflow.';
