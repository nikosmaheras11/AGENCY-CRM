#!/bin/bash

# Apply SQL migration via Supabase REST API
# Usage: ./scripts/apply-migration.sh <migration-file.sql>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <migration-file.sql>"
  echo "Example: $0 supabase/migrations/20250112_add_description_column.sql"
  exit 1
fi

MIGRATION_FILE="$1"
PROJECT_REF="vzhthefdgumjkhnjpydt"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# Get the anon key from environment or .env file
if [ -z "$SUPABASE_ANON_KEY" ]; then
  if [ -f ".env" ]; then
    export $(grep SUPABASE_ANON_KEY .env | xargs)
  fi
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: SUPABASE_ANON_KEY not found in environment or .env file"
  exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Applying migration: $MIGRATION_FILE"
echo "Project: $PROJECT_REF"
echo ""

# Read the SQL file
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Execute via PostgREST (requires service role key for DDL)
# Note: This requires SUPABASE_SERVICE_KEY for schema changes
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_KEY required for schema migrations"
  echo "Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
  exit 1
fi

# Use the SQL Editor API endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✓ Migration applied successfully!"
else
  echo "✗ Migration failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi
