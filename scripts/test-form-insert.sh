#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="https://vzhthefdgumjkhnjpydt.supabase.co"

echo "Testing insert with exact form field mapping..."
curl -X POST "${SUPABASE_URL}/rest/v1/requests" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Creative Request",
    "description": "Test description",
    "project_type": "creative",
    "status": "new-request",
    "priority": "medium",
    "format": "Facebook",
    "dimensions": "1080x1920",
    "due_date": "2025-10-28",
    "inspiration": "Some inspiration",
    "figma_url": "https://figma.com/test",
    "created_by": "46642f4b-56cf-4cdd-bfe8-95ca30dbcfa7",
    "created_by_name": "Nikos Maheras"
  }' | jq '.'
