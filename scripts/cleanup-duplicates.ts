#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function cleanupDuplicates() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
  )
  
  console.log('🧹 Cleaning up duplicate records...\n')
  
  // Get all creative requests
  const { data: allRecords, error } = await supabase
    .from('requests')
    .select('*')
    .eq('project_type', 'creative')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`Found ${allRecords?.length || 0} creative requests\n`)
  
  // Group by title
  const groups = new Map<string, any[]>()
  allRecords?.forEach(record => {
    const existing = groups.get(record.title) || []
    existing.push(record)
    groups.set(record.title, existing)
  })
  
  // Delete duplicates (keep first one)
  for (const [title, records] of groups) {
    if (records.length > 1) {
      console.log(`Found ${records.length} duplicates of "${title}"`)
      
      // Keep the first, delete the rest
      const toDelete = records.slice(1).map(r => r.id)
      
      const { error: deleteError } = await supabase
        .from('requests')
        .delete()
        .in('id', toDelete)
      
      if (deleteError) {
        console.error(`  ❌ Error deleting: ${deleteError.message}`)
      } else {
        console.log(`  ✅ Deleted ${toDelete.length} duplicate(s)`)
      }
    }
  }
  
  console.log('\n✨ Cleanup complete!')
}

cleanupDuplicates().catch(console.error)
