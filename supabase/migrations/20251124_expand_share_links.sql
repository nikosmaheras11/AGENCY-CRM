-- Expand share_links table for polymorphic associations
-- Supports sharing Ad Sets, Campaigns, and potentially other entities

-- 1. Drop existing constraints/indexes if they exist to avoid conflicts during modification
ALTER TABLE share_links DROP CONSTRAINT IF EXISTS share_links_asset_id_fkey;
DROP INDEX IF EXISTS idx_share_links_asset;

-- 2. Add new columns for polymorphic association
ALTER TABLE share_links 
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('request', 'campaign', 'ad_set', 'creative')) DEFAULT 'request',
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 3. Migrate existing data (if any)
UPDATE share_links 
SET entity_type = 'request', entity_id = asset_id 
WHERE entity_id IS NULL AND asset_id IS NOT NULL;

-- 4. Make asset_id nullable (since we now use entity_id) or drop it eventually
ALTER TABLE share_links ALTER COLUMN asset_id DROP NOT NULL;

-- 5. Add new indexes
CREATE INDEX IF NOT EXISTS idx_share_links_entity ON share_links(entity_type, entity_id);

-- 6. Update RLS policies
DROP POLICY IF EXISTS "Share links are publicly readable" ON share_links;
CREATE POLICY "Share links are publicly readable" ON share_links
  FOR SELECT USING (true);

-- Ensure authenticated users can create links for any entity type
DROP POLICY IF EXISTS "Users can create share links" ON share_links;
CREATE POLICY "Users can create share links" ON share_links
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Comments table update (if not already done) to allow guest comments via API (handled by service role, but good to have constraint)
-- We will handle guest comments via the server-side API using the service key, so no RLS change needed for comments table specifically for guests.
-- However, we need to ensure the comments table supports a text-based 'author' field if it doesn't already (it does based on previous checks).
