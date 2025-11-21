-- ============================================
-- POLYMORPHIC COMMENTS MIGRATION
-- ============================================
-- Extends comments table to support campaigns, ad_sets, and creatives
-- while maintaining backwards compatibility with requests and assets

-- Add polymorphic columns
ALTER TABLE comments ADD COLUMN entity_type VARCHAR(50);
ALTER TABLE comments ADD COLUMN entity_id UUID;

-- Add foreign key columns for performance entities (optional, for referential integrity)
ALTER TABLE comments ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE;

-- Add check constraint: at least one entity reference must be present
ALTER TABLE comments ADD CONSTRAINT comments_entity_check CHECK (
  num_nonnulls(request_id, asset_id, campaign_id, ad_set_id, creative_id) >= 1
);

-- Create indexes for performance
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id) WHERE entity_type IS NOT NULL;
CREATE INDEX idx_comments_campaign ON comments(campaign_id, created_at DESC) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_comments_ad_set ON comments(ad_set_id, created_at DESC) WHERE ad_set_id IS NOT NULL;
CREATE INDEX idx_comments_creative ON comments(creative_id, created_at DESC) WHERE creative_id IS NOT NULL;

-- Backfill entity_type and entity_id for existing comments
UPDATE comments SET 
  entity_type = 'request',
  entity_id = request_id
WHERE request_id IS NOT NULL AND entity_type IS NULL;

UPDATE comments SET 
  entity_type = 'asset',
  entity_id = asset_id
WHERE asset_id IS NOT NULL AND request_id IS NULL AND entity_type IS NULL;

-- Function to auto-populate entity fields when inserting comments
CREATE OR REPLACE FUNCTION populate_comment_entity_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If polymorphic fields are set, populate specific FK columns
  IF NEW.entity_type = 'campaign' AND NEW.entity_id IS NOT NULL THEN
    NEW.campaign_id = NEW.entity_id;
  ELSIF NEW.entity_type = 'ad_set' AND NEW.entity_id IS NOT NULL THEN
    NEW.ad_set_id = NEW.entity_id;
  ELSIF NEW.entity_type = 'creative' AND NEW.entity_id IS NOT NULL THEN
    NEW.creative_id = NEW.entity_id;
  ELSIF NEW.entity_type = 'request' AND NEW.entity_id IS NOT NULL THEN
    NEW.request_id = NEW.entity_id;
  ELSIF NEW.entity_type = 'asset' AND NEW.entity_id IS NOT NULL THEN
    NEW.asset_id = NEW.entity_id;
  END IF;

  -- If specific FK columns are set but polymorphic fields are not, populate them
  IF NEW.campaign_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'campaign';
    NEW.entity_id = NEW.campaign_id;
  ELSIF NEW.ad_set_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'ad_set';
    NEW.entity_id = NEW.ad_set_id;
  ELSIF NEW.creative_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'creative';
    NEW.entity_id = NEW.creative_id;
  ELSIF NEW.request_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'request';
    NEW.entity_id = NEW.request_id;
  ELSIF NEW.asset_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'asset';
    NEW.entity_id = NEW.asset_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER populate_comment_entity_fields_trigger
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION populate_comment_entity_fields();

-- Helper view for fetching comments with entity info
CREATE OR REPLACE VIEW comments_with_entity AS
SELECT 
  c.*,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  CASE
    WHEN c.entity_type = 'campaign' THEN (SELECT name FROM campaigns WHERE id = c.campaign_id)
    WHEN c.entity_type = 'ad_set' THEN (SELECT name FROM ad_sets WHERE id = c.ad_set_id)
    WHEN c.entity_type = 'creative' THEN (SELECT name FROM creatives WHERE id = c.creative_id)
    WHEN c.entity_type = 'request' THEN (SELECT title FROM requests WHERE id = c.request_id)
    WHEN c.entity_type = 'asset' THEN (SELECT name FROM assets WHERE id = c.asset_id)
  END as entity_name
FROM comments c
LEFT JOIN profiles p ON c.author_id = p.id;

-- RLS Policy for performance comments (inherit from parent table policy)
-- Existing policy "Enable all for comments" already covers this
