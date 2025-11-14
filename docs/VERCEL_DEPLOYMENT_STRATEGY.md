# Vercel Deployment Strategy - Stop Auto-Deploys to Production

## 🚨 Current Issue

**Problem:** Every git push is triggering a production deployment on Vercel.

**Why:** Vercel is connected to your GitHub repo and is set to auto-deploy on every push.

---

## 🎯 Recommended Setup

### Deployment Strategy:

```
main branch              → Production (yoursite.com)
feature branches         → Preview (feature-xyz.vercel.app)
claude/* branches        → Preview only (no production)
```

---

## 🔧 Solution: Configure Vercel Deployment Control

### Option 1: Use vercel.json (Recommended)

Create `vercel.json` to control which branches deploy to production:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "master": true
    }
  }
}
```

This ensures:
- ✅ Only `main` or `master` branch deploys to production
- ✅ All other branches create preview deployments
- ✅ No accidental production deploys

### Option 2: Vercel Dashboard Settings

1. Go to: https://vercel.com/your-team/agency-crm/settings/git
2. Under **Production Branch**:
   - Set to: `main` (or `master`)
3. Under **Deploy Previews**:
   - Enable for: All branches
   - But only `main` goes to production

### Option 3: Disable Auto-Deploy (Most Control)

1. Vercel Dashboard → Settings → Git
2. Uncheck **"Automatically deploy production on push to main"**
3. Manually trigger production deploys when ready

---

## 📋 Current Situation Analysis

### Your Current Branch:
```
claude/setup-supabase-api-access-01CuLNQTR5Q6X54yoWrKWvUG
```

**This is a feature branch** - It should NOT deploy to production!

### What's Probably Happening:

**Scenario A: No Production Branch Set**
- Vercel doesn't know which branch is "production"
- So it treats ALL branches as production
- **Fix:** Set production branch in Vercel settings

**Scenario B: Wrong Production Branch**
- Your feature branch is accidentally set as production
- **Fix:** Change production branch to `main` or `master`

**Scenario C: Auto-Deploy Enabled for All**
- Vercel is deploying every branch to production domain
- **Fix:** Configure git settings in Vercel

---

## ✅ Recommended Fix (Step by Step)

### Step 1: Create vercel.json

```bash
# I'll create this for you
```

This file tells Vercel:
- Only deploy `main` branch to production
- Create preview URLs for all other branches

### Step 2: Configure Vercel Dashboard

1. Go to https://vercel.com/your-team/agency-crm
2. Settings → Git
3. **Production Branch:** Set to `main` (or `master`)
4. **Ignored Build Step:** Leave empty (or add custom logic)
5. Save changes

### Step 3: Verify Deployment Behavior

After changes:
- Push to `main` → Production (yoursite.com)
- Push to feature branch → Preview (feature-abc.vercel.app)
- No more accidental production deploys ✅

---

## 🔍 Check Your Current Vercel Settings

### Via Vercel CLI (if installed):

```bash
vercel --version
vercel inspect
```

### Via Dashboard:

1. Go to: https://vercel.com
2. Select your project: **AGENCY-CRM**
3. Settings → Git
4. Check:
   - **Production Branch:** Should be `main` or `master`
   - **Deploy Previews:** Should be enabled
   - **Auto-deployments:** Check if enabled for all branches

---

## 🎯 Workflow After Fix

### Safe Development Flow:

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/my-new-feature
# ✅ Creates PREVIEW deployment only

# 4. Test preview deployment
# URL: feature-my-new-feature-agency-crm.vercel.app

# 5. When ready, merge to main
git checkout main
git merge feature/my-new-feature
git push origin main
# ✅ Creates PRODUCTION deployment

# 6. Delete feature branch
git branch -d feature/my-new-feature
```

---

## 🛡️ Protection Strategy

### vercel.json Configuration:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true,
    "silent": false
  },
  "scope": "production"
}
```

**What this does:**
- Only `main` branch can deploy to production
- Preview deployments for all other branches
- Auto-cancel old deployments when new push occurs
- GitHub integration enabled

---

## 📊 Deployment Types

### Production Deployment
- **Triggered by:** Push to `main` branch
- **URL:** yoursite.com (custom domain)
- **Environment:** Production variables
- **Example:** https://agency-crm.vercel.app

### Preview Deployment
- **Triggered by:** Push to any other branch
- **URL:** branch-name-project.vercel.app
- **Environment:** Preview variables
- **Example:** https://claude-setup-agency-crm.vercel.app

### Development
- **Local only:** `pnpm dev`
- **URL:** http://localhost:3000
- **Environment:** Local .env file

---

## 🚦 Current Branch Status

```
Branch: claude/setup-supabase-api-access-01CuLNQTR5Q6X54yoWrKWvUG
Type: Feature branch
Should deploy to: PREVIEW only
Currently deploying to: PRODUCTION (incorrect!)
```

**Action needed:** Configure Vercel to only deploy `main` to production.

---

## 🔧 Immediate Actions

### 1. Stop Auto-Deploys (Temporary)

If you need to stop deployments immediately:

```bash
# Vercel Dashboard → Settings → Git
# Uncheck: "Automatically deploy on push"
```

### 2. Set Production Branch

```bash
# Vercel Dashboard → Settings → Git
# Production Branch: main (or master)
```

### 3. Create vercel.json

I can create this file now to enforce the rule in code.

---

## 📝 Should I Create vercel.json?

I can create a `vercel.json` file that:
- ✅ Only allows `main` branch for production
- ✅ Creates preview deployments for all others
- ✅ Prevents accidental production deploys
- ✅ Configures build settings

**Would you like me to create this file now?**

Or you can configure it manually in the Vercel dashboard first.

---

## 🎓 Understanding Vercel Deployments

### Without Configuration:
```
ANY branch push → Production deployment ❌
```

### With Proper Configuration:
```
main branch push     → Production deployment ✅
feature branch push  → Preview deployment ✅
claude/* branch push → Preview deployment ✅
```

---

## ⚡ Quick Fix Commands

```bash
# Option 1: Create vercel.json to control deployments
# (I can do this for you)

# Option 2: Use Vercel CLI to set production branch
vercel --prod --branch main

# Option 3: Manual in dashboard
# Settings → Git → Production Branch → main
```

---

## 🔍 What to Check Right Now

1. **Vercel Dashboard:**
   - What's the "Production Branch" set to?
   - Is "Auto-deploy" enabled?

2. **Recent Deployments:**
   - Check which URLs were deployed
   - Are they production or preview?

3. **Domain Settings:**
   - What domain is assigned to production?
   - Are preview URLs being created?

---

## 💡 Best Practice Moving Forward

### Branch Strategy:
```
main                 → Always deployable, production-ready
develop              → Integration branch (optional)
feature/*            → New features (preview only)
fix/*                → Bug fixes (preview only)
claude/*             → AI-assisted changes (preview only)
```

### Deployment Strategy:
```
main → Production (auto-deploy)
All other branches → Preview (test before merge)
```

---

## 🎯 Next Steps

1. **Tell me your current production branch name**
   - Is it `main`, `master`, or something else?

2. **I'll create vercel.json** with the correct configuration

3. **Verify Vercel settings** in dashboard

4. **Test with a push** to feature branch (should be preview only)

5. **Merge to main** only when ready for production

---

**Let me know:**
1. What's your production branch name? (main/master/other?)
2. Should I create the vercel.json file now?
3. Do you want auto-deploy on main, or manual deploys only?
