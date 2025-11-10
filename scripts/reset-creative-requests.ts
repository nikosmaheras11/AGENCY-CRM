#!/usr/bin/env node
/**
 * Reset creative requests - delete all and add only the two we want
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function reset() {
  console.log('🗑️  Deleting ALL creative requests...\n')
  
  // Delete all creative requests
  const { error: deleteError } = await supabase
    .from('requests')
    .delete()
    .eq('project_type', 'creative')
  
  if (deleteError) {
    console.error('❌ Delete failed:', deleteError.message)
    return
  }
  
  console.log('✅ All creative requests deleted\n')
  console.log('➕ Adding the two main requests...\n')
  
  // Add Google Ad Brainstorm
  const { error: error1 } = await supabase
    .from('requests')
    .insert({
      project_type: 'creative',
      status: 'in-progress',
      title: 'Google Ad Brainstorm',
      format: 'Figma',
      size: '—',
      dimensions: '—',
      duration: '—',
      figma_url: 'https://www.figma.com/design/oNc959dRXzFRbRdWbDkW0R/Polymarket-Ad-Master-Doc?node-id=383-3866&t=AO2exoexFrM7drs2-4',
      tags: ['google', 'ads', 'brainstorm'],
      client: 'Polymarket',
      campaign: 'Google Ads',
      created_at: '2025-01-10T06:00:00Z',
      updated_at: '2025-01-10T06:00:00Z'
    })
  
  if (error1) {
    console.error('❌ Failed to add Google Ad:', error1.message)
  } else {
    console.log('✅ Added: Google Ad Brainstorm')
  }
  
  // Add RAMS UGC Video
  const { error: error2 } = await supabase
    .from('requests')
    .insert({
      project_type: 'creative',
      status: 'needs-review',
      title: 'RAMS UGC Video',
      format: 'MP4',
      size: '125 MB',
      dimensions: '1920 × 1080',
      duration: '1:23',
      thumbnail_url: '/thumbnails/rams-ugc-video.jpg',
      video_url: '/videos/rams-ugc-video.mp4',
      tags: ['video', 'ugc', 'performance'],
      client: 'Polymarket',
      campaign: 'Performance',
      category: 'Performance',
      created_at: '2025-01-11T07:24:00Z',
      updated_at: '2025-01-11T07:24:00Z'
    })
  
  if (error2) {
    console.error('❌ Failed to add RAMS Video:', error2.message)
  } else {
    console.log('✅ Added: RAMS UGC Video')
  }
  
  // Verify
  const { data, count } = await supabase
    .from('requests')
    .select('*', { count: 'exact' })
    .eq('project_type', 'creative')
  
  console.log(`\n📊 Total creative requests: ${count}`)
  data?.forEach(r => console.log(`   - ${r.title} (${r.status})`))
}

reset().catch(console.error)
