-- Verify comments table schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'comments'
ORDER BY ordinal_position;

-- Check for triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'comments';

-- Check for constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'comments';

-- Test insert to see what error we get
-- (This will fail but show us the actual error)
-- INSERT INTO comments (entity_type, entity_id, content) 
-- VALUES ('request', 'test-id-123', 'Test comment') 
-- RETURNING *;
