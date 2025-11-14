-- ============================================
-- Check for Database-Level Auth Errors
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Section 1: Check for database errors with Auth
select 
  cast(postgres_logs.timestamp as datetime) as timestamp,
  event_message,
  parsed.error_severity,
  parsed.user_name,
  parsed.query,
  parsed.detail,
  parsed.hint,
  parsed.sql_state_code,
  parsed.backend_type
from postgres_logs
cross join unnest(metadata) as metadata
cross join unnest(metadata.parsed) as parsed
where regexp_contains(parsed.error_severity, 'ERROR|FATAL|PANIC')
  and regexp_contains(parsed.user_name, 'supabase_auth_admin')
order by timestamp desc
limit 100;

-- Section 2: Check for Auth-level errors
select 
  cast(metadata.timestamp as datetime) as timestamp,
  msg,
  event_message,
  status,
  path,
  level
from auth_logs
cross join unnest(metadata) as metadata
where 
  -- find all errors
  status::INT = 500 
  OR regexp_contains(level, 'error|fatal')
order by timestamp desc
limit 100;
