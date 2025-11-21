-- Add campaign_id and client_id columns to assets table
-- These allow assets to be linked to campaigns and clients directly

ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_campaign ON assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client_id);

-- Add comment for documentation
COMMENT ON COLUMN assets.campaign_id IS 'Optional link to a campaign for performance marketing assets';
COMMENT ON COLUMN assets.client_id IS 'Optional link to a client for organization';
