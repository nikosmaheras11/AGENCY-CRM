#!/usr/bin/env node

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'list-tables':
      await listTables()
      break
    case 'query-requests':
      await queryRequests()
      break
    case 'create-client':
      await createNewClient()
      break
    case 'update-request':
      await updateRequest()
      break
    default:
      console.log('Usage: node supabase-query.js <command>')
      console.log('Commands:')
      console.log('  list-tables     - Show all tables')
      console.log('  query-requests  - Query all requests')
      console.log('  create-client   - Create a new client')
      console.log('  update-request  - Update a request status')
  }
}

async function listTables() {
  console.log('📊 Fetching all tables...\n')
  
  const { data, error } = await supabase.rpc('get_tables')
  
  if (error) {
    // Fallback: query information_schema directly
    const { data: tables, error: err } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (err) {
      console.error('❌ Error:', err.message)
      // Try alternative method using raw SQL
      const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
        query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      })
      
      if (rawError) {
        console.error('❌ Error:', rawError.message)
        console.log('\n💡 Listing known tables from schema documentation:')
        const knownTables = [
          'requests', 'clients', 'assets', 'comments', 'video_versions',
          'timecode_comments', 'slack_messages', 'performance_metrics',
          'automation_rules', 'profiles', 'user_mentions'
        ]
        knownTables.forEach(table => console.log(`  • ${table}`))
      } else {
        console.log('Tables:', rawData)
      }
    } else {
      console.log('✓ Tables found:')
      tables.forEach(t => console.log(`  • ${t.table_name}`))
    }
  } else {
    console.log('✓ Tables:', data)
  }
}

async function queryRequests() {
  console.log('📋 Querying all requests...\n')
  
  const { data, error } = await supabase
    .from('requests')
    .select('id, title, request_type, status, created_at, client:clients(name), assigned:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (data.length === 0) {
    console.log('No requests found.')
    return
  }
  
  console.log(`✓ Found ${data.length} requests:\n`)
  data.forEach(req => {
    console.log(`ID: ${req.id}`)
    console.log(`Title: ${req.title}`)
    console.log(`Type: ${req.request_type}`)
    console.log(`Status: ${req.status}`)
    console.log(`Client: ${req.client?.name || 'N/A'}`)
    console.log(`Assigned: ${req.assigned?.full_name || 'Unassigned'}`)
    console.log(`Created: ${new Date(req.created_at).toLocaleString()}`)
    console.log('---')
  })
}

async function createNewClient() {
  console.log('👤 Creating new client...\n')
  
  const newClient = {
    name: 'Test Client',
    email: 'test@example.com',
    company: 'Test Company',
    status: 'active'
  }
  
  const { data, error } = await supabase
    .from('clients')
    .insert(newClient)
    .select()
    .single()
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log('✓ Client created successfully!')
  console.log('ID:', data.id)
  console.log('Name:', data.name)
  console.log('Email:', data.email)
}

async function updateRequest() {
  console.log('🔄 Updating request status...\n')
  
  // First, get the first request
  const { data: requests, error: fetchError } = await supabase
    .from('requests')
    .select('id, title, status')
    .limit(1)
    .single()
  
  if (fetchError || !requests) {
    console.error('❌ No requests found to update')
    return
  }
  
  console.log(`Found request: ${requests.title} (${requests.status})`)
  
  // Update status
  const newStatus = requests.status === 'new_request' ? 'in_progress' : 'new_request'
  
  const { data, error } = await supabase
    .from('requests')
    .update({ status: newStatus })
    .eq('id', requests.id)
    .select()
    .single()
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`✓ Status updated: ${requests.status} → ${data.status}`)
}

main().catch(console.error)
