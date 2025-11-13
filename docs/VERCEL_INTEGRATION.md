# Vercel Integration Setup

## 🎯 Purpose

This setup allows automated monitoring of Vercel builds, real-time error detection, and automatic fixes for deployment issues.

---

## 🔑 Required Environment Variables

Add these to your Vercel project settings AND your local `.env` file:

```env
# Vercel API Access
VERCEL_TOKEN=your-vercel-api-token
VERCEL_PROJECT_ID=your-project-id
VERCEL_TEAM_ID=your-team-id (optional)
VERCEL_ORG_ID=your-org-id (optional)
```

---

## 📋 How to Get Credentials

### 1. Get Vercel API Token

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `Claude Code Integration`
4. Scope: Select **Full Account** (or specific team)
5. Expiration: Choose appropriate duration
6. Click **Create**
7. Copy the token immediately (shown only once!)
8. Add to `.env`: `VERCEL_TOKEN=your-token-here`

**Option B: Via CLI**
```bash
# If you have Vercel CLI
vercel login
cat ~/.vercel/auth.json
```

### 2. Get Project ID

**From Vercel Dashboard:**
1. Go to your project: https://vercel.com/your-team/agency-crm
2. Settings → General
3. Copy **Project ID**
4. Add to `.env`: `VERCEL_PROJECT_ID=prj_xxxxx`

**From CLI:**
```bash
# Link project first
vercel link

# Get project info
cat .vercel/project.json
```

### 3. Get Team ID (if using team)

**From Dashboard:**
1. Go to https://vercel.com/teams/your-team/settings
2. Copy **Team ID** from URL or settings
3. Add to `.env`: `VERCEL_TEAM_ID=team_xxxxx`

**From CLI:**
```bash
vercel teams list
```

---

## 🚀 Quick Setup

### Automated Setup (Run This)

```bash
# 1. Install Vercel CLI (optional but recommended)
pnpm add -D vercel

# 2. Link project
pnpm vercel link

# 3. Pull environment variables
pnpm vercel env pull .env

# 4. Add VERCEL_TOKEN manually
# Get from: https://vercel.com/account/tokens
echo "VERCEL_TOKEN=your-token-here" >> .env
```

### Manual Setup

```bash
# 1. Create .env file (if not exists)
cp .env.example .env

# 2. Add Vercel credentials
cat >> .env <<EOF

# Vercel Integration
VERCEL_TOKEN=vercel_token_here
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx
EOF

# 3. Test connection
pnpm vercel:check
```

---

## 🛠️ Available Commands

Once set up, you can use these npm scripts:

```bash
# Check deployment status
pnpm vercel:status

# Get latest build logs
pnpm vercel:logs

# Check for build errors
pnpm vercel:errors

# Watch deployments in real-time
pnpm vercel:watch

# Get deployment info
pnpm vercel:info
```

---

## 📊 Vercel API Capabilities

With the API token, I can:

### ✅ Monitor & Read
- ✅ Fetch deployment status
- ✅ Read build logs in real-time
- ✅ Check for TypeScript errors
- ✅ View build warnings
- ✅ Get deployment URLs
- ✅ Check environment variables

### ✅ Analyze & Fix
- ✅ Detect TypeScript errors
- ✅ Identify missing dependencies
- ✅ Find configuration issues
- ✅ Suggest fixes automatically

### ✅ Trigger (with appropriate permissions)
- ✅ Redeploy on fix
- ✅ Promote deployments
- ✅ Cancel builds

---

## 🔍 How It Works

### 1. Monitoring Loop

```typescript
// Automated monitoring
while (deployment is building) {
  1. Fetch latest logs
  2. Parse for errors
  3. If error found:
     a. Identify issue
     b. Generate fix
     c. Commit fix
     d. Push to trigger rebuild
}
```

### 2. Error Detection

Common errors I can auto-fix:
- TypeScript type errors
- Missing imports
- Syntax errors
- Environment variable issues
- Build configuration problems
- Dependency conflicts

### 3. Real-time Fixes

```bash
# Example flow:
1. Vercel build fails with TypeScript error
2. I fetch the build log
3. Parse error: "Property 'x' does not exist on type 'Y'"
4. Fix the code
5. Commit and push
6. Vercel auto-redeploys
7. Build succeeds ✅
```

---

## 🔐 Security Best Practices

### Token Permissions

**Recommended Scopes:**
- Read deployments ✅
- Read logs ✅
- Read project settings ✅
- Create deployments (optional)

