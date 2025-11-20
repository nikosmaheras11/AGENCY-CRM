import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

console.log('🔍 Testing Supabase Connection...\n')
console.log('Environment:')
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
console.log('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
console.log()

async function testConnection() {
  // Test with anon key (client-side)
  console.log('1️⃣ Testing with ANON key (client-side)...')
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    const { data, error } = await anonClient
      .from('requests')
      .select('id, title, status')
      .limit(5)
    
    if (error) {
      console.error('❌ Anon client error:', error)
    } else {
      console.log('✅ Anon client works! Found', data?.length || 0, 'requests')
      console.log('Sample:', data?.[0])
    }
  } catch (err) {
    console.error('❌ Anon client exception:', err)
  }
  console.log()

  // Test with service key (server-side)
  console.log('2️⃣ Testing with SERVICE_ROLE key (server-side)...')
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    const { data, error } = await serviceClient
      .from('requests')
      .select('id, title, status')
      .limit(5)
    
    if (error) {
      console.error('❌ Service client error:', error)
    } else {
      console.log('✅ Service client works! Found', data?.length || 0, 'requests')
      console.log('Sample:', data?.[0])
    }
  } catch (err) {
    console.error('❌ Service client exception:', err)
  }
  console.log()

  // Test other tables
  console.log('3️⃣ Testing other tables...')
  const tables = ['clients', 'assets', 'profiles', 'comments']
  
  for (const table of tables) {
    try {
      const { data, error } = await anonClient
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}:`, error.message)
      } else {
        console.log(`✅ ${table}: accessible (${data?.length || 0} rows)`)
      }
    } catch (err: any) {
      console.log(`❌ ${table}:`, err?.message || err)
    }
  }
  console.log()

  // Test authentication
  console.log('4️⃣ Testing authentication...')
  try {
    const { data: { user }, error } = await anonClient.auth.getUser()
    
    if (error) {
      console.log('ℹ️ Not authenticated (expected for anon key):', error.message)
    } else if (user) {
      console.log('✅ Authenticated as:', user.email)
    } else {
      console.log('ℹ️ No user authenticated (expected for anon key)')
    }
  } catch (err: any) {
    console.log('⚠️ Auth check failed:', err?.message || err)
  }
  console.log()

  // Test with invalid query to see error format
  console.log('5️⃣ Testing error handling (intentional error)...')
  try {
    const { data, error } = await anonClient
      .from('nonexistent_table')
      .select('*')
    
    if (error) {
      console.log('Expected error format:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
  } catch (err: any) {
    console.log('Exception format:', err?.message || err)
  }
}

testConnection()
  .then(() => {
    console.log('\n✅ Connection test complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
