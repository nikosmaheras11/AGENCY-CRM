#!/usr/bin/env node

/**
 * Script to verify database schema against Supabase
 * Run: node scripts/verify-schema.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://vzhthefdgumjkhnjpydt.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Expected tables from our schema documentation
const expectedTables = [
  'profiles',
  'clients',
  'requests',
  'assets',
  'comments',
  'video_assets',
  'video_versions',
  'timecode_comments',
  'comment_mentions',
  'comment_notifications',
  'video_playback_sessions',
  'slack_messages',
  'user_mentions',
  'slack_connected_channels',
  'slack_message_requests',
  'slack_comment_threads',
  'performance_metrics',
  'platform_connections',
  'metric_sync_logs',
  'tags',
  'request_tags',
  'project_tasks',
  'automation_rule_templates',
  'automation_rules',
  'notification_config',
  'notification_queue',
  'status_history',
  'activity_log',
  'archived_activity_log',
  'retention_policies'
]

async function verifySchema() {
  console.log('🔍 Verifying Supabase Schema...\n')
  
  const results = {
    existing: [],
    missing: [],
    accessible: []
  }
  
  for (const table of expectedTables) {
    try {
      // Try to query the table (just count, no data)
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          results.missing.push(table)
          console.log(`❌ ${table} - Does not exist`)
        } else if (error.message.includes('permission denied') || error.code === '42501') {
          results.existing.push(table)
          console.log(`⚠️  ${table} - Exists but no RLS access (expected for some tables)`)
        } else {
          results.existing.push(table)
          console.log(`⚠️  ${table} - Exists with error: ${error.message}`)
        }
      } else {
        results.accessible.push(table)
        console.log(`✅ ${table} - Accessible (${count ?? 0} rows)`)
      }
    } catch (err) {
      results.missing.push(table)
      console.log(`❌ ${table} - Error: ${err.message}`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log('='.repeat(60))
  console.log(`✅ Accessible tables: ${results.accessible.length}`)
  console.log(`⚠️  Existing (no access): ${results.existing.length}`)
  console.log(`❌ Missing tables: ${results.missing.length}`)
  console.log(`📋 Total expected: ${expectedTables.length}`)
  
  if (results.missing.length > 0) {
    console.log('\n🔧 Missing Tables (need migration):')
    results.missing.forEach(table => console.log(`   - ${table}`))
  }
  
  console.log('\n💡 Note: Some tables may exist but require RLS policies to be accessible.')
  console.log('   Check Supabase Dashboard → Database → Tables for full list.')
}

verifySchema().catch(console.error)
