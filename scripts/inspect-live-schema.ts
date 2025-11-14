#!/usr/bin/env tsx
/**
 * Inspect Live Supabase Schema
 * Queries the current database schema to see all tables, columns, and relationships
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function inspectSchema() {
  console.log('🔍 Inspecting Live Supabase Schema...\n')
  console.log(`📍 Database: ${SUPABASE_URL}\n`)

  try {
    // Query information_schema to get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            table_name,
            table_type
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })
      .catch(async () => {
        // Fallback: use direct query
        return await supabase
          .from('information_schema.tables')
          .select('table_name, table_type')
          .eq('table_schema', 'public')
          .eq('table_type', 'BASE TABLE')
          .order('table_name')
      })

    if (tablesError) {
      console.log('⚠️  Using alternative schema inspection method...\n')

      // Try to list tables by querying pg_catalog
      const { data: pgTables, error: pgError } = await supabase
        .rpc('get_schema_info')
        .catch(() => ({ data: null, error: null }))

      if (pgError || !pgTables) {
        // Manual list of known tables from CLAUDE.md
        const knownTables = [
          'profiles', 'clients', 'requests', 'assets', 'comments',
          'video_versions', 'timecode_comments', 'tags', 'request_tags',
          'performance_metrics', 'project_tasks', 'automation_rules',
          'activity_log', 'archived_activity_log', 'slack_connected_channels',
          'slack_messages', 'user_mentions', 'share_links'
        ]

        console.log('📋 Checking known tables from documentation:\n')

        for (const tableName of knownTables) {
          // Try to query each table to see if it exists
          const { error: tableError, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

          if (!tableError) {
            console.log(`✅ ${tableName} (${count ?? 0} rows)`)
          } else {
            console.log(`❌ ${tableName} - ${tableError.message}`)
          }
        }

        console.log('\n📊 Getting detailed schema for existing tables...\n')

        // Get column details for tables that exist
        for (const tableName of knownTables) {
          const { error: tableError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

          if (!tableError) {
            await inspectTable(tableName)
          }
        }

        return
      }
    }

    if (tables && tables.length > 0) {
      console.log(`📊 Found ${tables.length} tables:\n`)

      for (const table of tables) {
        console.log(`✅ ${table.table_name}`)
      }

      console.log('\n' + '='.repeat(80) + '\n')

      // Get details for each table
      for (const table of tables) {
        await inspectTable(table.table_name)
      }
    } else {
      console.log('⚠️  No tables found or unable to query information_schema')
    }

  } catch (error) {
    console.error('❌ Error inspecting schema:', error)
  }
}

async function inspectTable(tableName: string) {
  console.log(`\n📋 Table: ${tableName}`)
  console.log('─'.repeat(80))

  try {
    // Get a sample row to understand the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (sampleError) {
      console.log(`   ⚠️  Cannot query table: ${sampleError.message}`)
      return
    }

    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`   📊 Row count: ${count ?? 0}`)
    }

    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0])
      console.log(`   📝 Columns (${columns.length}):`)

      columns.forEach(col => {
        const value = sampleData[0][col]
        const type = value === null ? 'null' : typeof value
        console.log(`      • ${col} (${type})`)
      })
    } else {
      console.log('   📝 Table is empty - cannot infer column structure')
    }

    // Check if table has RLS enabled
    const { data: rlsData } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT relrowsecurity
          FROM pg_class
          WHERE relname = '${tableName}'
          AND relnamespace = 'public'::regnamespace;
        `
      })
      .catch(() => ({ data: null }))

    if (rlsData) {
      console.log(`   🔒 RLS: ${rlsData[0]?.relrowsecurity ? 'Enabled' : 'Disabled'}`)
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
  }
}

// Check for Real-time enabled tables
async function checkRealtimeEnabled() {
  console.log('\n' + '='.repeat(80))
  console.log('\n⚡ Real-time Enabled Tables:\n')

  const realTimeTables = [
    'requests', 'assets', 'comments', 'video_versions',
    'timecode_comments', 'project_tasks', 'share_links'
  ]

  for (const table of realTimeTables) {
    const { error } = await supabase
      .from(table)
      .select('*', { head: true })

    if (!error) {
      console.log(`   ✅ ${table}`)
    }
  }
}

// Main execution
inspectSchema()
  .then(() => checkRealtimeEnabled())
  .then(() => {
    console.log('\n' + '='.repeat(80))
    console.log('\n✨ Schema inspection complete!\n')
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
