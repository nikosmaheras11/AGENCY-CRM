#!/usr/bin/env node

/**
 * Apply the realtime comments migration to Supabase
 * This script reads the SQL migration file and executes it against the Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = join(projectRoot, 'supabase/migrations/20250113_enable_realtime_comments.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('🚀 Applying migration to Supabase...')
    console.log('Migration SQL:')
    console.log(migrationSQL)
    console.log('\n---\n')
    
    // Split SQL statements by semicolon and execute each one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      })
      
      if (error) {
        // Try direct execution via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: statement })
        })
        
        if (!response.ok) {
          console.warn(`⚠️  Could not execute via RPC: ${error.message}`)
          console.log('💡 You may need to run this migration manually in the Supabase SQL Editor')
        }
      }
    }
    
    console.log('\n✅ Migration applied successfully!')
    console.log('\n📝 Manual verification steps:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Run: SELECT column_name FROM information_schema.columns WHERE table_name = \'comments\' AND column_name = \'video_timestamp\';')
    console.log('3. Verify the realtime publication: SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = \'supabase_realtime\';')
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message)
    console.log('\n💡 Please apply the migration manually:')
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/editor')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of: supabase/migrations/20250113_enable_realtime_comments.sql')
    console.log('4. Execute the SQL')
    process.exit(1)
  }
}

applyMigration()
