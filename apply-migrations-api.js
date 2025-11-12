#!/usr/bin/env node

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config()

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Migration files in order
const migrations = [
  'supabase/migrations/20250110_complete_schema.sql',
  'supabase/migrations/20251111170928_video_versioning.sql',
  'supabase/migrations/20250111_slack_mentions.sql',
  'supabase/migrations/002_asset_viewer_schema.sql',
  'supabase/migrations/003_clean_asset_viewer_setup.sql',
  'supabase/migrations/20250112_add_client_guests.sql',
  'supabase/migrations/20250112_add_description_column.sql'
]

async function executeSql(sql) {
  // Execute SQL via Supabase using fetch to the PostgREST endpoint
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    },
    body: JSON.stringify({ sql })
  })

  if (!response.ok) {
    // Try direct query approach
    const directResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    })
    
    // If RPC not available, we'll use pg_query extension via HTTP
    throw new Error(`Cannot execute SQL via API. Status: ${response.status}. You may need to use psql directly.`)
  }

  return await response.json()
}

async function applyMigrations() {
  console.log('🚀 Applying migrations via Supabase API...\n')

  for (const migrationFile of migrations) {
    try {
      console.log(`📄 Reading: ${migrationFile}`)
      const sql = readFileSync(migrationFile, 'utf-8')
      
      console.log(`⚙️  Applying migration...`)
      
      // Split SQL into individual statements (basic approach)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      console.log(`   Found ${statements.length} statements to execute`)
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        
        // Skip comments and empty statements
        if (statement.trim().startsWith('--') || statement.trim() === ';') {
          continue
        }
        
        try {
          // Use Supabase client to execute raw SQL via rpc
          await executeSql(statement)
          process.stdout.write('.')
        } catch (err) {
          // Many statements might already exist, so we'll continue
          if (!err.message.includes('already exists')) {
            console.log(`\n   ⚠️  Warning on statement ${i + 1}: ${err.message.substring(0, 100)}`)
          }
        }
      }
      
      console.log('\n✅ Migration applied\n')
      
    } catch (error) {
      console.error(`❌ Error reading ${migrationFile}:`, error.message)
    }
  }
  
  console.log('🎉 Migration process complete!\n')
  console.log('Verifying tables...\n')
  
  // List tables
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY
    }
  })
  
  const schema = await response.json()
  const tables = Object.keys(schema.definitions || {})
  
  console.log(`📊 Found ${tables.length} tables:\n`)
  tables.sort().forEach((table, i) => {
    console.log(`${(i+1).toString().padStart(2, ' ')}. ${table}`)
  })
  
  console.log(`\n${tables.length >= 30 ? '✅' : '⚠️'} Expected 30 tables, found ${tables.length}`)
}

applyMigrations().catch(error => {
  console.error('\n❌ Fatal error:', error.message)
  console.log('\n💡 Alternative: Use direct database connection with psql')
  console.log('   Add SUPABASE_DB_PASSWORD to .env and run: ./apply-migrations.sh')
  process.exit(1)
})
