#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="https://vzhthefdgumjkhnjpydt.supabase.co"

echo "Checking requests table schema..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '\''requests'\'' ORDER BY ordinal_position;"
  }' | jq '.'
