-- Storage RLS Policies for 'assets' bucket
-- This allows authenticated users to upload files and anyone to read them

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload to assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Allow authenticated users to upload files to assets bucket
CREATE POLICY "Authenticated users can upload to assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Allow anyone to read files from assets bucket (public access)
CREATE POLICY "Anyone can read assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid() = owner);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND auth.uid() = owner);
