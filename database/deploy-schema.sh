#!/bin/bash

# Deploy video versioning schema to Supabase
# This uses the Supabase Management API

PROJECT_REF="vzhthefdgumjkhnjpydt"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHRoZWZkZ3VtamtobmpweWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcyOTEwMSwiZXhwIjoyMDc4MzA1MTAxfQ.gBeDXQNj_w5jrwONIa8fNvRNJ6OZGWJhUhk3Gszaqqc"

echo "🚀 Deploying video versioning schema..."
echo ""
echo "Please go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
echo "Copy and paste the contents of video-versioning-schema.sql into the SQL editor"
echo "Then click 'Run' to execute it."
echo ""
echo "Alternatively, if you have database access credentials:"
echo "psql YOUR_CONNECTION_STRING < video-versioning-schema.sql"
