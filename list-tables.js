#!/usr/bin/env node

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function listTables() {
  // Try to get schema from PostgREST API
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY
    }
  })
  
  const schema = await response.json()
  const tables = Object.keys(schema.definitions || {})
  
  console.log(`\n📊 Found ${tables.length} tables in Supabase:\n`)
  tables.sort().forEach((table, i) => {
    console.log(`${(i+1).toString().padStart(2, ' ')}. ${table}`)
  })
  
  return tables
}

listTables().catch(console.error)
