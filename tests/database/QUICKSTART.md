# Quick Start Guide

Get your database tests running in 5 minutes!

## 📋 What You Need

- Your Supabase project URL: `https://vzhthefdgumjkhnjpydt.supabase.co`
- Your Supabase service role key (from Supabase Dashboard → Settings → API)

## 🚀 Quick Setup

### Option 1: Run Locally

```bash
# 1. Navigate to the test directory
cd agency-tests

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env and add your Supabase credentials
# SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
# SUPABASE_SERVICE_KEY=your_service_key_here

# 5. Run tests
npm test
```

### Option 2: Add to Your GitHub Repo

```bash
# 1. Copy these files to your main repo
cp -r agency-tests/* /path/to/your-repo/tests/database/

# 2. Add secrets to GitHub
# Go to: Repo → Settings → Secrets and variables → Actions
# Add: SUPABASE_URL and SUPABASE_SERVICE_KEY

# 3. Push to GitHub
git add tests/database/
git commit -m "Add database unit tests"
git push origin main

# Tests will now run automatically on every push!
```

## ✅ Verify Tests Are Working

After running `npm test`, you should see output like:

```
PASS tests/1-teams-table.test.ts
 Teams Table Schema and Constraints
   ✓ should have teams table with correct schema (234ms)
   ✓ should verify teams table columns exist (89ms)
   ✓ should enforce NOT NULL constraint on team name (67ms)
   ...

Test Suites: 5 passed, 5 total
Tests:       43 passed, 43 total
```

## 🎯 What Gets Tested

| Test | What It Checks |
|------|----------------|
| **1. Teams Table** | Schema, constraints, auto-generated IDs |
| **2. Asset Versioning** | Auto-increment trigger, version history |
| **3. New User Handler** | Profile creation on signup, default values |
| **4. RLS Policies** | Users can only update own profiles |
| **5. Comments** | Hierarchical threads, resolution status |

## 🐛 Troubleshooting

**"Missing environment variables"**
- Make sure `.env` file exists and has both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**"relation does not exist"**
- The table hasn't been created yet. Check if you need to run migrations.

**Tests timeout**
- Check your internet connection and Supabase project status

**RLS tests fail**
- Verify RLS is enabled in Supabase Dashboard → Database → Tables

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check the [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) for schema details
- Set up GitHub Actions for automated testing (see README)

## 🆘 Need Help?

1. Check test output for detailed error messages
2. Review Supabase logs: Dashboard → Logs
3. Verify your database schema matches the tests

---

**That's it!** Your database tests are now running. 🎉
