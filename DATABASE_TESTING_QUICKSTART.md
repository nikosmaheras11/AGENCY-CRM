# Database Testing Quick Start

## ✅ Setup Complete!

Your Supabase database testing infrastructure is now fully configured and ready to use.

## Quick Commands

```bash
# Validate database schema and functions
pnpm validate-db

# Run integration tests
pnpm test:db

# Run tests in watch mode
pnpm test:db --watch

# Run all tests
pnpm test
```

## What Was Set Up

### 1. Manual Validation Script
**File:** `scripts/validate-db.ts`
- Validates all tables, functions, and views
- Connects to your live Supabase instance
- Run: `pnpm validate-db`

### 2. Integration Tests
**File:** `tests/supabase/db-functions.test.ts`
- Vitest-based tests for database features
- Tests schema, functions, views, RLS, and real-time
- Run: `pnpm test:db`

### 3. GitHub Actions Workflow
**File:** `.github/workflows/db-validation.yml`
- Automatic validation on every push
- Validates SQL syntax and migrations
- Runs integration tests in CI

### 4. Documentation
- **`docs/DATABASE_TESTING.md`** - Complete testing guide
- **`tests/supabase/README.md`** - Test directory guide
- **`supabase/tests/db_functions.test.sql`** - SQL-based tests (optional)

## Your Testing Workflow

### Before Every Commit

```bash
# 1. Validate your changes
pnpm validate-db

# 2. Run tests
pnpm test:db

# 3. Commit (triggers GitHub Actions)
git add .
git commit -m "feat: your changes"
git push
```

### When Adding New Migrations

1. Create migration file in `supabase/migrations/`
2. Test locally: `pnpm validate-db`
3. Add tests in `tests/supabase/db-functions.test.ts`
4. Run tests: `pnpm test:db`
5. Commit and push

## First Test Run

Your validation just ran successfully! ✅

Results:
- ✅ All 13 validations passed
- ✅ Core tables accessible
- ✅ Feature tables accessible (RLS-protected)
- ✅ Functions detected
- ✅ Views accessible

Some tables show "restricted access" warnings - this is **normal** and indicates RLS is properly enabled.

## Next Steps

### 1. Set Up GitHub Secrets

For GitHub Actions to work, add these secrets to your repo:
1. Go to: `Settings → Secrets and variables → Actions`
2. Add:
   - `SUPABASE_URL`: `https://vzhthefdgumjkhnjpydt.supabase.co`
   - `SUPABASE_ANON_KEY`: Your anon key from Supabase dashboard

### 2. Test the Workflow

```bash
# Make a small change to trigger GitHub Actions
git commit --allow-empty -m "test: trigger GitHub Actions"
git push

# Then check: https://github.com/YOUR-USERNAME/agency-dashboard-os/actions
```

### 3. Add More Tests

As you build features, add tests to `tests/supabase/db-functions.test.ts`:

```typescript
describe('My New Feature', () => {
  it('should work correctly', async () => {
    const { data, error } = await supabase
      .from('my_new_table')
      .select('*')
      .limit(1)
    
    expect(error).toBeNull()
  })
})
```

## CI/CD Flow

```
Local Development
  ↓
pnpm validate-db ✅
  ↓
Git Push
  ↓
GitHub Actions ✅
  ↓
Vercel Deploy ✅
  ↓
Production 🎉
```

## Common Commands

```bash
# Development
pnpm validate-db              # Validate schema
pnpm test:db                  # Run integration tests
pnpm test:db --watch          # Watch mode

# Database
psql "postgres://postgres.vzhthefdgumjkhnjpydt:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# View logs
pnpm lint                     # Check code quality
pnpm build                    # Test build process
```

## Documentation Links

- 📖 **[Complete Testing Guide](docs/DATABASE_TESTING.md)** - Full documentation
- 📊 **[Database Schema](DATABASE_SCHEMA.md)** - Schema documentation
- 🚀 **[Project Overview](WARP.md)** - Architecture and setup

## Troubleshooting

### Tests fail?
1. Check `.env` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Verify migrations are applied to Supabase
3. See [docs/DATABASE_TESTING.md](docs/DATABASE_TESTING.md) for details

### GitHub Actions fail?
1. Add secrets to GitHub repo settings
2. Check Actions logs for specific errors
3. Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

## Success! 🎉

Your database testing infrastructure is ready. You now have:

- ✅ Local validation script
- ✅ Integration tests with Vitest
- ✅ Automated CI/CD with GitHub Actions
- ✅ Comprehensive documentation

Start building with confidence knowing your database schema is validated on every commit!

---

**Need help?** Check `docs/DATABASE_TESTING.md` for the complete guide.
