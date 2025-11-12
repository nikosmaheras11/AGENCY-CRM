-- Ensure status column has proper NOT NULL constraint and default
ALTER TABLE requests 
  ALTER COLUMN status SET DEFAULT 'new-request',
  ALTER COLUMN status SET NOT NULL;

-- Update any existing NULL statuses
UPDATE requests SET status = 'new-request' WHERE status IS NULL;

-- Ensure priority has default too
ALTER TABLE requests 
  ALTER COLUMN priority SET DEFAULT 'medium';

UPDATE requests SET priority = 'medium' WHERE priority IS NULL;
