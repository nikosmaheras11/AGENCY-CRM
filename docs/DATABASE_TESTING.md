# Database Testing Guide

This guide explains how to test your Supabase database functions and schema in your GitHub → Vercel workflow.

## Overview

Your testing setup includes:

1. **Automated Tests**: Run on every push via GitHub Actions
2. **Manual Validation**: Run locally before deploying
3. **Integration Tests**: Test via Supabase API
4. **Migration Validation**: Ensure SQL files are valid

## Quick Start

### Run All Database Tests Locally

```bash
# Validate database schema and functions
pnpm validate-db

# Run integration tests via Supabase API
pnpm test:db
```

### Before Every Commit

```bash
# 1. Validate your database changes
pnpm validate-db

# 2. Run database function tests
pnpm test:db

# 3. Commit and push (triggers GitHub Actions)
git add .
git commit -m "feat: your changes"
git push
```

## Testing Methods

### 1. Manual Validation Script

The `validate-db` script connects to your Supabase database and validates:
- ✅ Core tables exist and are accessible
- ✅ Feature tables (video_versions, timecode_comments, etc.)
- ✅ Database functions work correctly
- ✅ Views are accessible
- ✅ RLS policies are properly configured

**Usage:**

```bash
pnpm validate-db
```

**Output:**
```
🚀 Starting Supabase Database Validation
📍 Connecting to: https://vzhthefdgumjkhnjpydt.supabase.co
============================================================

📊 VALIDATING CORE TABLES
🔍 Validating table: requests
  ✅ Table exists and is accessible

⚙️  VALIDATING DATABASE FUNCTIONS
🔍 Validating function: get_unread_mention_count
  ✅ Function exists and executed successfully

📋 VALIDATION SUMMARY
============================================================
✅ Passed: 16/16
❌ Failed: 0/16
🎉 All validations passed!
```

### 2. Vitest Integration Tests

Run comprehensive tests that validate your database via the Supabase API.

**Usage:**

```bash
# Run database function tests
pnpm test:db

# Run with watch mode for development
pnpm test:db --watch

# Run all tests
pnpm test
```

**What's tested:**
- Schema validation (tables exist)
- Database functions (RPC calls)
- Views (data access)
- RLS policies (security)
- Real-time subscriptions

### 3. GitHub Actions (Automated)

Every push to `supabase/migrations/**` triggers automated validation:

**Workflow checks:**
1. ✅ SQL syntax validation
2. ✅ Migration file naming conventions
3. ✅ Database function tests
4. ✅ Schema integrity checks

**View results:**
- Go to your GitHub repo → Actions tab
- Click on the latest "Database Schema Validation" workflow

### 4. Direct Database Connection

For advanced debugging, connect directly via `psql`:

```bash
# Connect to your Supabase database
psql "postgres://postgres.vzhthefdgumjkhnjpydt:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Test a specific function
SELECT * FROM get_unread_mention_count('user-uuid-here');

# Verify table structure
\d video_versions

# Check RLS policies
\d+ requests
```

## Testing Specific Features

### Video Versioning System

```typescript
// Test in tests/supabase/db-functions.test.ts
it('should support video versioning', async () => {
  const { data, error } = await supabase
    .from('video_versions')
    .select('id, version, video_url, request_id')
    .limit(1)
  
  expect(error).toBeNull()
})
```

### Comment Threading

```typescript
it('should support nested comments', async () => {
  const { data, error } = await supabase
    .from('timecode_comments')
    .select('id, thread_root_id, parent_comment_id')
    .limit(1)
  
  expect(error).toBeNull()
})
```

### Slack Mentions

```typescript
it('should track user mentions', async () => {
  const { data, error } = await supabase
    .rpc('get_unread_mention_count', {
      p_user_id: 'your-user-id'
    })
  
  expect(error).toBeNull()
  expect(typeof data).toBe('number')
})
```

## Migration Testing Workflow

### When Adding New Migrations

1. **Create migration file:**
   ```bash
   # Name format: YYYYMMDDHHmmss_description.sql
   touch supabase/migrations/20250112100000_add_new_feature.sql
   ```

2. **Write your migration:**
   ```sql
   -- supabase/migrations/20250112100000_add_new_feature.sql
   
   BEGIN;
   
   CREATE TABLE IF NOT EXISTS new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     -- your columns
   );
   
   -- Enable RLS
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view their own data"
     ON new_table FOR SELECT
     USING (auth.uid() = user_id);
   
   COMMIT;
   ```

