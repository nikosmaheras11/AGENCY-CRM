# Warp Terminal Workflows - Cloud-First Development

**Optimized for:** GitHub → Vercel deployment pipeline  
**Database:** Supabase (cloud-hosted, no local setup)  
**Philosophy:** Minimal local development, maximum cloud testing

---

## 🚀 Quick Start Workflows

### 1. Daily Development Flow
**Goal:** Make changes and deploy to staging

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (optional but recommended)
git checkout -b feat/your-feature-name

# 3. Make your code changes in editor
# (Edit files as needed)

# 4. Verify changes look good
git status
git diff

# 5. Commit and push
git add .
git commit -m "feat: add new feature description"
git push origin feat/your-feature-name

# 6. Vercel automatically deploys to preview URL
# Check deployment status
vercel ls

# 7. Test in preview environment, then merge to main
```

**Time saved:** No Docker, no local DB, deploy in seconds

---

### 2. Hot Fix Workflow
**Goal:** Quick bug fix directly to main

```bash
# 1. Ensure you're on main with latest code
git checkout main
git pull origin main

# 2. Make the fix
# (Edit files)

# 3. Quick commit and push
git add .
git commit -m "fix: resolve critical bug in X"
git push origin main

# 4. Vercel auto-deploys to production
vercel --prod  # Check status
```

**When to use:** Critical production bugs that can't wait for PR review

---

### 3. Feature Development with PR
**Goal:** Build feature with code review before production

```bash
# 1. Create and switch to feature branch
git checkout -b feat/slack-notifications

# 2. Make changes, commit frequently
git add .
git commit -m "feat: add Slack notification structure"
# ... make more changes ...
git commit -m "feat: implement notification sending"

# 3. Push to GitHub
git push origin feat/slack-notifications

# 4. Create PR on GitHub
gh pr create --title "Add Slack Notifications" --body "Implements real-time Slack notifications for new requests"

# 5. Vercel creates preview deployment for PR
# Test at preview URL

# 6. After approval, merge via GitHub UI or:
gh pr merge --squash

# 7. Clean up local branch
git checkout main
git pull origin main
git branch -d feat/slack-notifications
```

---

## 🔍 Verification & Testing Workflows

### Database Schema Check
**Before:** Making database-related changes  
**After:** Deploying new migrations

```bash
# Verify all 30 Supabase tables are accessible
node scripts/verify-schema.js

# Expected output:
# ✅ Accessible tables: 30
# ❌ Missing tables: 0
```

---

### Pre-Push Checklist
**Run before pushing to avoid deployment failures**

```bash
# 1. Lint check (fix any errors)
pnpm lint

# 2. Type check (if TypeScript strict mode enabled)
pnpm build  # or tsc --noEmit

# 3. Verify no uncommitted changes left behind
git status

# 4. If all good, push
git push origin main
```

---

### Local Testing (When Needed)
**Only use when absolutely necessary**

```bash
# 1. Install dependencies (first time only)
pnpm install

# 2. Ensure environment variables loaded
cat .env | grep SUPABASE_URL  # Verify Supabase configured

# 3. Start dev server
pnpm dev

# Opens at http://localhost:3000
# Uses cloud Supabase (no local DB needed)

# 4. Test your changes

# 5. Stop server (Ctrl+C) and push to cloud
git add .
git commit -m "feat: tested feature locally"
git push origin main
```

**Remember:** Staging environment is preferred over local testing

---

## 📦 Dependency Management

### Adding New Package

```bash
# Add production dependency
pnpm add package-name

# Add dev dependency
pnpm add -D package-name

# Commit package.json and pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "chore: add package-name dependency"
git push origin main
```

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update specific package
pnpm update package-name

# Update all dependencies (careful!)
pnpm update

# Commit changes
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies"
git push origin main
```

---

## 🗄️ Database Workflows

### View Database Tables (Supabase Dashboard)

```bash
# Open Supabase project in browser
open https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt

# Navigate to:
# - Table Editor: View/edit data
# - SQL Editor: Run queries
# - Database: View schema, functions, triggers
```

### Run SQL Query

```bash
# Option 1: Via Supabase Dashboard
open https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/editor

# Option 2: Create migration file locally, push to GitHub
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_feature.sql << 'EOF'
-- Your SQL here
ALTER TABLE requests ADD COLUMN IF NOT EXISTS new_field TEXT;
EOF

git add supabase/migrations/
git commit -m "feat: add new_field to requests table"
git push origin main
```

### Check Recent Activity

```bash
# Query activity log via Supabase dashboard or create script
# Example: View last 10 activities
cat > scripts/check-activity.js << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const { data } = await supabase
  .from('activity_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)

console.table(data)
EOF

node scripts/check-activity.js
```

---

## 🔧 Troubleshooting Workflows

### Deployment Failed

