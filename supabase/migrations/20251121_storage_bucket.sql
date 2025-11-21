-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
