#!/usr/bin/env node
/**
 * Force cleanup using raw SQL via RPC
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function forceCleanup() {
  console.log('🔧 Using raw SQL to clean up...\n')
  
  // Execute raw SQL to delete all creative requests
  const { data: deleteResult, error: deleteError } = await supabase.rpc('exec_sql', {
    query: "DELETE FROM requests WHERE project_type = 'creative';"
  })
  
  if (deleteError) {
    console.log('⚠️  RPC not available, trying direct table truncate...\n')
    
    // Alternative: Get all IDs and delete them one by one
    const { data: allCreative } = await supabase
      .from('requests')
      .select('id')
      .eq('project_type', 'creative')
    
    if (allCreative && allCreative.length > 0) {
      console.log(`Found ${allCreative.length} records to delete\n`)
      
      // Delete each one individually
      for (const record of allCreative) {
        await supabase
          .from('requests')
          .delete()
          .eq('id', record.id)
      }
      
      console.log('✅ Deleted all records individually\n')
    }
  } else {
    console.log('✅ SQL delete executed\n')
  }
  
  // Wait
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Insert ONLY one of each
  console.log('➕ Adding Google Ad Brainstorm...')
  const { error: e1 } = await supabase.from('requests').insert({
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
    campaign: 'Google Ads'
  })
  
  if (e1) console.error('Error:', e1)
  else console.log('✅ Added')
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log('\n➕ Adding RAMS UGC Video...')
  const { error: e2 } = await supabase.from('requests').insert({
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
    category: 'Performance'
  })
  
  if (e2) console.error('Error:', e2)
  else console.log('✅ Added')
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Final check
  const { data: final, count } = await supabase
    .from('requests')
    .select('id, title, status', { count: 'exact' })
    .eq('project_type', 'creative')
  
  console.log(`\n📊 Final count: ${count}`)
  final?.forEach(r => console.log(`   - ${r.title}`))
}

forceCleanup().catch(console.error)
