-- Simplify back to one table approach
-- Drop new_requests table and related objects

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_migrate_brief_to_requests ON new_requests;
DROP TRIGGER IF EXISTS trigger_update_new_requests_updated_at ON new_requests;

-- Drop functions
DROP FUNCTION IF EXISTS migrate_brief_to_requests();
DROP FUNCTION IF EXISTS update_new_requests_updated_at();

-- Drop table
DROP TABLE IF EXISTS new_requests CASCADE;

-- Add array fields to requests table for multi-select support
ALTER TABLE requests 
  ADD COLUMN IF NOT EXISTS platform_array TEXT[],
  ADD COLUMN IF NOT EXISTS ad_size_format TEXT[];

-- Create index for array fields
CREATE INDEX IF NOT EXISTS idx_requests_platform_array ON requests USING GIN (platform_array);
CREATE INDEX IF NOT EXISTS idx_requests_ad_size_format ON requests USING GIN (ad_size_format);

COMMENT ON COLUMN requests.platform_array IS 'Multiple platforms: ["Meta", "TikTok", "Google", etc.]';
COMMENT ON COLUMN requests.ad_size_format IS 'Multiple ad sizes/formats: ["1080x1920", "Carousel", "Story", etc.]';

-- Note: Keep activity_log table as it's useful for tracking all changes
COMMENT ON TABLE requests IS 'Single table for all creative requests. Modal type determined by status: new-request/in-progress show BriefViewModal, needs-review/needs-edit/done show CampaignDetailPanel.';
