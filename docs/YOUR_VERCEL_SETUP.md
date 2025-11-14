# Your Vercel Deployment Setup

## 🌐 Project Information

**Production URL**: https://v0-agency-os-seven.vercel.app
**Project Name**: v0-agency-os-seven
**Current Branch**: `claude/setup-supabase-api-access-01CuLNQTR5Q6X54yoWrKWvUG`

---

## 🚨 Current Issue

**Every push to GitHub is deploying to production** because Vercel doesn't know which branch should be "production only".

---

## ✅ Fix: Configure Vercel to Control Deployments

### Step 1: Access Vercel Dashboard

Go to your project:
- https://vercel.com → Find "v0-agency-os-seven"
- Or direct link: https://vercel.com/dashboard (select your project)

### Step 2: Configure Production Branch

1. Click on your project: **v0-agency-os-seven**
2. Go to: **Settings** (top navigation)
3. Click: **Git** (left sidebar)
4. Under **"Production Branch"**:
   - Set to: `main`
   - This means ONLY the `main` branch deploys to production

5. Under **"Deploy Previews"**:
   - Enable: **All branches**
   - This creates preview URLs for feature branches

6. Click **Save**

### Step 3: Verify Settings

After saving, your deployments should work like this:

```
Branch: main
Deploy to: https://v0-agency-os-seven.vercel.app (PRODUCTION)

Branch: claude/setup-supabase-api-access-*
Deploy to: claude-setup-xyz.vercel.app (PREVIEW only)

Branch: any-feature-branch
Deploy to: any-feature-branch-xyz.vercel.app (PREVIEW only)
```

---

## 🎯 How to Test It's Working

### After Configuration:

1. **Push to your current branch** (claude/setup-supabase-api-access-*)
   ```bash
   git add .
   git commit -m "test: verify preview deployment"
   git push
   ```

2. **Check Vercel Dashboard**
   - Go to Deployments tab
   - Look for the new deployment
   - **Check the URL**:
     - ❌ If it's `v0-agency-os-seven.vercel.app` → Still going to production (need to fix settings)
     - ✅ If it's `claude-setup-xyz.vercel.app` → Preview deployment (correct!)

3. **Verify Domain Assignment**
   - Production domain should ONLY be assigned to `main` branch deployments
   - Feature branches get temporary preview URLs

---

## 📋 Vercel Dashboard Checklist

Go through these settings:

### Git Settings (Settings → Git)

- [ ] **Production Branch**: Set to `main`
- [ ] **Ignored Build Step**: Leave empty (or add custom logic if needed)
- [ ] **Auto-deploy on push to Production Branch**: ✅ Enabled (for main only)
- [ ] **Deploy Previews**: ✅ Enabled for all branches

### Domains Settings (Settings → Domains)

- [ ] **Production Domain**: `v0-agency-os-seven.vercel.app` assigned to `main` branch only
- [ ] **Preview Domains**: Automatically generated for other branches

### Environment Variables (Settings → Environment Variables)

Currently needed:
- [x] `SUPABASE_URL` - ✅ Set
- [x] `SUPABASE_ANON_KEY` - ✅ Set
- [x] `SUPABASE_SERVICE_KEY` - ✅ Set
- [ ] `VERCEL_TOKEN` - ⏳ Optional (for build monitoring)

---

## 🔧 What I've Already Done

### Created `vercel.json`

This file tells Vercel to only deploy `main` branch to production:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

**This file is in your repo** - when you merge to `main`, it will enforce the rule.

---

## 🚀 Deployment Workflow (After Fix)

### Working on Features (Safe Mode)

```bash
# 1. Create/switch to feature branch
git checkout -b feature/my-changes

# 2. Make changes
git add .
git commit -m "feat: my changes"

# 3. Push to GitHub
git push origin feature/my-changes

# 4. Vercel creates PREVIEW deployment
# URL: feature-my-changes-v0-agency-os-seven.vercel.app
# NOT production URL ✅

# 5. Test the preview URL
# Open the preview link from Vercel deployment

# 6. When ready, merge to main
git checkout main
git merge feature/my-changes
git push origin main

# 7. Vercel deploys to PRODUCTION
# URL: https://v0-agency-os-seven.vercel.app ✅
```

