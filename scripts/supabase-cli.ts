#!/usr/bin/env tsx
/**
 * Comprehensive Supabase CLI for Database Management
 * Run with: tsx scripts/supabase-cli.ts <command> [options]
 *
 * Features:
 * - Full CRUD operations on all tables
 * - Schema inspection
 * - Real-time monitoring
 * - Comment management
 * - Video versioning
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  console.error('   Please set these in your .env file')
  process.exit(1)
}

// Create client with SERVICE KEY for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

function printTable(data: any[], title?: string) {
  if (title) {
    console.log(`\n📊 ${title}`)
    console.log('='.repeat(80))
  }

  if (!data || data.length === 0) {
    console.log('  (No data)')
    return
  }

  console.table(data)
}

function printJson(data: any, title?: string) {
  if (title) {
    console.log(`\n📄 ${title}`)
    console.log('='.repeat(80))
  }
  console.log(JSON.stringify(data, null, 2))
}

// ============================================
// SCHEMA INSPECTION
// ============================================

async function listTables() {
  console.log('📊 Listing all tables...\n')

  const tables = [
    'profiles', 'clients', 'requests', 'assets', 'comments',
    'video_assets', 'video_versions', 'timecode_comments',
    'slack_messages', 'user_mentions', 'performance_metrics',
    'automation_rules', 'comment_mentions', 'comment_notifications',
    'video_playback_sessions'
  ]

  console.log('Available tables:')
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (!error) {
      console.log(`  ✓ ${table.padEnd(30)} (rows: ${data?.length ?? 0})`)
    } else if (error.code !== '42P01') {
      console.log(`  ✓ ${table.padEnd(30)} (protected by RLS)`)
    } else {
      console.log(`  ✗ ${table.padEnd(30)} (does not exist)`)
    }
  }
}

async function describeTable(tableName: string) {
  console.log(`\n📋 Describing table: ${tableName}\n`)

  // Get a sample row to see columns
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (data && data.length > 0) {
    console.log('Columns:')
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col]
      const type = typeof value
      console.log(`  • ${col.padEnd(30)} (${type})`)
    })

    console.log('\nSample row:')
    printJson(data[0])
  } else {
    console.log('Table is empty. Cannot determine structure.')
  }
}

async function getTableCount(tableName: string) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error(`❌ Error counting ${tableName}:`, error.message)
    return
  }

  console.log(`\n📊 ${tableName}: ${count} rows`)
}

// ============================================
// QUERY OPERATIONS
// ============================================

async function queryTable(tableName: string, limit: number = 10) {
  console.log(`\n🔍 Querying ${tableName} (limit ${limit})...\n`)

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `${tableName} (${data?.length || 0} rows)`)
}

async function findById(tableName: string, id: string) {
  console.log(`\n🔍 Finding ${tableName} by ID: ${id}\n`)

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printJson(data, 'Result')
}

// ============================================
// COMMENT OPERATIONS
// ============================================

async function listComments(requestId?: string) {
  console.log('\n💬 Listing comments...\n')

  let query = supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (requestId) {
    query = query.eq('request_id', requestId)
  }

  const { data, error } = await query.limit(20)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `Comments (${data?.length || 0} rows)`)
}

async function createComment(requestId: string, text: string, options: any = {}) {
  console.log('\n💬 Creating comment...\n')

  const comment = {
    request_id: requestId,
    text,
    author: options.author || 'System',
    author_id: options.authorId || null,
    x_position: options.x || null,
    y_position: options.y || null,
    video_timestamp: options.timestamp || null,
    resolved: false
  }

  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Comment created successfully!')
  printJson(data)
}

async function resolveComment(commentId: string) {
  console.log(`\n✅ Resolving comment ${commentId}...\n`)

  const { data, error } = await supabase
    .from('comments')
    .update({ resolved: true })
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Comment resolved!')
  printJson(data)
}

// ============================================
// REQUEST OPERATIONS
// ============================================

async function listRequests(limit: number = 10) {
  console.log('\n📋 Listing requests...\n')

  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      title,
      project_type,
      status,
      priority,
      assignee,
      created_at,
      client:clients(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `Requests (${data?.length || 0} rows)`)
}

async function createRequest(title: string, projectType: string, options: any = {}) {
  console.log('\n📝 Creating request...\n')

  const request = {
    title,
    project_type: projectType,
    status: options.status || 'new-request',
    priority: options.priority || 'medium',
    description: options.description || null,
    assignee: options.assignee || null,
    client: options.client || null,
    campaign: options.campaign || null
  }

  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Request created successfully!')
  printJson(data)
  return data
}

async function updateRequestStatus(requestId: string, status: string) {
  console.log(`\n🔄 Updating request ${requestId} status to ${status}...\n`)

  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Request updated!')
  printJson(data)
}

// ============================================
// VIDEO VERSIONING OPERATIONS
// ============================================

async function listVideoAssets(limit: number = 10) {
  console.log('\n🎥 Listing video assets...\n')

  const { data, error } = await supabase
    .from('video_assets')
    .select(`
      *,
      current_version:video_versions(version_number, version_label)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `Video Assets (${data?.length || 0} rows)`)
}

async function listVideoVersions(videoAssetId: string) {
  console.log(`\n🎬 Listing versions for video asset ${videoAssetId}...\n`)

  const { data, error } = await supabase
    .from('video_versions')
    .select('*')
    .eq('video_asset_id', videoAssetId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `Video Versions (${data?.length || 0} rows)`)
}

async function listTimecodeComments(videoVersionId: string) {
  console.log(`\n⏱️ Listing timecode comments for version ${videoVersionId}...\n`)

  const { data, error } = await supabase
    .from('timecode_comments')
    .select('*')
    .eq('video_version_id', videoVersionId)
    .order('timecode_seconds', { ascending: true })

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  printTable(data, `Timecode Comments (${data?.length || 0} rows)`)
}

// ============================================
// DATABASE STATS
// ============================================

async function showStats() {
  console.log('\n📊 Database Statistics\n')
  console.log('='.repeat(80))

  const tables = [
    'requests', 'comments', 'clients', 'assets',
    'video_assets', 'video_versions', 'timecode_comments',
    'slack_messages', 'profiles'
  ]

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    console.log(`  ${table.padEnd(30)} ${(count || 0).toString().padStart(6)} rows`)
  }
}

// ============================================
// MAIN CLI
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('🚀 Supabase CLI - Full API Access')
  console.log(`📍 ${supabaseUrl}\n`)

  switch (command) {
    // Schema inspection
    case 'tables':
    case 'list-tables':
      await listTables()
      break

    case 'describe':
      if (!args[1]) {
        console.error('❌ Usage: describe <table-name>')
        break
      }
      await describeTable(args[1])
      break

    case 'count':
      if (!args[1]) {
        console.error('❌ Usage: count <table-name>')
        break
      }
      await getTableCount(args[1])
      break

    case 'stats':
      await showStats()
      break

    // Query operations
    case 'query':
      if (!args[1]) {
        console.error('❌ Usage: query <table-name> [limit]')
        break
      }
      await queryTable(args[1], parseInt(args[2]) || 10)
      break

    case 'find':
      if (!args[1] || !args[2]) {
        console.error('❌ Usage: find <table-name> <id>')
        break
      }
      await findById(args[1], args[2])
      break

    // Comments
    case 'comments':
      await listComments(args[1])
      break

    case 'create-comment':
      if (!args[1] || !args[2]) {
        console.error('❌ Usage: create-comment <request-id> <text>')
        break
      }
      await createComment(args[1], args[2])
      break

    case 'resolve-comment':
      if (!args[1]) {
        console.error('❌ Usage: resolve-comment <comment-id>')
        break
      }
      await resolveComment(args[1])
      break

    // Requests
    case 'requests':
      await listRequests(parseInt(args[1]) || 10)
      break

    case 'create-request':
      if (!args[1] || !args[2]) {
        console.error('❌ Usage: create-request <title> <project-type>')
        break
      }
      await createRequest(args[1], args[2])
      break

    case 'update-status':
      if (!args[1] || !args[2]) {
        console.error('❌ Usage: update-status <request-id> <status>')
        break
      }
      await updateRequestStatus(args[1], args[2])
      break

    // Video versioning
    case 'videos':
      await listVideoAssets(parseInt(args[1]) || 10)
      break

    case 'versions':
      if (!args[1]) {
        console.error('❌ Usage: versions <video-asset-id>')
        break
      }
      await listVideoVersions(args[1])
      break

    case 'timecode-comments':
      if (!args[1]) {
        console.error('❌ Usage: timecode-comments <video-version-id>')
        break
      }
      await listTimecodeComments(args[1])
      break

    default:
      console.log('Available commands:\n')
      console.log('Schema Inspection:')
      console.log('  tables              - List all tables')
      console.log('  describe <table>    - Show table structure')
      console.log('  count <table>       - Count rows in table')
      console.log('  stats               - Show database statistics')
      console.log('')
      console.log('Query Operations:')
      console.log('  query <table> [n]   - Query table (default: 10 rows)')
      console.log('  find <table> <id>   - Find record by ID')
      console.log('')
      console.log('Comments:')
      console.log('  comments [req-id]   - List comments (optionally filtered by request)')
      console.log('  create-comment <request-id> <text> - Create a comment')
      console.log('  resolve-comment <comment-id>       - Mark comment as resolved')
      console.log('')
      console.log('Requests:')
      console.log('  requests [n]                       - List requests (default: 10)')
      console.log('  create-request <title> <type>      - Create a request')
      console.log('  update-status <id> <status>        - Update request status')
      console.log('')
      console.log('Video Versioning:')
      console.log('  videos [n]                         - List video assets')
      console.log('  versions <video-asset-id>          - List video versions')
      console.log('  timecode-comments <version-id>     - List timecode comments')
      console.log('')
      console.log('Examples:')
      console.log('  tsx scripts/supabase-cli.ts tables')
      console.log('  tsx scripts/supabase-cli.ts query requests 5')
      console.log('  tsx scripts/supabase-cli.ts comments')
      console.log('  tsx scripts/supabase-cli.ts stats')
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})