**Do NOT expose:**
- Never commit VERCEL_TOKEN to git
- Never log the token
- Rotate tokens regularly (every 90 days)

### Environment Setup

```bash
# Local .env (gitignored)
VERCEL_TOKEN=vercel_xxx_production_token

# Vercel Dashboard → Settings → Environment Variables
# Add the same variables for production
```

---

## 📡 API Endpoints Used

I'll interact with these Vercel API endpoints:

```bash
# Get deployments
GET https://api.vercel.com/v6/deployments

# Get deployment by ID
GET https://api.vercel.com/v13/deployments/{id}

# Get build logs
GET https://api.vercel.com/v2/deployments/{id}/events

# Get project info
GET https://api.vercel.com/v9/projects/{id}

# Get environment variables
GET https://api.vercel.com/v9/projects/{id}/env
```

---

## 🧪 Testing the Setup

After adding credentials, test with:

```bash
# Test API connection
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v6/deployments?limit=1

# Should return JSON with your deployments
```

Or use the built-in test script:

```bash
pnpm vercel:test
```

Expected output:
```
✓ Vercel API connected
✓ Project found: agency-dashboard-os
✓ Latest deployment: https://agency-crm-xxx.vercel.app
✓ Status: READY
✓ Build logs accessible
```

---

## 🎯 What I Need From You

To enable this integration, please:

### Option 1: Quick Setup (Recommended)
```bash
# Just give me the token, I'll handle the rest
1. Create token at: https://vercel.com/account/tokens
2. Add to .env: VERCEL_TOKEN=your-token
3. I'll auto-detect project ID and team ID
```

### Option 2: Full Manual Setup
```bash
# Provide all credentials
VERCEL_TOKEN=vercel_token_xxx
VERCEL_PROJECT_ID=prj_xxx
VERCEL_TEAM_ID=team_xxx (if applicable)
```

### Option 3: Use Vercel CLI
```bash
# I can use the CLI if you link the project
pnpm add -D vercel
pnpm vercel link
# This creates .vercel/project.json with all needed info
```

---

## 🚦 What Happens Next

Once you add the token:

1. **Immediate Monitoring**
   - I can check current deployment status
   - Fetch latest build logs
   - Identify any active errors

2. **Proactive Fixes**
   - If build is failing, I'll read the logs
   - Identify the error
   - Fix the code
   - Commit and push

3. **Continuous Watching**
   - Monitor all pushes to your branch
   - Track deployment progress
   - Alert on failures
   - Auto-fix when possible

---

## 📝 Example Workflow

```bash
# You push code
git push origin main

# Vercel starts building
# Status: BUILDING

# I fetch logs in real-time
✓ Installing dependencies...
✓ Running build...
❌ Error: Type 'string' is not assignable to type 'number'
   at components/MyComponent.vue:42

# I detect the error
# Parse: components/MyComponent.vue line 42

# I read the file, fix the type error
# Commit: "fix: correct type error in MyComponent"

# Push the fix
git push origin main

# Vercel rebuilds automatically
✓ Build successful!
✓ Deployed to: https://your-app.vercel.app
```

---

## 🔧 Troubleshooting

### Token Not Working
```bash
# Check token validity
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v6/deployments

# If 401/403: Token expired or invalid
# Create new token at: https://vercel.com/account/tokens
```

### Project Not Found
```bash
# Verify project ID
cat .vercel/project.json

# Or get from dashboard:
# https://vercel.com/your-team/your-project/settings
```

### Rate Limits
```bash
# Vercel API limits:
# - 100 requests per 10 seconds
# - 1000 requests per hour

# My monitoring uses ~10-20 requests per build
# Well within limits for normal usage
```

---

## 📚 Resources

- Vercel API Docs: https://vercel.com/docs/rest-api
- Token Management: https://vercel.com/account/tokens
- Deployment Hooks: https://vercel.com/docs/deployments/deploy-hooks
- Environment Variables: https://vercel.com/docs/environment-variables

---

## ✅ Ready to Enable?

Just add to your `.env` file:

```env
VERCEL_TOKEN=your-token-from-vercel-dashboard
```

Then I can:
- ✅ Monitor builds in real-time
- ✅ Read error logs immediately
- ✅ Auto-fix TypeScript/build errors
- ✅ Track deployment status
- ✅ Proactively prevent issues

Let me know when you've added the token and I'll start monitoring! 🚀