---

## 📊 Current Status

### Before Configuration:
```
❌ Push to claude/* branch → Production (v0-agency-os-seven.vercel.app)
❌ Push to any branch → Production
❌ Can't safely test changes
```

### After Configuration:
```
✅ Push to main → Production (v0-agency-os-seven.vercel.app)
✅ Push to claude/* → Preview (preview-url.vercel.app)
✅ Safe to test before merging
✅ Full control over production
```

---

## 🎯 Immediate Next Steps

### Option A: Configure Now (Recommended)

1. Go to Vercel dashboard: https://vercel.com
2. Select project: **v0-agency-os-seven**
3. Settings → Git
4. Set production branch: `main`
5. Enable deploy previews: All branches
6. Save

**Result**: Takes effect immediately. Your next push creates preview only.

### Option B: Merge First, Then Configure

1. Merge current branch to `main`
2. This adds vercel.json to main
3. Configure Vercel settings
4. Future feature branches = preview only

---

## 🔍 How to Verify It's Working

### Check Deployment Type:

1. **After pushing**, go to Vercel dashboard
2. Click on the latest deployment
3. Check the **"Type"** field:
   - Should say: **"Preview"** (not "Production")
4. Check the **URL**:
   - Should be: `branch-name.vercel.app` (not `v0-agency-os-seven.vercel.app`)

### Visual Indicators:

- **Production deployment**: Has the custom domain badge
- **Preview deployment**: Has a temporary URL with branch name

---

## 💡 Understanding Your URLs

### Production URL (Main Branch Only)
```
https://v0-agency-os-seven.vercel.app
├─ Assigned to: main branch
├─ Updated: When you merge to main
└─ Purpose: Live production site
```

### Preview URLs (All Other Branches)
```
https://claude-setup-abc123.vercel.app
├─ Assigned to: Feature branches
├─ Updated: When you push to that branch
└─ Purpose: Testing before merge
```

---

## 🛡️ Protection Features

With the configuration:

- ✅ **Protected Production**: Only main branch can update production URL
- ✅ **Safe Testing**: All feature branches get preview URLs
- ✅ **No Accidents**: Can't accidentally break production
- ✅ **Easy Rollback**: Production stays on last good main commit
- ✅ **Team Collaboration**: Everyone can test on preview URLs

---

## 📝 Quick Reference

### Your Project Details:
```
Production URL:    https://v0-agency-os-seven.vercel.app
Project Name:      v0-agency-os-seven
Production Branch: main (set in Vercel settings)
Current Branch:    claude/setup-supabase-api-access-*
Next Deployment:   Should be PREVIEW (after config)
```

### Vercel Dashboard Links:
```
Project Home:      https://vercel.com/dashboard
Settings → Git:    Configure production branch
Deployments:       View all deployments
Domains:           Manage domain assignments
```

---

## 🎓 Best Practices

1. **Never push directly to main**
   - Always work on feature branches
   - Test on preview deployments
   - Merge to main when ready

2. **Use descriptive branch names**
   - `feature/add-comments`
   - `fix/cursor-bug`
   - `update/responsive-design`

3. **Test preview deployments**
   - Click the preview URL from Vercel
   - Verify changes work
   - Check for errors in Vercel logs

4. **Merge to main only when tested**
   - Preview deployment looks good
   - No errors in console
   - Features work as expected

---

## ⚡ Emergency: Stop All Deployments

If you need to pause deployments immediately:

1. Go to: Settings → Git
2. Uncheck: **"Automatically deploy on push to production branch"**
3. Deployments stop until you re-enable

---

## 🎯 Action Required

**Right now, to fix the auto-production deploys:**

1. Open: https://vercel.com
2. Find project: **v0-agency-os-seven**
3. Go to: **Settings → Git**
4. Set: **Production Branch = main**
5. Enable: **Deploy Previews = All branches**
6. Click: **Save**

**That's it!** After this, your current branch pushes will be preview-only.

---

## 📞 Need Help?

If you're not sure about the settings:
1. Take a screenshot of your Vercel Git settings
2. Let me know what you see
3. I'll guide you through the exact configuration

---

**Let me know once you've configured the Vercel settings, and I'll help verify it's working!**
