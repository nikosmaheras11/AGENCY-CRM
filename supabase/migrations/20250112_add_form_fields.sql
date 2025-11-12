-- Add form-specific fields to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS to_user TEXT; -- "ToF: Texas | Nick, etc." from form
ALTER TABLE requests ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id); -- Make assignee_id a proper UUID reference
ALTER TABLE requests ADD COLUMN IF NOT EXISTS asset_file_url TEXT; -- Uploaded asset file URL
ALTER TABLE requests ADD COLUMN IF NOT EXISTS inspiration TEXT; -- "Inspiration" field
ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_by_name TEXT; -- Name of creator

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_requests_to_user ON requests(to_user) WHERE to_user IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_assignee_id ON requests(assignee_id) WHERE assignee_id IS NOT NULL;

-- Update comments table to include author name
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update asset_versions table to include creator name
ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- Create a trigger to auto-populate created_by_name from auth.users
CREATE OR REPLACE FUNCTION populate_created_by_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL AND NEW.created_by_name IS NULL THEN
    SELECT COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      email
    ) INTO NEW.created_by_name
    FROM auth.users
    WHERE id = NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to requests
DROP TRIGGER IF EXISTS populate_requests_created_by_name ON requests;
CREATE TRIGGER populate_requests_created_by_name
  BEFORE INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION populate_created_by_name();

-- Apply trigger to asset_versions
DROP TRIGGER IF EXISTS populate_asset_versions_created_by_name ON asset_versions;
CREATE TRIGGER populate_asset_versions_created_by_name
  BEFORE INSERT ON asset_versions
  FOR EACH ROW
  EXECUTE FUNCTION populate_created_by_name();

-- Update RLS policies to include new patterns
DROP POLICY IF EXISTS "Users can update their own requests or assigned requests" ON requests;
CREATE POLICY "Users can update their own requests or assigned requests" 
ON requests FOR UPDATE 
TO authenticated
USING (
  auth.uid() = created_by OR 
  auth.uid() = assignee_id OR
  auth.uid()::text = assignee
);

-- Add policy for asset file uploads
CREATE POLICY "Users can upload assets for requests they created"
ON requests FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);
