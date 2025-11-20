#!/usr/bin/env node

/**
 * Run this migration in Supabase SQL Editor:
 * https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql
 * 
 * Copy the contents of supabase/migrations/20250120_create_new_requests_table.sql
 * and execute it in the SQL Editor.
 * 
 * This creates:
 * 1. new_requests table (brief stage)
 * 2. Auto-migration trigger (moves to requests table when status changes)
 * 3. activity_log table (tracks migrations)
 */

console.log(`
📋 MIGRATION INSTRUCTIONS
========================

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql

2. Copy the SQL from:
   supabase/migrations/20250120_create_new_requests_table.sql

3. Paste and run in SQL Editor

4. Verify tables created:
   - new_requests
   - activity_log

This will set up the brief workflow system where:
- New requests start in 'new_requests' table (status: new-request, in-progress)
- When status changes to needs-review/needs-edit/done, they auto-migrate to 'requests' table
- The asset viewer workflow takes over after migration
`);

// Show file path for easy access
const path = require('path');
const migrationPath = path.join(__dirname, '../supabase/migrations/20250120_create_new_requests_table.sql');
console.log(`\n📁 Migration file location:`);
console.log(`   ${migrationPath}\n`);
