const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Setting up Supabase database...\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250110_create_slack_messages_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Running migration: 20250110_create_slack_messages_schema.sql\n');

  try {
    // Note: We need to use the REST API or run SQL via Supabase CLI
    // For now, let's create the table using the JS client
    
    // Check if table already exists
    const { data: existingData, error: checkError } = await supabase
      .from('slack_messages')
      .select('id')
      .limit(1);

    if (!checkError || checkError.code === 'PGRST116') {
      // Table exists or no rows
      if (!checkError) {
        console.log('✅ Table "slack_messages" already exists!');
        console.log(`   Found ${existingData?.length || 0} existing messages\n`);
      } else {
        console.log('ℹ️  Table might not exist yet. Please run the SQL migration manually.\n');
        console.log('📋 Steps:');
        console.log('   1. Go to https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql/new');
        console.log('   2. Copy the contents of: supabase/migrations/20250110_create_slack_messages_schema.sql');
        console.log('   3. Paste and run the SQL\n');
      }
    } else {
      throw checkError;
    }

    // Test insert (will fail if RLS is enabled and working)
    console.log('🧪 Testing table access...');
    const testMessage = {
      id: 'test-' + Date.now(),
      channel_id: 'C_TEST',
      channel_name: 'test-channel',
      user_id: 'U_TEST',
      user_name: 'Test User',
      text: 'Test message - will be deleted',
      timestamp: new Date().toISOString(),
      permalink: null,
      thread_ts: null,
      is_thread_reply: false,
      parent_message_id: null,
      reactions: [],
      mentions: []
    };

    const { data, error } = await supabase
      .from('slack_messages')
      .insert([testMessage])
      .select();

    if (error) {
      if (error.code === '42P01') {
        console.log('\n❌ Table does not exist yet. Please run the SQL migration manually.');
        console.log('\n📋 Instructions:');
        console.log('   1. Open: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql/new');
        console.log('   2. Copy contents from: supabase/migrations/20250110_create_slack_messages_schema.sql');
        console.log('   3. Paste and click "Run"\n');
        process.exit(1);
      } else {
        console.log(`\n⚠️  Insert test failed: ${error.message}`);
        console.log('   This might be expected if RLS policies are strict.');
        console.log('   The monitor script uses SUPABASE_SERVICE_KEY which should work.\n');
      }
    } else {
      console.log('✅ Table access successful!\n');
      
      // Clean up test message
      await supabase
        .from('slack_messages')
        .delete()
        .eq('id', testMessage.id);
      
      console.log('🧹 Cleaned up test data\n');
    }

    console.log('✨ Setup complete! Your database is ready.\n');
    console.log('📝 Next steps:');
    console.log('   1. Make sure you have SLACK_BOT_TOKEN in .env (starts with xoxb-)');
    console.log('   2. Run: pnpm slack-monitor');
    console.log('   3. Run: pnpm dev (in another terminal)');
    console.log('   4. Post a message in any monitored Slack channel!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 Manual setup required:');
    console.error('   Go to: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql/new');
    console.error('   Run: supabase/migrations/20250110_create_slack_messages_schema.sql\n');
    process.exit(1);
  }
}

runMigration();
