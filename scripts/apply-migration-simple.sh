#!/bin/bash

# Simple migration script using Supabase SQL endpoint
# Usage: ./scripts/apply-migration-simple.sh <migration-file.sql>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <migration-file.sql>"
  echo "Example: $0 supabase/migrations/20250112_add_description_column.sql"
  exit 1
fi

MIGRATION_FILE="$1"
PROJECT_REF="vzhthefdgumjkhnjpydt"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_KEY not found"
  echo "Add it to your .env file or export it"
  echo "Get it from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
  exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Applying migration: $(basename $MIGRATION_FILE)"
echo "Project: $PROJECT_REF"
echo ""

# Read SQL and escape for JSON
SQL_CONTENT=$(cat "$MIGRATION_FILE" | jq -Rs .)

# Execute using Supabase exec_sql RPC endpoint
HTTP_CODE=$(curl -s -o /tmp/supabase_migration_response.txt -w "%{http_code}" \
  "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: params=single-object" \
  -d "{\"query\": ${SQL_CONTENT}}")

BODY=$(cat /tmp/supabase_migration_response.txt)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo "✓ Migration applied successfully!"
  rm -f /tmp/supabase_migration_response.txt
else
  echo "✗ Migration failed (HTTP $HTTP_CODE)"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  rm -f /tmp/supabase_migration_response.txt
  exit 1
fi
