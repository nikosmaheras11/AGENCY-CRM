#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="https://vzhthefdgumjkhnjpydt.supabase.co"

echo "Testing direct insert to requests table..."
curl -X POST "${SUPABASE_URL}/rest/v1/requests" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Request from Script",
    "project_type": "creative",
    "status": "new-request",
    "priority": "medium",
    "created_by": "46642f4b-56cf-4cdd-bfe8-95ca30dbcfa7"
  }' | jq '.'
