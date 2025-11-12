-- Add client_id to profiles to support client guest users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for client guest lookups
CREATE INDEX IF NOT EXISTS profiles_client_id_idx ON profiles(client_id) WHERE client_id IS NOT NULL;

-- Add company/organization name for client guests
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- Update RLS policies to allow client guests to see their own client's data

-- Client guests can view requests for their client
DROP POLICY IF EXISTS "Users can view all requests" ON requests;
CREATE POLICY "Users can view requests"
ON requests FOR SELECT
USING (
  -- Internal team can see all
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'user')
    )
  )
  OR
  -- Client guests can only see their client's requests
  (
    client_id IN (
      SELECT client_id FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client_guest'
    )
  )
);

-- Client guests can view assets for their client's requests
DROP POLICY IF EXISTS "Users can view all assets" ON assets;
CREATE POLICY "Users can view assets"
ON assets FOR SELECT
USING (
  -- Internal team can see all
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'user')
    )
  )
  OR
  -- Client guests can see assets for their client's requests
  (
    request_id IN (
      SELECT r.id FROM requests r
      INNER JOIN profiles p ON p.client_id = r.client_id
      WHERE p.id = auth.uid()
      AND p.role = 'client_guest'
    )
  )
);

-- Client guests can add comments (for feedback)
CREATE POLICY "Client guests can comment on their requests"
ON comments FOR INSERT
WITH CHECK (
  request_id IN (
    SELECT r.id FROM requests r
    INNER JOIN profiles p ON p.client_id = r.client_id
    WHERE p.id = auth.uid()
    AND p.role = 'client_guest'
  )
);

-- Create a view for easier client team member lookup
CREATE OR REPLACE VIEW client_team_members AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.role,
  p.client_id,
  p.company,
  c.name as client_name,
  c.logo_url as client_logo_url
FROM profiles p
LEFT JOIN clients c ON p.client_id = c.id
WHERE p.role = 'client_guest';

-- Grant access to the view
GRANT SELECT ON client_team_members TO authenticated;

COMMENT ON COLUMN profiles.client_id IS 'Links client guest users to their company. NULL for internal team members.';
COMMENT ON COLUMN profiles.role IS 'User role: admin (internal admin), user (internal team), client_guest (external reviewer)';
