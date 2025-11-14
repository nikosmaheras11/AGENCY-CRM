# 🚨 CRITICAL ISSUES FOUND & FIXES

## Root Cause Analysis

### Issue #1: Missing `.env` File ⚠️ **BLOCKING**

**Problem:**
- The `.env` file doesn't exist
- Supabase client can't initialize without credentials
- This is why:
  - ❌ Cursors don't show on canvas
  - ❌ Comments can't be created/saved
  - ❌ Real-time features don't work

**Evidence:**
```bash
$ test -f .env
✗ .env missing
```

**Location:** `composables/useSupabase.ts:27-32`
```typescript
const supabase = createClient(
  config.public.supabaseUrl,    // ← undefined (no .env)
  config.public.supabaseAnonKey // ← undefined (no .env)
)
```

**Fix Required:**
```bash
# 1. Create .env file from example
cp .env.example .env

# 2. Add your actual Supabase credentials
# Get from: https://supabase.com/dashboard → Your Project → Settings → API
```

Required values:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Issue #2: Collaboration Mode Disabled ⚠️

**Problem:**
Collaborative cursors are explicitly disabled in both implementations.

**Evidence:**

`pages/creative/asset/[id].vue:97`
```vue
<CommentLayer
  :asset-id="assetId"
  :is-video="true"
  :enable-collaboration="false"  <!-- ❌ Cursors disabled -->
```

`pages/creative/asset/[id].vue:122`
```vue
<CommentLayer
  :asset-id="assetId"
  :is-video="false"
  :enable-collaboration="false"  <!-- ❌ Cursors disabled -->
```

**Fix:** Change to `:enable-collaboration="true"`

---

### Issue #3: Wrong Asset ID Being Used

**Problem:**
The code uses `request_id` in the comments table but passes `assetId` which is actually the request ID. This is confusing but technically works because:
- The route param is called `:id`
- It's assigned to `assetId` but it's really a request ID
- Comments are stored by `request_id`

**Not a bug, just confusing naming** - but worth clarifying.

---

## Quick Fix Checklist

### IMMEDIATE (Required for any functionality)

- [ ] **Create `.env` file with Supabase credentials**
  ```bash
  cp .env.example .env
  # Then edit .env with real credentials
  ```

- [ ] **Enable realtime in Supabase Dashboard**
  1. Go to https://supabase.com/dashboard
  2. Select your project
  3. Database → Replication
  4. Enable replication for `comments` table ✅

- [ ] **Restart dev server**
  ```bash
  pnpm dev
  ```

### QUICK WINS (UI Fixes)

- [ ] **Enable collaborative cursors**
  - Edit `pages/creative/asset/[id].vue` lines 97 & 122
  - Change `:enable-collaboration="false"` to `"true"`

- [ ] **Add environment variable check**
  - Warn users if Supabase isn't configured
  - Better error messages

---

## Testing After Fix

Once you've added the `.env` file:

1. **Test Comments:**
   ```
   ✓ Open asset viewer
   ✓ Click on canvas
   ✓ Comment form should appear
   ✓ Type comment and submit
   ✓ Comment should save to database
   ✓ Pin should appear on canvas
   ```

2. **Test Cursors:**
   ```
   ✓ Enable collaboration in code
   ✓ Open asset in two browser windows
   ✓ Move mouse in one window
   ✓ Cursor should appear in other window
   ```

3. **Test Real-time:**
   ```
   ✓ Add comment in window 1
   ✓ Should appear instantly in window 2
   ```

---

## Database Schema Verification

The schema looks good! ✅

From `supabase/migrations/20250113_enable_realtime_comments.sql`:

```sql
-- ✅ Video timestamp support
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS video_timestamp DECIMAL(10, 3);

-- ✅ Realtime enabled
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- ✅ Full replication
ALTER TABLE comments REPLICA IDENTITY FULL;

-- ✅ Optimized indexes
CREATE INDEX idx_comments_video_timestamp ON comments(...);
CREATE INDEX idx_comments_position ON comments(...);
```

**All migrations are correct!** No changes needed to schema.

---

## Why This Broke

The project was deployed/developed without a `.env` file locally. The app likely works in production (Vercel) because environment variables are set there.

**Local development requires:**
1. `.env` file with credentials
2. Or pass via command line (not recommended)

---

## Next Steps (After Basic Fix)

After you get the basic functionality working, we should:

1. ✅ Add responsive design (mobile breakpoints)
2. ✅ Implement shareable links
3. ✅ Add download functionality
4. ✅ Optimize mobile UX for request creation

But **FIRST**: Get Supabase connected by adding `.env` file!

---

## How to Get Supabase Credentials

### Option 1: From Vercel (if already deployed)
```bash
# If you have Vercel CLI
vercel env pull .env
```

### Option 2: From Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### Option 3: From GitHub Secrets (if set up)
Check your repository settings → Secrets for the values.

---

## Example `.env` File

```env
# ============================================
# AGENCY DASHBOARD - Local Development
# ============================================

# Site
SITE_URL=http://localhost:3000
NODE_ENV=development

# ============================================
# Supabase (REQUIRED FOR COMMENTING)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# Slack Integration (Optional)
# ============================================
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
# ... other Slack vars from .env.example
```

---

## Priority Order

1. 🔴 **CRITICAL**: Create `.env` file
2. 🔴 **CRITICAL**: Add Supabase credentials
3. 🟡 **HIGH**: Enable collaboration mode
4. 🟡 **HIGH**: Test commenting functionality
5. 🟢 **MEDIUM**: Responsive design
6. 🟢 **MEDIUM**: Shareable links

Let's fix the `.env` issue first, then everything else will work!
