-- Add sort_order to ad_sets
ALTER TABLE ad_sets ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add sort_order to creatives
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create indexes for sorting
CREATE INDEX IF NOT EXISTS idx_ad_sets_sort ON ad_sets(campaign_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_creatives_sort ON creatives(ad_set_id, sort_order);