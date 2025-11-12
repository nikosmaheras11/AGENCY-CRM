-- Add description column to requests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'requests' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE requests ADD COLUMN description TEXT;
  END IF;
END $$;
