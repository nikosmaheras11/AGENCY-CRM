#!/usr/bin/env node

/**
 * Apply SQL migration to Supabase database
 * Usage: node scripts/apply-migration.js <migration-file.sql>
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROJECT_REF = 'vzhthefdgumjkhnjpydt';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY not found in environment');
  console.error(`Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`);
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node scripts/apply-migration.js <migration-file.sql>');
  console.error('Example: node scripts/apply-migration.js supabase/migrations/20250112_add_description_column.sql');
  process.exit(1);
}

const migrationPath = path.resolve(migrationFile);
if (!fs.existsSync(migrationPath)) {
  console.error(`Error: Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

console.log(`Applying migration: ${path.basename(migrationFile)}`);
console.log(`Project: ${PROJECT_REF}`);
console.log('');

// Execute SQL via Supabase REST API
async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

// Try direct SQL execution via postgres connection
async function executeViaPostgres(sql) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    db: {
      schema: 'public'
    }
  });

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`[${i + 1}/${statements.length}] Executing...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) throw error;
    } catch (err) {
      console.error(`Failed at statement ${i + 1}:`);
      console.error(statement.substring(0, 200) + '...');
      throw err;
    }
  }
}

// Main execution
(async () => {
  try {
    // Check if we need to install @supabase/supabase-js
    try {
      require('@supabase/supabase-js');
    } catch {
      console.log('Installing @supabase/supabase-js...');
      const { execSync } = require('child_process');
      execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
    }

    await executeViaPostgres(sqlContent);
    console.log('✓ Migration applied successfully!');
  } catch (error) {
    console.error('✗ Migration failed:');
    console.error(error.message);
    process.exit(1);
  }
})();
