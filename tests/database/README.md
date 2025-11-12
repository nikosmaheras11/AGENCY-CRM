# Agency Dashboard OS - Database Unit Tests

Comprehensive unit tests for the Supabase database schema, including tables, triggers, functions, and Row Level Security (RLS) policies.

## Test Coverage

### 1. **Teams Table Schema and Constraints** (`1-teams-table.test.ts`)
- ✅ Verifies teams table exists with correct columns
- ✅ Tests NOT NULL constraint on team name
- ✅ Tests UNIQUE constraint on team name
- ✅ Validates auto-generated UUID for id column
- ✅ Checks auto-populated timestamps (created_at, updated_at)

### 2. **Asset Versions Auto-Increment Trigger** (`2-asset-versioning.test.ts`)
- ✅ Tests initial asset creation with version_number = 1
- ✅ Validates auto-increment when storage_path is updated
- ✅ Verifies previous version's is_current_version is set to false
- ✅ Tests parent_asset_id linking for version history
- ✅ Validates sequential version numbering
- ✅ Tests version_notes preservation

### 3. **Handle New User Function (Auth Trigger)** (`3-handle-new-user.test.ts`)
- ✅ Tests automatic profile creation on user signup
- ✅ Validates default role is set to "user"
- ✅ Checks created_at timestamp population
- ✅ Tests metadata transfer from auth.users to profiles
- ✅ Prevents duplicate profile creation
- ✅ Verifies profile ID matches auth.users ID

### 4. **Row Level Security (RLS) Policies on Profiles** (`4-rls-profiles.test.ts`)
- ✅ Tests SELECT policy (users can view all profiles)
- ✅ Tests UPDATE policy (users can only update own profile)
- ✅ Validates users cannot update other users' profiles
- ✅ Tests multiple field updates
- ✅ Verifies service role key bypasses RLS
- ✅ Tests DELETE restriction (users cannot delete profiles)
- ✅ Confirms RLS is enabled on profiles table

### 5. **Comments Table Hierarchy and Resolution** (`5-comments-hierarchy.test.ts`)
- ✅ Tests parent comment creation without parent_comment_id
- ✅ Tests child comment creation with parent_comment_id reference
- ✅ Validates querying all replies to a parent comment
- ✅ Tests nested replies (grandchild comments)
- ✅ Tests marking comments as resolved/unresolved
- ✅ Validates filtering by resolution status
- ✅ Tests positioned comments with coordinates
- ✅ Tests comments with optional asset_id
- ✅ Validates timestamp tracking (created_at, updated_at)
- ✅ Tests building complete comment thread hierarchy

## Setup

### Prerequisites
- Node.js 18+ installed
- pnpm, npm, or yarn package manager
- Supabase project with service role key

### Installation

1. **Clone or copy these test files to your project**

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your Supabase credentials:**
   ```env
   SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

   > ⚠️ **Important:** Use your **SERVICE ROLE KEY** (not anon key) for tests. This key bypasses RLS and allows full database access for testing purposes.

   You can find your service role key in:
   - Supabase Dashboard → Settings → API → Service role key

## Running Tests

### Run all tests:
```bash
pnpm test
# or
npm test
# or
yarn test
```

### Run a specific test file:
```bash
pnpm test tests/1-teams-table.test.ts
pnpm test tests/2-asset-versioning.test.ts
pnpm test tests/3-handle-new-user.test.ts
pnpm test tests/4-rls-profiles.test.ts
pnpm test tests/5-comments-hierarchy.test.ts
```

### Run tests in watch mode (for development):
```bash
pnpm test:watch
```

### Generate coverage report:
```bash
pnpm test:coverage
```

## Test Structure

Each test file follows this structure:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Test Suite Name', () => {
  beforeAll(async () => {
    // Setup: Create test data
  });

  afterAll(async () => {
    // Cleanup: Remove test data
  });

  test('should do something specific', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/database-tests.yml`:

```yaml
name: Database Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run database tests
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
```

**Add secrets to GitHub:**
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

## Best Practices

### Test Data Cleanup
- All tests clean up after themselves using `afterAll()` or `afterEach()` hooks
- Test data uses unique identifiers (timestamps, UUIDs) to avoid conflicts
- Failed tests may leave data behind - run cleanup manually if needed

### Test Isolation
- Each test should be independent and not rely on data from other tests
- Use `beforeEach()` for setup that needs to run before every test
- Use `beforeAll()` for one-time setup per test suite

### Naming Conventions
- Test files: `<number>-<feature>.test.ts`
- Test descriptions: Use "should" statements (e.g., "should create a user")
- Variables: Use descriptive names with `test` prefix (e.g., `testUserId`)

## Troubleshooting

### Tests failing with "Missing environment variables"
- Ensure `.env` file exists and contains valid credentials
- Check that `.env` is not in `.gitignore` if running locally

### Tests timing out
- Increase timeout in `jest.config.js` (default is 30 seconds)
- Check Supabase connection and API limits

### RLS policy tests failing
- Verify RLS is enabled on tables in Supabase Dashboard
- Check that policies are correctly configured
- Ensure you're using the correct authentication context

### "relation does not exist" errors
- Verify the table exists in your Supabase database
- Run migrations if needed: `supabase db push`
- Check that you're connected to the correct project

## Database Schema Reference

For complete database schema documentation, see:
- `DATABASE_SCHEMA.md` in the main project repository
- Supabase Dashboard → Database → Tables

## Additional Resources

- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Supabase logs in Dashboard → Logs
3. Check test output for detailed error messages

---

**Last Updated:** January 12, 2025
**Test Suite Version:** 1.0.0