```bash
# 1. Check Vercel logs
vercel logs

# 2. Check most recent deployment
vercel ls | head -5

# 3. View specific deployment logs
vercel logs <deployment-url>

# 4. Common issues:
# - Missing environment variables → Add in Vercel dashboard
# - Build errors → Check pnpm build locally
# - Type errors → Run pnpm lint
```

### Vercel Environment Variables

```bash
# List all environment variables
vercel env ls

# Add new environment variable
vercel env add SUPABASE_URL

# Pull environment variables to local .env
vercel env pull .env.local
```

### Rollback Deployment

```bash
# 1. List recent deployments
vercel ls

# 2. Promote previous deployment to production
vercel promote <previous-deployment-url> --yes

# OR revert via Git
git revert HEAD
git push origin main
```

---

## 📊 Monitoring Workflows

### Check Application Status

```bash
# Production URL health check
curl -I https://your-app.vercel.app

# View real-time logs (if connected to Vercel)
vercel logs --follow

# Check Supabase status
open https://status.supabase.com
```

### Performance Monitoring

```bash
# Run Lighthouse audit (requires Chrome)
npx lighthouse https://your-app.vercel.app --view

# Check bundle size
pnpm build
ls -lh .nuxt/dist/client/**/*.js
```

---

## 🎯 Advanced Workflows

### Multi-Environment Deployment

```bash
# Deploy to specific environment
vercel --prod              # Production
vercel                     # Preview
vercel --target preview    # Preview (explicit)

# Set environment variables per environment
vercel env add FEATURE_FLAG production
vercel env add FEATURE_FLAG preview
```

### Collaborative Development

```bash
# 1. Sync with team's latest changes
git fetch origin
git rebase origin/main

# 2. Resolve any conflicts
git add .
git rebase --continue

# 3. Push (may need force push after rebase)
git push origin feat/your-branch --force-with-lease

# 4. Request review
gh pr create --assignee teammate-username
```

### Database Migration Workflow

```bash
# 1. Create migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_feature_name.sql << 'EOF'
-- Add your SQL migration
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);
EOF

# 2. Test migration locally (optional)
# Run SQL in Supabase dashboard on test project

# 3. Commit and push
git add supabase/migrations/
git commit -m "feat: add new_table migration"
git push origin main

# 4. Verify schema after deployment
node scripts/verify-schema.js
```

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Don't: Run Docker Locally
```bash
# OUTDATED - Don't do this anymore
docker-compose up -d
```
**Why:** No longer needed. Supabase is cloud-hosted.

### ❌ Don't: Set Up Local Database
```bash
# OUTDATED - Don't do this
psql -U postgres -h localhost
```
**Why:** Use Supabase dashboard for database access.

### ❌ Don't: Test Only Locally Before Push
```bash
# RISKY - Don't rely on this alone
pnpm dev  # Test locally
git push  # Push without staging verification
```
**Why:** Local environment can differ from production. Always test in Vercel preview.

### ❌ Don't: Hardcode Environment Variables
```typescript
// BAD
const supabaseUrl = 'https://vzhthefdgumjkhnjpydt.supabase.co'

// GOOD
const supabaseUrl = process.env.SUPABASE_URL
```
**Why:** Use environment variables for all configuration.

---

## ✅ Best Practices Checklist

Before pushing code:
- [ ] Code passes linting (`pnpm lint`)
- [ ] No console.log statements left in production code
- [ ] Environment variables used (not hardcoded)
- [ ] Commit message follows convention (feat:, fix:, chore:)
- [ ] Changes tested in local dev (if necessary)

After push:
- [ ] Vercel deployment succeeded
- [ ] Preview URL tested
- [ ] No console errors in browser
- [ ] Database schema verified (if migrations added)
- [ ] Real-time features working (if applicable)

---

## 📞 Quick Commands Reference

| Task | Command |
|------|---------|
| **Git** | |
| Create branch | `git checkout -b feat/name` |
| Commit | `git add . && git commit -m "message"` |
| Push | `git push origin branch-name` |
| **Vercel** | |
| Deploy preview | `vercel` |
| Deploy production | `vercel --prod` |
| View logs | `vercel logs` |
| List deployments | `vercel ls` |
| **pnpm** | |
| Install deps | `pnpm install` |
| Add package | `pnpm add package-name` |
| Run dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| **Database** | |
| Verify schema | `node scripts/verify-schema.js` |
| Dashboard | `open https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt` |
| **GitHub CLI** | |
| Create PR | `gh pr create` |
| Merge PR | `gh pr merge` |
| View status | `gh pr status` |

---

## 🎓 Learning Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Nuxt 3 Docs:** https://nuxt.com/docs
- **GitHub CLI:** https://cli.github.com/manual

---

**Last Updated:** January 12, 2025  
**Maintained By:** Agency Dashboard OS Team
