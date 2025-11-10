#!/usr/bin/env node
/**
 * Execute SQL cleanup directly
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runCleanup() {
  console.log('🗑️  Step 1: Deleting all creative requests...\n')
  
  // Get count before
  const { count: beforeCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('project_type', 'creative')
  
  console.log(`   Found ${beforeCount} creative requests\n`)
  
  // Delete using not-equal-to nothing (deletes all matching rows)
  const { error: deleteError } = await supabase
    .from('requests')
    .delete()
    .eq('project_type', 'creative')
    .neq('id', '00000000-0000-0000-0000-000000000000') // Match all IDs
  
  if (deleteError) {
    console.error('❌ Delete error:', deleteError)
    return
  }
  
  console.log('✅ Delete command executed\n')
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('➕ Step 2: Adding the two main requests...\n')
  
  const requests = [
    {
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
    },
    {
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
    }
  ]
  
  const { data: inserted, error: insertError } = await supabase
    .from('requests')
    .insert(requests)
    .select()
  
  if (insertError) {
    console.error('❌ Insert error:', insertError)
    return
  }
  
  console.log(`✅ Inserted ${inserted?.length || 0} requests\n`)
  
  // Verify final count
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { data: final, count: finalCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact' })
    .eq('project_type', 'creative')
  
  console.log('📊 Final verification:')
  console.log(`   Total creative requests: ${finalCount}\n`)
  
  if (final) {
    final.forEach(r => {
      console.log(`   ✓ ${r.title} (${r.status})`)
    })
  }
}

runCleanup().catch(console.error)
