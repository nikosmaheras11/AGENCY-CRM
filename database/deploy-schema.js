#!/usr/bin/env node

/**
 * Deploy video versioning schema to Supabase
 * This uses the Supabase JavaScript client to execute SQL
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vzhthefdgumjkhnjpydt.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHRoZWZkZ3VtamtobmpweWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcyOTEwMSwiZXhwIjoyMDc4MzA1MTAxfQ.gBeDXQNj_w5jrwONIa8fNvRNJ6OZGWJhUhk3Gszaqqc';

// Read the SQL file
const sqlFile = path.join(__dirname, 'video-versioning-schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Split into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`📁 Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
async function executeSQL(statement, index) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: statement })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Statement ${index + 1} failed:`, error);
      return false;
    }

    console.log(`✅ Statement ${index + 1} executed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing statement ${index + 1}:`, error.message);
    return false;
  }
}

async function deploy() {
  console.log('🚀 Starting deployment...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const success = await executeSQL(statements[i], i);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Deployment complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All tables and functions created successfully!');
  } else {
    console.log('\n⚠️  Some statements failed. Please check the errors above.');
  }
}

deploy().catch(console.error);
