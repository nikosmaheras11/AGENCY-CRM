import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyStoragePolicies() {
  console.log('🔐 Applying Storage RLS policies...\n')
  
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'supabase/migrations/20250113_storage_policies.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    // Split SQL into individual statements and execute each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`)
    
    for (const statement of statements) {
      if (statement.includes('DROP POLICY')) {
        console.log('🗑️  Dropping existing policy...')
      } else if (statement.includes('CREATE POLICY')) {
        const policyName = statement.match(/"([^"]+)"/)?.[1]
        console.log(`✅ Creating policy: ${policyName}`)
      }
      
      const { error } = await supabase.rpc('exec', {
        sql: statement + ';'
      })
      
      if (error) {
        // Try alternative: use query directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: statement + ';' })
        })
        
        if (!response.ok) {
          console.log('⚠️  Could not execute via RPC')
          console.log('📋 Please copy and paste this SQL into Supabase SQL Editor:\n')
          console.log(sql)
          console.log('\nGo to: https://supabase.com/dashboard/project/_/sql/new')
          return
        }
      }
    }
    
    console.log('\n✅ All storage policies applied successfully!')
    console.log('\n📊 Policies created:')
    console.log('   ✓ Authenticated users can upload files')
    console.log('   ✓ Anyone can read files (public)')
    console.log('   ✓ Users can update their own files')
    console.log('   ✓ Users can delete their own files')
    
  } catch (error: any) {
    console.error('\n❌ Error applying policies:', error.message)
    console.log('\n📋 Manual Setup Required:')
    console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new')
    console.log('2. Copy the SQL from: supabase/migrations/20250113_storage_policies.sql')
    console.log('3. Paste and run it in the SQL Editor')
  }
}

applyStoragePolicies()
