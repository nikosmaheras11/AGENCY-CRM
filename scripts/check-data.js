#!/usr/bin/env node

/**
 * Check current data in Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://vzhthefdgumjkhnjpydt.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('🔍 Checking current data in Supabase...\n')
  
  // Check requests (projects)
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (reqError) {
    console.error('❌ Error fetching requests:', reqError.message)
  } else {
    console.log(`📋 Requests: ${requests.length} total`)
    if (requests.length > 0) {
      console.log('\nSample requests:')
      requests.slice(0, 3).forEach(req => {
        console.log(`  - ${req.title} (${req.request_type}, ${req.status})`)
      })
    }
  }
  
  // Check clients
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
  
  if (clientError) {
    console.error('❌ Error fetching clients:', clientError.message)
  } else {
    console.log(`\n👥 Clients: ${clients.length} total`)
    if (clients.length > 0) {
      clients.forEach(client => {
        console.log(`  - ${client.name}`)
      })
    }
  }
  
  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
  
  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message)
  } else {
    console.log(`\n🧑 Profiles: ${profiles.length} total`)
  }
  
  // Check assets
  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('*')
  
  if (assetError) {
    console.error('❌ Error fetching assets:', assetError.message)
  } else {
    console.log(`\n📁 Assets: ${assets.length} total`)
  }
  
  // Check comments
  const { data: comments, error: commentError } = await supabase
    .from('comments')
    .select('*')
  
  if (commentError) {
    console.error('❌ Error fetching comments:', commentError.message)
  } else {
    console.log(`\n💬 Comments: ${comments.length} total`)
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Data Summary:')
  console.log('='.repeat(60))
  console.log(`Total Requests: ${requests?.length || 0}`)
  console.log(`Total Clients: ${clients?.length || 0}`)
  console.log(`Total Profiles: ${profiles?.length || 0}`)
  console.log(`Total Assets: ${assets?.length || 0}`)
  console.log(`Total Comments: ${comments?.length || 0}`)
  
  if (requests?.length === 0) {
    console.log('\n💡 Tip: You can add sample data using scripts/seed-data.js')
  }
}

checkData().catch(console.error)
