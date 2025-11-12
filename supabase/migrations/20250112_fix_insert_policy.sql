-- Drop all existing policies on requests table
DROP POLICY IF EXISTS "Enable all for requests" ON requests;
DROP POLICY IF EXISTS "Users can update their own requests or assigned requests" ON requests;
DROP POLICY IF EXISTS "Users can upload assets for requests they created" ON requests;

-- Create simple, permissive policies for all operations
CREATE POLICY "Enable read for all authenticated users"
ON requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for all authenticated users"
ON requests FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all authenticated users"
ON requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all authenticated users"
ON requests FOR DELETE
TO authenticated
USING (true);
