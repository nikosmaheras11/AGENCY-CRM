#!/bin/bash

# AGENCY-CRM Quick Setup Script
# Run this to get your local development environment configured

set -e

echo "🚀 AGENCY-CRM Setup Script"
echo "================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "✓ .env file already exists"
  echo ""
  echo "⚠️  Warning: .env file found. This script will not overwrite it."
  echo "   If you need to update credentials, edit .env manually."
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
else
  echo "Creating .env file from template..."
  cp .env.example .env
  echo "✓ Created .env file"
  echo ""
fi

# Check if credentials are set
if grep -q "your-project.supabase.co" .env; then
  echo "⚠️  IMPORTANT: You need to add your Supabase credentials!"
  echo ""
  echo "Get them from:"
  echo "  1. https://supabase.com/dashboard → Your Project → Settings → API"
  echo "  2. Or run: vercel env pull .env (if using Vercel)"
  echo ""
  echo "Required values:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_ANON_KEY"
  echo "  - SUPABASE_SERVICE_KEY"
  echo ""

  read -p "Do you want to enter them now? (y/n) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter your Supabase credentials:"
    echo "--------------------------------"

    read -p "SUPABASE_URL: " SUPABASE_URL
    read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    read -p "SUPABASE_SERVICE_KEY: " SUPABASE_SERVICE_KEY

    # Update .env file
    sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    sed -i.bak "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY|" .env

    rm .env.bak

    echo ""
    echo "✓ Credentials saved to .env"
  else
    echo ""
    echo "⚠️  Please edit .env file manually and add your credentials"
    echo "   File location: $(pwd)/.env"
  fi
fi

echo ""
echo "================================"
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Verify .env has correct Supabase credentials"
echo "  2. Run: pnpm install (if not done)"
echo "  3. Run: pnpm dev"
echo "  4. Open: http://localhost:3000"
echo ""
echo "Need help? Check docs/CRITICAL_FIXES.md"
echo "================================"
