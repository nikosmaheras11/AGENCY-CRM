#!/usr/bin/env node
/**
 * Keep only two creative requests: Google Ad Brainstorm and RAMS UGC Video
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function keepOnlyTwo() {
  console.log('🔍 Fetching all creative requests...\n')
  
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('project_type', 'creative')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`Found ${data.length} creative requests:\n`)
  
  // Show all
  data.forEach((req, idx) => {
    console.log(`${idx + 1}. "${req.title}" (${req.status}) - ID: ${req.id.substring(0, 8)}...`)
  })
  
  // Find one of each to keep (first occurrence of each title)
  const googleAd = data.find(r => r.title === 'Google Ad Brainstorm')
  const ramsVideo = data.find(r => r.title === 'RAMS UGC Video')
  
  const keepIds = [googleAd?.id, ramsVideo?.id].filter(Boolean)
  const deleteIds = data.filter(r => !keepIds.includes(r.id)).map(r => r.id)
  
  console.log(`\n✅ Keeping:`)
  if (googleAd) console.log(`   - ${googleAd.title} (${googleAd.id.substring(0, 8)}...)`)
  if (ramsVideo) console.log(`   - ${ramsVideo.title} (${ramsVideo.id.substring(0, 8)}...)`)
  
  console.log(`\n🗑️  Deleting ${deleteIds.length} requests...`)
  
  if (deleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .in('id', deleteIds)
    
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError.message)
    } else {
      console.log('✅ Deleted successfully!\n')
      
      // Verify
      const { data: remaining } = await supabase
        .from('requests')
        .select('*')
        .eq('project_type', 'creative')
      
      console.log(`📊 Creative requests remaining: ${remaining?.length || 0}`)
      remaining?.forEach(r => console.log(`   - ${r.title}`))
    }
  }
}

keepOnlyTwo().catch(console.error)
