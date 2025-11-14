-- ============================================
-- Check for Database Triggers on Auth Tables
-- ============================================

-- Check all triggers on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check the specific trigger mentioned in WARP.md
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'populate_requests_created_by_name'
ORDER BY trigger_name;

-- Get function definitions for any triggers
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%populate%'
ORDER BY p.proname;

-- Check trigger status on requests table
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    c.relname AS table_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'requests'
  AND t.tgname LIKE '%populate%'
ORDER BY t.tgname;
