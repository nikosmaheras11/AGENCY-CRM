#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function verifyData() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
  )
  
  console.log('🔍 Verifying Supabase data...\n')
  
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('project_type', 'creative')
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`✅ Found ${data?.length || 0} creative requests\n`)
  
  data?.forEach(req => {
    console.log(`📋 ${req.title}`)
    console.log(`   Status: ${req.status}`)
    if (req.figma_url) {
      console.log(`   Figma: ${req.figma_url.substring(0, 50)}...`)
    }
    if (req.video_url) {
      console.log(`   Video: ${req.video_url.substring(0, 80)}...`)
    }
    console.log('')
  })
  
  // Check storage
  const { data: files, error: filesError } = await supabase.storage
    .from('creative-assets')
    .list('videos')
  
  if (!filesError && files) {
    console.log(`📦 Storage files: ${files.length}`)
    files.forEach(f => console.log(`   - ${f.name}`))
  }
}

verifyData().catch(console.error)
