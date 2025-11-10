#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vzhthefdgumjkhnjpydt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHRoZWZkZ3VtamtobmpweWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjkxMDEsImV4cCI6MjA3ODMwNTEwMX0.qkQ0n37EOdgMhyETSoWqQHWIK0Fr4LqaPoAVmXBepdI'

async function checkSchema() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🔍 Checking Supabase schema...\n')
  
  const { data, error } = await supabase
    .from('requests')
    .select('count', { count: 'exact', head: true })
  
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ requests table does not exist\n')
      console.log('📋 Apply schema in Supabase SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql/new\n')
      console.log('   Copy and paste: supabase/migrations/20250110_create_requests_schema.sql')
    } else {
      console.error('❌ Error:', error.message, error.code)
    }
  } else {
    console.log('✅ requests table exists!')
    console.log('   Record count:', data || 0)
    
    const { data: buckets } = await supabase.storage.listBuckets()
    const hasCreativeAssets = buckets?.some(b => b.name === 'creative-assets')
    
    console.log('✅ creative-assets bucket:', hasCreativeAssets ? 'exists' : 'missing\n')
    
    if (!hasCreativeAssets) {
      console.log('⚠️  Run migration to create bucket')
    }
    
    console.log('\n🚀 Ready to migrate data! Run:')
    console.log('   npx tsx scripts/migrate-to-supabase-db.ts')
  }
}

checkSchema().catch(console.error)
