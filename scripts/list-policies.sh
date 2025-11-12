#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="https://vzhthefdgumjkhnjpydt.supabase.co"

echo "Listing RLS policies on requests table..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = '\''requests'\'';"
  }'
