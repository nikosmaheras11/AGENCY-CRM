#!/bin/bash

set -e

echo "🚀 Applying migrations to Supabase database..."
echo ""

# Load environment variables
source .env

# Construct the database URL
DB_URL="postgresql://postgres.vzhthefdgumjkhnjpydt:${SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Check if SUPABASE_DB_PASSWORD is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "❌ Error: SUPABASE_DB_PASSWORD not set in .env"
  echo ""
  echo "To get your database password:"
  echo "1. Go to https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/settings/database"
  echo "2. Copy the 'Database password'"
  echo "3. Add to .env: SUPABASE_DB_PASSWORD=your_password"
  exit 1
fi

# Apply migrations in order
MIGRATIONS=(
  "supabase/migrations/20250110_complete_schema.sql"
  "supabase/migrations/20251111170928_video_versioning.sql"
  "supabase/migrations/20250111_slack_mentions.sql"
  "supabase/migrations/002_asset_viewer_schema.sql"
  "supabase/migrations/003_clean_asset_viewer_setup.sql"
  "supabase/migrations/20250112_add_client_guests.sql"
  "supabase/migrations/20250112_add_description_column.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo "📄 Applying: $migration"
    psql "$DB_URL" -f "$migration" 2>&1 | grep -v "NOTICE:" | grep -v "^$" || true
    echo "✅ Done"
    echo ""
  else
    echo "⚠️  Skipping (not found): $migration"
  fi
done

echo "🎉 All migrations applied successfully!"
echo ""
echo "Verifying tables..."
node list-tables.js
