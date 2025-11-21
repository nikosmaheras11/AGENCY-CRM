-- Note: The storage bucket 'assets' must be created manually in Supabase Dashboard
-- Go to Storage > Create a new bucket > Name: 'assets' > Public bucket: Yes

-- This migration only sets up the RLS policies
-- The bucket creation must be done through the Supabase Dashboard UI

-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Policy: Allow public read access to assets
CREATE POLICY "Public read access to assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Policy: Allow users to update their own uploads
CREATE POLICY "Users can update their own assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = owner::text);

-- Policy: Allow users to delete their own uploads
CREATE POLICY "Users can delete their own assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = owner::text);
