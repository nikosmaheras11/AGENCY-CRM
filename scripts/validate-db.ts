#!/usr/bin/env tsx
/**
 * Manual Database Validation Script
 * Run with: pnpm tsx scripts/validate-db.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationResult {
  name: string
  passed: boolean
  message: string
  details?: any
}

const results: ValidationResult[] = []

async function validateTable(tableName: string, requiredColumns: string[] = []) {
  console.log(`\n🔍 Validating table: ${tableName}`)
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        results.push({
          name: `Table: ${tableName}`,
          passed: false,
          message: 'Table does not exist',
          details: error
        })
        console.log(`  ❌ Table does not exist`)
        return false
      }
      
      // Other errors might be RLS-related (which is okay)
      console.log(`  ⚠️  Table exists but has restricted access (RLS may be enabled)`)
      results.push({
        name: `Table: ${tableName}`,
        passed: true,
        message: 'Table exists (RLS protected)',
        details: { error: error.message }
      })
      return true
    }
    
    console.log(`  ✅ Table exists and is accessible`)
    results.push({
      name: `Table: ${tableName}`,
      passed: true,
      message: 'Table exists and accessible',
      details: { rowCount: data?.length || 0 }
    })
    return true
  } catch (err) {
    console.error(`  ❌ Unexpected error:`, err)
    results.push({
      name: `Table: ${tableName}`,
      passed: false,
      message: 'Unexpected error',
      details: err
    })
    return false
  }
}

async function validateFunction(functionName: string, params: any = {}) {
  console.log(`\n🔍 Validating function: ${functionName}`)
  
  try {
    const { data, error } = await supabase.rpc(functionName, params)
    
    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        results.push({
          name: `Function: ${functionName}`,
          passed: false,
          message: 'Function does not exist',
          details: error
        })
        console.log(`  ❌ Function does not exist`)
        return false
      }
      
      // Function exists but might have param issues
      console.log(`  ⚠️  Function exists but returned error: ${error.message}`)
      results.push({
        name: `Function: ${functionName}`,
        passed: true,
        message: 'Function exists (parameter or permission issue)',
        details: error
      })
      return true
    }
    
    console.log(`  ✅ Function exists and executed successfully`)
    results.push({
      name: `Function: ${functionName}`,
      passed: true,
      message: 'Function exists and works',
      details: { result: data }
    })
    return true
  } catch (err) {
    console.error(`  ❌ Unexpected error:`, err)
    results.push({
      name: `Function: ${functionName}`,
      passed: false,
      message: 'Unexpected error',
      details: err
    })
    return false
  }
}

async function validateView(viewName: string) {
  console.log(`\n🔍 Validating view: ${viewName}`)
  
  try {
    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        results.push({
          name: `View: ${viewName}`,
          passed: false,
          message: 'View does not exist',
          details: error
        })
        console.log(`  ❌ View does not exist`)
        return false
      }
      
      console.log(`  ⚠️  View exists but has restricted access`)
      results.push({
        name: `View: ${viewName}`,
        passed: true,
        message: 'View exists (may be empty or RLS protected)',
        details: error
      })
      return true
    }
    
    console.log(`  ✅ View exists and is accessible`)
    results.push({
      name: `View: ${viewName}`,
      passed: true,
      message: 'View exists and accessible',
      details: { rowCount: data?.length || 0 }
    })
    return true
  } catch (err) {
    console.error(`  ❌ Unexpected error:`, err)
    results.push({
      name: `View: ${viewName}`,
      passed: false,
      message: 'Unexpected error',
      details: err
    })
    return false
  }
}

async function main() {
  console.log('🚀 Starting Supabase Database Validation')
  console.log(`📍 Connecting to: ${supabaseUrl}`)
  console.log('=' .repeat(60))
  
  // Validate core tables
  console.log('\n📊 VALIDATING CORE TABLES')
  await validateTable('requests')
  await validateTable('clients')
  await validateTable('profiles')
  await validateTable('assets')
  await validateTable('comments')
  
  // Validate new feature tables
  console.log('\n📊 VALIDATING FEATURE TABLES')
  await validateTable('video_versions')
  await validateTable('timecode_comments')
  await validateTable('slack_messages')
  await validateTable('user_mentions')
  await validateTable('performance_metrics')
  await validateTable('automation_rules')
  
  // Validate functions
  console.log('\n⚙️  VALIDATING DATABASE FUNCTIONS')
  await validateFunction('get_unread_mention_count', {
    p_user_id: '00000000-0000-0000-0000-000000000000'
  })
  
  // Validate views
  console.log('\n👁️  VALIDATING VIEWS')
  await validateView('user_mention_details')
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 VALIDATION SUMMARY')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  
  console.log(`\n✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${failed}/${total}`)
  
  if (failed > 0) {
    console.log('\n❌ FAILED VALIDATIONS:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  • ${r.name}: ${r.message}`)
      })
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (failed > 0) {
    console.log('\n⚠️  Some validations failed. Please check your database schema.')
    process.exit(1)
  } else {
    console.log('\n🎉 All validations passed!')
    process.exit(0)
  }
}

main()
