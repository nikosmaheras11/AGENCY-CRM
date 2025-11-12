# Configuration Cleanup Plan - Supabase as Single Source of Truth

**Goal:** Remove all Directus references and ensure Supabase is the only active database configuration.

---

## ✅ Current State Analysis

### What's Active
- ✅ **Supabase** - All 30 tables verified and accessible
- ✅ **useSupabase** composable - Fully functional
- ✅ Slack integration using Supabase tables

### What's Inactive/Legacy
- ❌ **Directus** - Docker container still configured but not used
- ❌ **useDirectus** composable - Exists but no Vue components use it
- ❌ Local PostgreSQL in Docker - Redundant with Supabase

---

## 🔧 Action Items

### 1. Comment Out Directus in Environment Files
**Files to Update:**
- `.env`
- `.env.example`

**Action:** Add comments to clearly mark as legacy/disabled

### 2. Remove Directus from Runtime Config
**File:** `nuxt.config.ts`

**Action:** Remove `directusServerToken` and `directusUrl` from config

### 3. Rename useDirectus Composable
**File:** `frontend/composables/useDirectus.ts`

**Action:** Rename to `useDirectus.ts.disabled` to prevent accidental usage

### 4. Disable Docker Compose Services
**File:** `docker-compose.yml`

**Action:** Rename to `docker-compose.yml.legacy` or comment out Directus service

### 5. Update Documentation
**Files to Update:**
- `WARP.md`
- `README.md` (if exists)
- Any setup guides

**Action:** Remove Directus instructions, keep only Supabase

---

## 📋 Implementation Steps

Run these commands in order:

```bash
# Step 1: Backup current configuration
cp .env .env.backup
cp nuxt.config.ts nuxt.config.ts.backup
cp docker-compose.yml docker-compose.yml.backup

# Step 2: Stop any running Docker services
docker-compose down

# Step 3: Apply the cleanup changes
# (See changes below)

# Step 4: Verify Supabase still works
node scripts/verify-schema.js

# Step 5: Remove backups after verification
rm .env.backup nuxt.config.ts.backup docker-compose.yml.backup
```

---

## 🎯 Why This Matters

### Current Issues with Dual Configuration
1. **Confusion** - Developers don't know which database to use
2. **Resource Waste** - Docker running unused services
3. **Security Risk** - Multiple access points to maintain
4. **Code Complexity** - Two composables doing similar things

### Benefits After Cleanup
1. ✅ **Single Source of Truth** - Only Supabase
2. ✅ **Clear Documentation** - No conflicting instructions
3. ✅ **Faster Development** - No need to run Docker locally
4. ✅ **Production Ready** - Same DB in dev and prod
5. ✅ **Cost Savings** - No duplicate infrastructure

---

## ⚠️ Important Notes

### Don't Delete These
- `directus/snapshots/` - Keep for historical reference
- `supabase/migrations/` - Active migrations
- Documentation mentioning Directus as legacy system

### Migration Complete
Your Supabase database already has all the data from Directus:
- ✅ 2 requests migrated
- ✅ 1 Slack message tracked
- ✅ All tables and schemas match

---

## 🔍 Verification Checklist

After cleanup, verify:

- [ ] `pnpm dev` starts without errors
- [ ] `node scripts/verify-schema.js` shows all 30 tables
- [ ] No console warnings about missing Directus
- [ ] Slack integration still works
- [ ] File uploads work (Supabase Storage)
- [ ] Authentication works (Supabase Auth)

---

## 🚀 Post-Cleanup Configuration

Your final active configuration will be:

### `.env` (Active Variables)
```env
# Slack Integration (Active)
SLACK_BOT_TOKEN=xoxb-...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
SLACK_CHANNEL_CREATIVE=C09HBDKSUGH
SLACK_CHANNEL_PERFORMANCE=C09F44R90UX
SLACK_CHANNEL_REQUESTS=C09RDUX4198
SLACK_CHANNEL_UGC=C09RJ82TFPG

# Supabase Configuration (Active - Primary Database)
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

### `nuxt.config.ts` (Cleaned)
```typescript
runtimeConfig: {
  // Server-side only
  slackBotToken: process.env.SLACK_BOT_TOKEN,
  slackClientSecret: process.env.SLACK_CLIENT_SECRET,
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  
  // Public (client-side)
  public: {
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    slackClientId: process.env.SLACK_CLIENT_ID
  }
}
```

---

## 📞 Rollback Plan (If Needed)

If something breaks:

```bash
# Restore backups
cp .env.backup .env
cp nuxt.config.ts.backup nuxt.config.ts
cp docker-compose.yml.backup docker-compose.yml

# Restart services
docker-compose up -d

# Verify
pnpm dev
```

---

**Ready to proceed?** I can make these changes automatically for you.
