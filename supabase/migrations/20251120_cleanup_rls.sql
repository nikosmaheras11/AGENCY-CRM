-- Drop the insecure "Enable all" policy
DROP POLICY IF EXISTS "Enable all for campaigns" ON campaigns;
