#!/usr/bin/env node
/**
 * Comprehensive Live Schema Inspector
 * Shows current state of all tables in Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vzhthefdgumjkhnjpydt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHRoZWZkZ3VtamtobmpweWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjkxMDEsImV4cCI6MjA3ODMwNTEwMX0.qkQ0n37EOdgMhyETSoWqQHWIK0Fr4LqaPoAVmXBepdI'

const EXPECTED_TABLES = [
  'profiles',
  'clients',
  'requests',
  'assets',
  'comments',
  'video_versions',
  'timecode_comments',
  'tags',
  'request_tags',
  'performance_metrics',
  'project_tasks',
  'automation_rules',
  'activity_log',
  'archived_activity_log',
  'slack_connected_channels',
  'slack_messages',
  'user_mentions',
  'share_links'
]

const REALTIME_TABLES = [
  'requests',
  'assets',
  'comments',
  'video_versions',
  'timecode_comments',
  'project_tasks',
  'share_links'
]

async function inspectSchema() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Inspecting Live Supabase Schema')
  console.log('=' .repeat(80))
  console.log(`\n📍 Database: ${supabaseUrl}\n`)

  const tableResults = []

  // Check each table
  for (const tableName of EXPECTED_TABLES) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        tableResults.push({
          name: tableName,
          exists: false,
          error: error.message,
          count: 0
        })
      } else {
        tableResults.push({
          name: tableName,
          exists: true,
          count: count || 0
        })
      }
    } catch (err) {
      tableResults.push({
        name: tableName,
        exists: false,
        error: err.message,
        count: 0
      })
    }
  }

  // Display results
  console.log('📊 Table Status:\n')

  const existingTables = tableResults.filter(t => t.exists)
  const missingTables = tableResults.filter(t => !t.exists)

  console.log(`✅ Existing Tables (${existingTables.length}/${EXPECTED_TABLES.length}):\n`)

  existingTables.forEach(table => {
    const isRealtime = REALTIME_TABLES.includes(table.name)
    const realtimeIcon = isRealtime ? '⚡' : '  '
    console.log(`   ${realtimeIcon} ${table.name.padEnd(30)} ${String(table.count).padStart(6)} rows`)
  })

  if (missingTables.length > 0) {
    console.log(`\n❌ Missing Tables (${missingTables.length}):\n`)
    missingTables.forEach(table => {
      console.log(`   ✗ ${table.name}`)
      if (table.error) {
        console.log(`     Error: ${table.error}`)
      }
    })
  }

  // Check storage buckets
  console.log('\n' + '─'.repeat(80))
  console.log('\n🗄️  Storage Buckets:\n')

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.log(`   ❌ Error listing buckets: ${bucketsError.message}`)
  } else if (buckets && buckets.length > 0) {
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name.padEnd(30)} (${bucket.public ? 'public' : 'private'})`)
    })
  } else {
    console.log('   ⚠️  No storage buckets found')
  }

  // Get detailed info for key tables
  console.log('\n' + '─'.repeat(80))
  console.log('\n📋 Detailed Table Information:\n')

  // Requests table
  await inspectTable(supabase, 'requests')

  // Assets table
  await inspectTable(supabase, 'assets')

  // Comments table
  await inspectTable(supabase, 'comments')

  // Video versions table
  await inspectTable(supabase, 'video_versions')

  // Profiles table
  await inspectTable(supabase, 'profiles')

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Schema inspection complete!\n')
}

async function inspectTable(supabase, tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (error) {
    console.log(`\n❌ ${tableName}: Cannot query - ${error.message}`)
    return
  }

  console.log(`\n📋 ${tableName}:`)

  if (data && data.length > 0) {
    const columns = Object.keys(data[0])
    console.log(`   Columns (${columns.length}):`)

    // Group columns by type
    const pkColumns = columns.filter(c => c === 'id')
    const fkColumns = columns.filter(c => c.endsWith('_id') && c !== 'id')
    const timestampColumns = columns.filter(c => c.includes('_at') || c.includes('timestamp'))
    const dataColumns = columns.filter(c =>
      !pkColumns.includes(c) &&
      !fkColumns.includes(c) &&
      !timestampColumns.includes(c)
    )

    if (pkColumns.length > 0) {
      console.log(`   🔑 Primary: ${pkColumns.join(', ')}`)
    }

    if (fkColumns.length > 0) {
      console.log(`   🔗 Foreign Keys: ${fkColumns.join(', ')}`)
    }

    if (dataColumns.length > 0) {
      console.log(`   📝 Data: ${dataColumns.join(', ')}`)
    }

    if (timestampColumns.length > 0) {
      console.log(`   ⏰ Timestamps: ${timestampColumns.join(', ')}`)
    }

    // Get row count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    console.log(`   📊 Rows: ${count || 0}`)

  } else {
    console.log('   ⚠️  Table is empty')
  }
}

inspectSchema().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
