#!/bin/bash
# Script to add GitHub secrets for Supabase
# Run: ./scripts/setup-github-secrets.sh

set -e

echo "🔐 Setting up GitHub Secrets for Supabase..."
echo ""

# Check if gh CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    echo ""
    exit 1
fi

# Read secrets from .env
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

SUPABASE_URL=$(grep "^SUPABASE_URL=" .env | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file"
    exit 1
fi

echo "📝 Adding secrets to GitHub repository..."
echo ""

# Add SUPABASE_URL
echo "Adding SUPABASE_URL..."
gh secret set SUPABASE_URL --body "$SUPABASE_URL"

# Add SUPABASE_ANON_KEY
echo "Adding SUPABASE_ANON_KEY..."
gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"

echo ""
echo "✅ GitHub secrets added successfully!"
echo ""
echo "You can verify by running:"
echo "  gh secret list"
echo ""
echo "Or view in GitHub:"
echo "  Settings → Secrets and variables → Actions"
