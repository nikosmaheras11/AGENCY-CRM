#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

async function showCreative() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('project_type', 'creative')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`\n📋 Creative Requests (${data?.length || 0}):\n`)
  
  data?.forEach((req, idx) => {
    console.log(`${idx + 1}. ${req.title}`)
    console.log(`   Status: ${req.status}`)
    console.log(`   Format: ${req.format}`)
    console.log(`   Video URL: ${req.video_url || 'none'}`)
    console.log(`   Figma URL: ${req.figma_url || 'none'}`)
    console.log(`   ID: ${req.id}`)
    console.log('')
  })
}

showCreative()
