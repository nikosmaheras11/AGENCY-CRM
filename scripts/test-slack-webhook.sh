#!/bin/bash

# Script to test Slack webhook locally
# Usage: ./scripts/test-slack-webhook.sh

set -e

echo "🚀 Testing Slack Webhook Integration..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi

# Source .env
export $(cat .env | grep -v '^#' | xargs)

# Check required variables
if [ -z "$SLACK_SIGNING_SECRET" ]; then
    echo "❌ SLACK_SIGNING_SECRET not set in .env"
    exit 1
fi

if [ -z "$DIRECTUS_URL" ]; then
    echo "❌ DIRECTUS_URL not set in .env"
    exit 1
fi

if [ -z "$DIRECTUS_SERVER_TOKEN" ]; then
    echo "❌ DIRECTUS_SERVER_TOKEN not set in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Check if Directus is running
echo "🔍 Checking if Directus is running..."
if curl -s "$DIRECTUS_URL/server/health" > /dev/null; then
    echo "✅ Directus is running at $DIRECTUS_URL"
else
    echo "❌ Directus is not accessible at $DIRECTUS_URL"
    echo "Start it with: docker-compose up -d"
    exit 1
fi
echo ""

# Check if slack_messages collection exists
echo "🔍 Checking if slack_messages collection exists..."
COLLECTION_CHECK=$(curl -s -H "Authorization: Bearer $DIRECTUS_SERVER_TOKEN" \
    "$DIRECTUS_URL/collections/slack_messages" | grep -c "slack_messages" || true)

if [ "$COLLECTION_CHECK" -gt 0 ]; then
    echo "✅ slack_messages collection exists"
else
    echo "❌ slack_messages collection not found"
    echo "Create it with: cd directus && npx directus schema apply ../directus/snapshots/slack_messages_collection.yaml"
    exit 1
fi
echo ""

# Check if server is running
echo "🔍 Checking if Nuxt server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Nuxt server is running at http://localhost:3000"
else
    echo "❌ Nuxt server is not running"
    echo "Start it with: pnpm dev"
    exit 1
fi
echo ""

echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "1. Install ngrok: brew install ngrok"
echo "2. Expose webhook: ngrok http 3000"
echo "3. Copy ngrok URL and update Slack Event Subscriptions"
echo "4. Invite bot to your Slack channels"
echo "5. Post a test message in one of the monitored channels"
echo ""
echo "Monitored channels (from .env):"
[ -n "$SLACK_CHANNEL_CREATIVE" ] && echo "  - Creative: $SLACK_CHANNEL_CREATIVE"
[ -n "$SLACK_CHANNEL_PERFORMANCE" ] && echo "  - Performance: $SLACK_CHANNEL_PERFORMANCE"
[ -n "$SLACK_CHANNEL_REQUESTS" ] && echo "  - Requests: $SLACK_CHANNEL_REQUESTS"
[ -n "$SLACK_CHANNEL_UGC" ] && echo "  - UGC: $SLACK_CHANNEL_UGC"
echo ""
echo "📚 Full setup guide: docs/SLACK_SETUP.md"
