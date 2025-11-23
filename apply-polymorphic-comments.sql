-- APPLY POLYMORPHIC COMMENTS MIGRATION
-- Run this in Supabase SQL Editor

-- First, check if columns already exist
DO $$ 
BEGIN
    -- Add entity_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE comments ADD COLUMN entity_type VARCHAR(50);
    END IF;

    -- Add entity_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'entity_id'
    ) THEN
        -- Check if request_id is TEXT or UUID to match the type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'comments' 
            AND column_name = 'request_id' 
            AND data_type = 'text'
        ) THEN
            ALTER TABLE comments ADD COLUMN entity_id TEXT;
        ELSE
            ALTER TABLE comments ADD COLUMN entity_id UUID;
        END IF;
    END IF;

    -- Add campaign_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'campaign_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE;
    END IF;

    -- Add ad_set_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'ad_set_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE;
    END IF;

    -- Add creative_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'creative_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Modify the constraint to allow NULL request_id
ALTER TABLE comments ALTER COLUMN request_id DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id) WHERE entity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_campaign ON comments(campaign_id, created_at DESC) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_ad_set ON comments(ad_set_id, created_at DESC) WHERE ad_set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_creative ON comments(creative_id, created_at DESC) WHERE creative_id IS NOT NULL;

-- Backfill entity_type and entity_id for existing comments with request_id
-- Cast request_id to match entity_id type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' 
    AND column_name = 'entity_id' 
    AND data_type = 'uuid'
  ) THEN
    -- entity_id is UUID, need to cast TEXT request_id
    UPDATE comments SET 
      entity_type = 'request',
      entity_id = request_id::UUID
    WHERE request_id IS NOT NULL AND entity_type IS NULL;
  ELSE
    -- entity_id is TEXT, no cast needed
    UPDATE comments SET 
      entity_type = 'request',
      entity_id = request_id
    WHERE request_id IS NOT NULL AND entity_type IS NULL;
  END IF;
END $$;

-- Create function to auto-populate entity fields
CREATE OR REPLACE FUNCTION populate_comment_entity_fields()
RETURNS TRIGGER AS $$
DECLARE
  entity_id_is_uuid BOOLEAN;
BEGIN
  -- Check if entity_id column is UUID type
  SELECT data_type = 'uuid' INTO entity_id_is_uuid
  FROM information_schema.columns
  WHERE table_name = 'comments' AND column_name = 'entity_id';

  -- If polymorphic fields are set, populate specific FK columns
  IF NEW.entity_type = 'campaign' AND NEW.entity_id IS NOT NULL THEN
    NEW.campaign_id = NEW.entity_id::UUID;
  ELSIF NEW.entity_type = 'ad_set' AND NEW.entity_id IS NOT NULL THEN
    NEW.ad_set_id = NEW.entity_id::UUID;
  ELSIF NEW.entity_type = 'creative' AND NEW.entity_id IS NOT NULL THEN
    NEW.creative_id = NEW.entity_id::UUID;
  ELSIF NEW.entity_type = 'request' AND NEW.entity_id IS NOT NULL THEN
    IF entity_id_is_uuid THEN
      NEW.request_id = NEW.entity_id::TEXT;
    ELSE
      NEW.request_id = NEW.entity_id;
    END IF;
  END IF;

  -- If specific FK columns are set but polymorphic fields are not, populate them
  IF NEW.campaign_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'campaign';
    IF entity_id_is_uuid THEN
      NEW.entity_id = NEW.campaign_id;
    ELSE
      NEW.entity_id = NEW.campaign_id::TEXT;
    END IF;
  ELSIF NEW.ad_set_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'ad_set';
    IF entity_id_is_uuid THEN
      NEW.entity_id = NEW.ad_set_id;
    ELSE
      NEW.entity_id = NEW.ad_set_id::TEXT;
    END IF;
  ELSIF NEW.creative_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'creative';
    IF entity_id_is_uuid THEN
      NEW.entity_id = NEW.creative_id;
    ELSE
      NEW.entity_id = NEW.creative_id::TEXT;
    END IF;
  ELSIF NEW.request_id IS NOT NULL AND NEW.entity_type IS NULL THEN
    NEW.entity_type = 'request';
    IF entity_id_is_uuid THEN
      NEW.entity_id = NEW.request_id::UUID;
    ELSE
      NEW.entity_id = NEW.request_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS populate_comment_entity_fields_trigger ON comments;
CREATE TRIGGER populate_comment_entity_fields_trigger
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION populate_comment_entity_fields();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'comments'
  AND column_name IN ('entity_type', 'entity_id', 'campaign_id', 'ad_set_id', 'creative_id')
ORDER BY column_name;
