#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Supabase Migration Application Script ===${NC}\n"

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found Supabase credentials${NC}\n"

# Extract project ID from URL
PROJECT_ID=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')
echo -e "Project ID: ${YELLOW}${PROJECT_ID}${NC}\n"

echo -e "${YELLOW}📋 Migrations to apply:${NC}"
echo "1. 20250113_enable_realtime_comments.sql"
echo "2. 20250113_create_share_links.sql"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  PLEASE APPLY THESE MIGRATIONS MANUALLY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"
echo ""
echo "2. Copy and paste the contents of these files:"
echo ""
echo -e "${YELLOW}   Migration 1: supabase/migrations/20250113_enable_realtime_comments.sql${NC}"
cat supabase/migrations/20250113_enable_realtime_comments.sql
echo ""
echo -e "${GREEN}   ─────────────────────────────────────────${NC}"
echo ""
echo -e "${YELLOW}   Migration 2: supabase/migrations/20250113_create_share_links.sql${NC}"
cat supabase/migrations/20250113_create_share_links.sql
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "3. Click 'Run' to execute each migration"
echo ""
echo -e "${YELLOW}Verification queries to run after:${NC}"
echo ""
echo "-- Check if video_timestamp column exists:"
echo "SELECT column_name FROM information_schema.columns"
echo "WHERE table_name = 'comments' AND column_name = 'video_timestamp';"
echo ""
echo "-- Check if share_links table exists:"
echo "SELECT table_name FROM information_schema.tables"
echo "WHERE table_name = 'share_links';"
echo ""
echo "-- Check realtime publication:"
echo "SELECT schemaname, tablename FROM pg_publication_tables"
echo "WHERE pubname = 'supabase_realtime' AND tablename IN ('comments', 'share_links');"
echo ""
echo -e "${GREEN}✓ After applying migrations, your features will work!${NC}"
