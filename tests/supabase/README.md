# Supabase Database Tests

This directory contains integration tests for the Supabase database schema, functions, and features.

## Test Files

- `db-functions.test.ts` - Main integration tests for database schema, functions, and views

## Running Tests

```bash
# Run all Supabase tests
pnpm test:db

# Run in watch mode (for development)
pnpm test:db --watch

# Run with coverage
pnpm test:coverage tests/supabase
```

## What's Tested

### Schema Validation
- Core tables (requests, clients, profiles, assets, comments)
- Feature tables (video_versions, timecode_comments, slack_messages, user_mentions)
- Table accessibility and RLS policies

### Database Functions
- `get_unread_mention_count()` - User mention counting
- Any custom PostgreSQL functions

### Views
- `user_mention_details` - Aggregated mention data

### Real-time Features
- Real-time subscriptions on critical tables
- WebSocket connections

## Adding New Tests

When you add new database features, add corresponding tests:

```typescript
describe('Your New Feature', () => {
  it('should have your_new_table accessible', async () => {
    const { data, error } = await supabase
      .from('your_new_table')
      .select('id')
      .limit(1)
    
    expect(error?.code).not.toBe('42P01') // Table exists
  })
  
  it('should have your_new_function working', async () => {
    const { data, error } = await supabase
      .rpc('your_new_function', { param: 'value' })
    
    expect(error?.message).not.toContain('does not exist')
  })
})
```

## Environment Variables

Tests require:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key

These are automatically loaded from `.env` file.

## CI/CD Integration

These tests run automatically on:
- Every push to `supabase/migrations/**`
- Pull requests affecting database code
- Manual workflow triggers

See `.github/workflows/db-validation.yml` for the CI configuration.

## Troubleshooting

### Tests fail with "Table does not exist"
- Ensure migrations are applied to your Supabase instance
- Check `supabase/migrations/` for the migration file
- Apply via Supabase dashboard or CLI

### Tests fail with RLS errors
- This is expected for authenticated-only tables
- Tests verify schema existence, not data access
- Check that RLS policies are properly configured

### Connection errors
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Check network connectivity
- Ensure Supabase project is running

## Related Documentation

- [DATABASE_TESTING.md](../../docs/DATABASE_TESTING.md) - Complete testing guide
- [DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) - Schema documentation
- [WARP.md](../../WARP.md) - Project overview

## Quick Commands

```bash
# Validate schema before testing
pnpm validate-db

# Run tests
pnpm test:db

# Debug specific test
pnpm test:db -t "video versioning"

# Run with verbose output
pnpm test:db --reporter=verbose
```
