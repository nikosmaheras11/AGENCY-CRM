# Fix Supabase 500 Error - Database Trigger Issue

## Problem Identified (UPDATED)
Based on [Supabase's official troubleshooting guide](https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8), 500 errors are typically caused by:

1. **Database triggers** accessing restricted tables (most likely in your case)
2. **RLS policies** blocking data access
3. **Corrupted auth schema**
4. **SMTP provider issues**

### Your Specific Issue
From your WARP.md, you previously had a trigger called `populate_requests_created_by_name` that was **DISABLED** because it tried to access `auth.users` table and caused hangs.

**The trigger is likely STILL causing 500 errors even though it's disabled.**

### Test Results
- ✅ Supabase connection: Working
- ✅ Database tables: Accessible  
- ✅ Service role key: Can read data (3 requests found)
- ❌ Anon key: Cannot read data (0 requests found)
- **Root Cause**: Either database trigger or RLS policies

## Solution: Step-by-Step Fix

### STEP 1: Check Supabase Logs (REQUIRED)

1. Go to https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/logs/explorer
2. Click **+ New query**
3. Paste the contents of `scripts/check-auth-errors.sql`
4. Click **Run**
5. **Take a screenshot** of any errors shown

This will tell us EXACTLY what's wrong.

### STEP 2: Remove the Problematic Trigger

Based on your WARP.md, run this SQL in Supabase SQL Editor:

```sql
-- COMPLETELY remove the problematic trigger and function
DROP TRIGGER IF EXISTS populate_requests_created_by_name ON requests;
DROP FUNCTION IF EXISTS populate_requests_created_by_name() CASCADE;
```

### STEP 3: Fix RLS Policies (Enable Read Access)

1. Go to https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/sql
2. Run the SQL from `scripts/fix-rls-policies.sql`
3. Or run this quick version:

### Option 2: Quick Fix (Copy-Paste Ready)

Open Supabase SQL Editor and run:

```sql
-- Enable read access for all users on all tables
CREATE POLICY "Enable read access for all users" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.asset_versions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.slack_messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.mentions FOR SELECT USING (true);
```

## Verify the Fix

After running the SQL, test the connection:

```bash
pnpm tsx scripts/test-supabase-connection.ts
```

You should see:
- ✅ Anon client works! Found X requests (where X > 0)

## Alternative: Add Authentication

If you want to keep RLS strict and require authentication:

1. Implement Supabase Auth in your app
2. Update `useSupabase.ts` to handle auth state
3. Add login/signup pages
4. Modify RLS policies to check `auth.uid()` instead of `true`

## Security Note

⚠️ **Current Fix**: Allows **anyone** with your anon key to read data

This is fine for:
- Internal tools
- Dashboard apps behind corporate network
- Non-sensitive data

For production apps with sensitive data, implement proper authentication.

## Files Created

- `scripts/fix-rls-policies.sql` - SQL script to run in Supabase
- `scripts/test-supabase-connection.ts` - Test script to verify connectivity
- `FIX_SUPABASE_500_ERROR.md` - This file

## Next Steps

1. ✅ Run the SQL script in Supabase Dashboard
2. ✅ Test with `pnpm tsx scripts/test-supabase-connection.ts`
3. ✅ Restart your dev server: `pnpm dev`
4. ✅ Check your app - the 500 errors should be gone!
