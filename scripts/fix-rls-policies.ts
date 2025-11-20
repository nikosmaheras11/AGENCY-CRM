import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔧 Fixing RLS policies for public read access...\n')

async function fixRLSPolicies() {
  // List of tables that need public read access
  const tables = [
    'requests',
    'clients',
    'assets',
    'profiles',
    'comments',
    'asset_versions',
    'slack_messages'
  ]

  console.log('📋 Tables to update:', tables.join(', '))
  console.log()

  for (const table of tables) {
    console.log(`🔨 Creating SELECT policy for: ${table}`)
    
    // Create a policy allowing SELECT for all authenticated and anon users
    const policyName = `Enable read access for all users`
    
    try {
      // First, let's check if RLS is enabled
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT relname, relrowsecurity
          FROM pg_class
          WHERE relname = '${table}' AND relkind = 'r';
        `
      }).single()

      if (rpcError) {
        console.log(`   ⚠️  Could not check RLS status: ${rpcError.message}`)
      }

      // Create or replace the SELECT policy
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "${policyName}" ON public.${table};
          
          -- Create new policy allowing SELECT for everyone
          CREATE POLICY "${policyName}"
          ON public.${table}
          FOR SELECT
          USING (true);
        `
      })

      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
      } else {
        console.log(`   ✅ Policy created successfully`)
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err?.message || err}`)
    }
    console.log()
  }

  console.log('✅ RLS policy update complete!')
  console.log()
  console.log('Now testing with anon key...')
  
  // Test with anon key
  const anonClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!)
  const { data, error } = await anonClient
    .from('requests')
    .select('id, title, status')
    .limit(5)
  
  if (error) {
    console.log('❌ Anon test failed:', error.message)
  } else {
    console.log(`✅ Anon test passed! Found ${data?.length || 0} requests`)
    if (data && data.length > 0) {
      console.log('Sample:', data[0])
    }
  }
}

fixRLSPolicies()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