3. **Test locally:**
   ```bash
   # Validate the new schema
   pnpm validate-db
   
   # Run integration tests
   pnpm test:db
   ```

4. **Add tests for new features:**
   ```typescript
   // In tests/supabase/db-functions.test.ts
   
   describe('New Feature', () => {
     it('should have new_table accessible', async () => {
       const { data, error } = await supabase
         .from('new_table')
         .select('id')
         .limit(1)
       
       expect(error?.code).not.toBe('42P01')
     })
   })
   ```

5. **Commit and push:**
   ```bash
   git add supabase/migrations/20250112100000_add_new_feature.sql
   git add tests/supabase/db-functions.test.ts
   git commit -m "feat: add new feature table"
   git push
   ```

6. **GitHub Actions will automatically:**
   - Validate SQL syntax
   - Run your tests
   - Report any failures

## Environment Setup

### Local Testing

Ensure your `.env` has:

```bash
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### GitHub Actions

Set these secrets in GitHub:
1. Go to: Settings → Secrets and variables → Actions
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Vercel

All environment variables are already configured in Vercel dashboard.

## Troubleshooting

### Test Fails: "Table does not exist"

**Cause:** Migration not applied to your Supabase instance

**Solution:**
```bash
# Check if migration file exists
ls supabase/migrations/

# Apply migrations via Supabase dashboard or CLI
# Option 1: Via dashboard (supabase.com) → SQL Editor → paste migration
# Option 2: Use Supabase CLI (if installed)
supabase db push
```

### Test Fails: "Function does not exist"

**Cause:** Database function not created

**Solution:**
1. Check your migration file includes the function definition
2. Verify function is in `supabase/migrations/*.sql`
3. Apply the migration containing the function

### Test Fails: "Insufficient privilege"

**Cause:** RLS policy blocking access

**Solution:**
- This is expected behavior for RLS-protected tables
- The test checks for schema existence, not data access
- Update test to verify table exists, not data access

### GitHub Actions Fails

**Cause:** Missing secrets or invalid environment

**Solution:**
1. Check GitHub Actions logs for specific error
2. Verify secrets are set in GitHub repo settings
3. Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

## Best Practices

### ✅ DO

- Run `pnpm validate-db` before every commit
- Add tests for new database features
- Use transactions in migration files (`BEGIN`/`COMMIT`)
- Name migrations with timestamps: `YYYYMMDDHHmmss_description.sql`
- Test RLS policies thoroughly
- Document complex functions

### ❌ DON'T

- Commit migrations without testing locally
- Drop tables without `IF EXISTS`
- Skip RLS policies on sensitive tables
- Use production database for testing
- Hardcode UUIDs in tests (use dummy UUIDs)

## CI/CD Integration

Your workflow:

```
1. Local Development
   ↓
   pnpm validate-db (✅ local validation)
   ↓
2. Git Push
   ↓
   GitHub Actions (✅ automated tests)
   ↓
3. Vercel Deployment
   ↓
   Staging Environment (✅ live testing)
   ↓
4. Production Deploy
   ↓
   🎉 Live with validated schema
```

## Additional Resources

- [Supabase Testing Docs](https://supabase.com/docs/guides/database/testing)
- [pgTAP Testing](https://pgtap.org/) - PostgreSQL unit testing
- [Vitest Documentation](https://vitest.dev/)
- Project files:
  - `tests/supabase/db-functions.test.ts` - Integration tests
  - `scripts/validate-db.ts` - Manual validation script
  - `.github/workflows/db-validation.yml` - CI/CD workflow

## Quick Reference

```bash
# Local testing
pnpm validate-db              # Validate schema
pnpm test:db                  # Run integration tests
pnpm test:db --watch          # Watch mode for development

# Check logs
tail -f .output/logs/*.log    # Local logs (if applicable)

# Database connection
psql "postgres://postgres.vzhthefdgumjkhnjpydt:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# View GitHub Actions
# https://github.com/YOUR-USERNAME/agency-dashboard-os/actions
```

---

**Questions?** Check `DATABASE_SCHEMA.md` for schema documentation or `WARP.md` for project overview.
