const { App } = require('@slack/bolt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Slack setup
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackAppToken = process.env.SLACK_APP_TOKEN;

if (!slackBotToken || !slackAppToken) {
  console.error('❌ Missing Slack credentials in .env file');
  console.error('   Required: SLACK_BOT_TOKEN, SLACK_APP_TOKEN');
  console.error('   Note: SLACK_APP_TOKEN should start with "xapp-"');
  process.exit(1);
}

// Create the Slack app with Socket Mode
const app = new App({
  token: slackBotToken,
  appToken: slackAppToken,
  socketMode: true
});

// Channels to monitor (from environment)
const MONITORED_CHANNELS = {
  [process.env.SLACK_CHANNEL_CREATIVE || '']: 'hours-creative-polymarket',
  [process.env.SLACK_CHANNEL_PERFORMANCE || '']: 'hours-performance-polymarket',
  [process.env.SLACK_CHANNEL_REQUESTS || '']: 'polymarket-creative-requests',
  [process.env.SLACK_CHANNEL_UGC || '']: 'polymarket-ugc-hours'
};

console.log('📡 Slack Monitor Configuration:');
console.log('   Monitored Channels:', Object.values(MONITORED_CHANNELS).join(', '));

// Function to store message in Supabase
async function storeMessage(message) {
  try {
    const { data, error } = await supabase
      .from('slack_messages')
      .insert([message])
      .select();
    
    if (error) {
      // If duplicate, ignore (message already exists)
      if (error.code === '23505') {
        console.log('⏭️  Message already exists, skipping:', message.id);
        return;
      }
      throw error;
    }
    
    console.log('✅ Message stored in Supabase:', {
      id: message.id,
      channel: message.channel_name,
      user: message.user_name,
      text: message.text.substring(0, 50) + '...'
    });
  } catch (error) {
    console.error('❌ Error storing message:', error.message);
  }
}

// Listen for messages
app.message(async ({ message, client }) => {
  // Skip bot messages and system messages
  if (message.subtype === 'bot_message' || message.subtype) {
    return;
  }

  // Check if message is from a monitored channel
  const channelName = MONITORED_CHANNELS[message.channel];
  if (!channelName) {
    return;
  }
  
  try {
    // Get user info
    const userInfo = await client.users.info({ user: message.user });
    
    // Get channel info
    const channelInfo = await client.conversations.info({ channel: message.channel });
    
    // Get permalink
    const permalinkInfo = await client.chat.getPermalink({
      channel: message.channel,
      message_ts: message.ts
    });
    
    // Format the message for Supabase
    const formattedMessage = {
      id: message.ts,
      channel_id: message.channel,
      channel_name: channelInfo.channel.name,
      user_id: message.user,
      user_name: userInfo.user.real_name || userInfo.user.name,
      text: message.text,
      timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
      permalink: permalinkInfo.permalink,
      thread_ts: message.thread_ts || null,
      is_thread_reply: !!message.thread_ts,
      parent_message_id: message.thread_ts || null,
      reactions: message.reactions || []
    };
    
    console.log('\n📨 New message captured:');
    console.log(`   Channel: #${channelInfo.channel.name}`);
    console.log(`   User: ${formattedMessage.user_name}`);
    console.log(`   Text: ${message.text.substring(0, 100)}${message.text.length > 100 ? '...' : ''}`);
    
    // Store in Supabase
    await storeMessage(formattedMessage);
    
  } catch (error) {
    console.error('❌ Error processing message:', error.message);
  }
});

// Handle reactions
app.event('reaction_added', async ({ event, client }) => {
  const channelName = MONITORED_CHANNELS[event.item.channel];
  if (!channelName) {
    return;
  }

  console.log(`\n👍 Reaction added: ${event.reaction} to message ${event.item.ts}`);
  
  // Update message reactions in Supabase
  try {
    const { data: existingMessage, error: fetchError } = await supabase
      .from('slack_messages')
      .select('reactions')
      .eq('id', event.item.ts)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching message for reaction update:', fetchError.message);
      return;
    }

    const reactions = existingMessage.reactions || [];
    reactions.push({
      name: event.reaction,
      user: event.user,
      timestamp: Date.now()
    });

    const { error: updateError } = await supabase
      .from('slack_messages')
      .update({ reactions })
      .eq('id', event.item.ts);

    if (updateError) {
      console.error('❌ Error updating reactions:', updateError.message);
    } else {
      console.log('✅ Reaction updated in database');
    }
  } catch (error) {
    console.error('❌ Error handling reaction:', error.message);
  }
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('\n⚡️ Slack Message Monitor is running!');
    console.log('   Listening for messages in monitored channels...');
    console.log('   Press Ctrl+C to stop\n');
  } catch (error) {
    console.error('❌ Failed to start Slack monitor:', error.message);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down Slack monitor...');
  await app.stop();
  process.exit(0);
});
