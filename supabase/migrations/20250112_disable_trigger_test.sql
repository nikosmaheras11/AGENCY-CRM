-- Temporarily disable the trigger to test if it's causing hangs
DROP TRIGGER IF EXISTS populate_requests_created_by_name ON requests;

-- Note: This removes the auto-populate functionality
-- We'll manually populate created_by_name in the app code instead
