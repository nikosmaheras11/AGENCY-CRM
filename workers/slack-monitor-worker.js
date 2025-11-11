import { App } from '@slack/bolt';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create Slack app with Socket Mode for real-time message monitoring
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true, // Enable Socket Mode for real-time events
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

/**
 * Extract Slack user mentions from message text
 * @param {string} text - Message text
 * @returns {string[]} Array of Slack user IDs
 */
function extractMentions(text) {
  if (!text) return [];
  
  const mentions = [];
  const regex = /<@([A-Z0-9]+)>/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}

/**
 * Store message in Supabase and create mention records
 * @param {Object} message - Formatted message object
 * @param {string[]} mentions - Array of mentioned user Slack IDs
 */
async function storeMessage(message, mentions) {
  try {
    // Insert or update the message
    const { data: messageData, error: messageError } = await supabase
      .from('slack_messages')
      .upsert(message, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error storing message:', messageError);
      throw messageError;
    }
    
    console.log(`✅ Stored message ${message.id} in #${message.channel_name}`);
    
    // Create mention records for each mentioned user
    if (mentions.length > 0) {
      // First, check which users exist in our profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('slack_id')
        .in('slack_id', mentions);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
      
      const validSlackIds = profiles.map(p => p.slack_id);
      
      if (validSlackIds.length === 0) {
        console.log('⚠️ No mentioned users found in profiles table');
        return;
      }
      
      const mentionRecords = validSlackIds.map(slackId => ({
        message_id: message.id,
        user_slack_id: slackId,
        is_read: false
      }));
      
      const { data: mentionData, error: mentionError } = await supabase
        .from('user_mentions')
        .upsert(mentionRecords, {
          onConflict: 'message_id,user_slack_id',
          ignoreDuplicates: true
        });
      
      if (mentionError) {
        console.error('Error creating mentions:', mentionError);
      } else {
        console.log(`✅ Created ${validSlackIds.length} mention(s) for message ${message.id}`);
      }
    }
    
    return messageData;
    
  } catch (error) {
    console.error('Error in storeMessage:', error);
    throw error;
  }
}

/**
 * Process a Slack message and store it if it contains mentions
 */
async function processMessage(message, client) {
  try {
    // Skip messages without text or from bots
    if (!message.text || message.subtype === 'bot_message') {
      return;
    }
    
    // Extract mentions from the message
    const mentions = extractMentions(message.text);
    
    // Skip if no mentions found
    if (mentions.length === 0) {
      return;
    }
    
    console.log(`📨 Processing message with ${mentions.length} mention(s)...`);
    
    // Get user info from Slack
    let userInfo;
    try {
      const userResponse = await client.users.info({ user: message.user });
      userInfo = userResponse.user;
    } catch (error) {
      console.error('Error fetching user info:', error);
      userInfo = {
        real_name: 'Unknown User',
        name: message.user
      };
    }
    
    // Get channel info from Slack
    let channelInfo;
    try {
      const channelResponse = await client.conversations.info({ 
        channel: message.channel 
      });
      channelInfo = channelResponse.channel;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      channelInfo = {
        name: 'unknown-channel',
        id: message.channel
      };
    }
    
    // Get permalink to the message
    let permalink;
    try {
      const permalinkResponse = await client.chat.getPermalink({
        channel: message.channel,
        message_ts: message.ts
      });
      permalink = permalinkResponse.permalink;
    } catch (error) {
      console.error('Error fetching permalink:', error);
      permalink = null;
    }
    
    // Format message for database
    const formattedMessage = {
      id: message.ts,
      channel_id: message.channel,
      channel_name: channelInfo.name || 'unknown',
      user_id: message.user,
      user_name: userInfo.real_name || userInfo.name || 'Unknown',
      text: message.text,
      timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
      permalink: permalink,
      thread_ts: message.thread_ts || null,
      is_thread_reply: !!message.thread_ts,
      parent_message_id: message.thread_ts || null,
      reactions: message.reactions || [],
      mentions: mentions
    };
    
    // Store the message and create mentions
    await storeMessage(formattedMessage, mentions);
    
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

// Listen for all messages in channels the bot has access to
app.message(async ({ message, client }) => {
  await processMessage(message, client);
});

// Listen for messages in threads
app.event('message', async ({ event, client }) => {
  if (event.thread_ts) {
    await processMessage(event, client);
  }
});

// Handle reaction added events to update stored messages
app.event('reaction_added', async ({ event, client }) => {
  try {
    const { item } = event;
    
    if (item.type !== 'message') return;
    
    // Fetch the message from database
    const { data: message, error } = await supabase
      .from('slack_messages')
      .select('reactions')
      .eq('id', item.ts)
      .single();
    
    if (error || !message) return;
    
    // Update reactions
    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.name === event.reaction);
    
    if (existingReaction) {
      existingReaction.count = (existingReaction.count || 0) + 1;
      if (!existingReaction.users) existingReaction.users = [];
      if (!existingReaction.users.includes(event.user)) {
        existingReaction.users.push(event.user);
      }
    } else {
      reactions.push({
        name: event.reaction,
        count: 1,
        users: [event.user]
      });
    }
    
    // Update in database
    await supabase
      .from('slack_messages')
      .update({ reactions })
      .eq('id', item.ts);
    
    console.log(`✅ Updated reaction for message ${item.ts}`);
    
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
});

// Handle reaction removed events
app.event('reaction_removed', async ({ event, client }) => {
  try {
    const { item } = event;
    
    if (item.type !== 'message') return;
    
    // Fetch the message from database
    const { data: message, error } = await supabase
      .from('slack_messages')
      .select('reactions')
      .eq('id', item.ts)
      .single();
    
    if (error || !message) return;
    
    // Update reactions
    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.name === event.reaction);
    
    if (existingReaction) {
      existingReaction.count = Math.max(0, (existingReaction.count || 1) - 1);
      if (existingReaction.users) {
        existingReaction.users = existingReaction.users.filter(u => u !== event.user);
      }
      
      // Remove reaction if count is 0
      if (existingReaction.count === 0) {
        const index = reactions.indexOf(existingReaction);
        reactions.splice(index, 1);
      }
    }
    
    // Update in database
    await supabase
      .from('slack_messages')
      .update({ reactions })
      .eq('id', item.ts);
    
    console.log(`✅ Removed reaction from message ${item.ts}`);
    
  } catch (error) {
    console.error('Error handling reaction removal:', error);
  }
});

// Error handler
app.error(async (error) => {
  console.error('⚠️ Slack app error:', error);
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack Message Monitor is running!');
    console.log('📨 Monitoring mentions in all accessible channels');
    console.log('🔗 Connected to Supabase');
  } catch (error) {
    console.error('Failed to start Slack monitor:', error);
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Slack monitor...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Slack monitor...');
  await app.stop();
  process.exit(0);
});
