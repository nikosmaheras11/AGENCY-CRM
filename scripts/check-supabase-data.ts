#!/usr/bin/env node
/**
 * Quick check to see if Supabase database has any requests
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
  console.log('🔍 Checking Supabase database...\n')
  console.log(`📍 URL: ${supabaseUrl}\n`)
  
  const { data, error, count } = await supabase
    .from('requests')
    .select('*', { count: 'exact' })
  
  if (error) {
    console.error('❌ Error fetching data:', error.message)
    console.log('\n💡 This might mean the table doesn\'t exist yet.')
    console.log('   Run the SQL migration first in your Supabase dashboard.')
    return
  }
  
  console.log(`📊 Total requests in database: ${count}`)
  
  if (data && data.length > 0) {
    console.log('\n✅ Database has data!\n')
    console.log('Requests by type:')
    const byType = data.reduce((acc: any, req: any) => {
      acc[req.project_type] = (acc[req.project_type] || 0) + 1
      return acc
    }, {})
    console.log(byType)
    
    console.log('\nRequests by status:')
    const byStatus = data.reduce((acc: any, req: any) => {
      acc[req.status] = (acc[req.status] || 0) + 1
      return acc
    }, {})
    console.log(byStatus)
    
    console.log('\nSample request:')
    console.log(data[0])
  } else {
    console.log('\n⚠️  Database is empty!')
    console.log('   Run: pnpm tsx scripts/migrate-to-supabase-db.ts')
  }
}

checkData().catch(console.error)
