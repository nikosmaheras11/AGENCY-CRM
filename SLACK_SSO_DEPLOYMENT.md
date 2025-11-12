# Slack SSO Deployment Checklist

## ✅ Quick Setup for Demo Environment

### Step 1: Apply Database Migration (Client Guests)

```bash
# Copy the migration file content
cat supabase/migrations/20250112_add_client_guests.sql

# Paste into Supabase Dashboard:
# https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
# → SQL Editor → New Query → Run
```

### Step 2: Seed Initial Data

```bash
# Run seed script
node scripts/seed-data.js

# This creates:
# - Polymarket client
# - 4 internal team members
# - 3 Polymarket guest users
```

### Step 3: Verify Environment Variables

Check that these are set in Vercel dashboard:

**Required for Slack SSO:**
```
SLACK_CLIENT_ID=7560193436759.9873402442851
SLACK_CLIENT_SECRET=d015030f6d91a56f2789b520c2e8e78b
SITE_URL=https://your-vercel-app.vercel.app
```

**Already set (from your .env):**
```
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Update Slack App Redirect URLs

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app
3. Navigate to **OAuth & Permissions**
4. Add redirect URLs:
   - Development: `http://localhost:3000/api/auth/slack/callback`
   - Vercel Preview: `https://your-vercel-app.vercel.app/api/auth/slack/callback`
   - Production: `https://yourdomain.com/api/auth/slack/callback`

### Step 5: Test Login Flow

**As Internal User (You):**
1. Go to your deployed app
2. Click "Sign in with Slack"
3. Authorize with your Slack account (nikos@agency.com)
4. Should be created as `admin` role
5. Can see all requests

**As Client Guest:**
1. Have someone from Polymarket sign in
2. Or create test user: `test@polymarket.com`
3. Should be created as `client_guest` role
4. Can only see Polymarket requests

---

## 📋 How It Works Now

### Email Domain → Role Mapping

```typescript
@polymarket.com  → role: 'client_guest', client_id: <polymarket_uuid>
@agency.com      → role: 'user' (or 'admin' for nikos@agency.com)
other domains    → role: 'user' (default)
```

### Auto-Assignment Flow

1. **User clicks "Sign in with Slack"**
2. **Slack OAuth** → returns user profile
3. **Server checks email domain:**
   - `@polymarket.com` → Look up Polymarket client ID
   - `@agency.com` → Internal team member
4. **Create profile** with appropriate role and client_id
5. **Redirect to dashboard** (filtered by role/client)

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Login (You)
```
Email: nikos@agency.com
Expected: role='admin', client_id=null
Access: See ALL clients and requests
```

### Scenario 2: Polymarket Guest
```
Email: anyone@polymarket.com
Expected: role='client_guest', client_id=<polymarket>
Access: See ONLY Polymarket requests
```

### Scenario 3: New Internal Team Member
```
Email: newperson@agency.com
Expected: role='user', client_id=null
Access: See ALL clients and requests
```

---

## 🔐 Security Features

✅ **Domain-based access control** - Auto-assigns role by email  
✅ **Client isolation** - RLS policies enforce data separation  
✅ **OAuth security** - State parameter, CSRF protection  
✅ **HTTP-only cookies** - Session tokens not accessible via JS  
✅ **Service key isolation** - Only used server-side  

---

## 🎨 UI Considerations

### Show User Role Badge

```vue
<template>
  <div class="user-badge">
    <span v-if="user.role === 'admin'">🔑 Admin</span>
    <span v-else-if="user.role === 'client_guest'">
      👤 {{ user.company }} Guest
    </span>
    <span v-else>👥 Team Member</span>
  </div>
</template>
```

### Hide Features for Guests

```vue
<template>
  <!-- Only show "Create Request" for internal users -->
  <UButton 
    v-if="user.role !== 'client_guest'"
    @click="createRequest"
  >
    Create Request
  </UButton>
</template>
```

---

## 🐛 Troubleshooting

### Issue: "Invalid redirect_uri"
**Solution:** Add your Vercel URL to Slack app redirect URLs

### Issue: User created but can't see Polymarket data
**Solution:** Verify `client_id` is set in their profile:
```sql
SELECT id, email, role, client_id, company 
FROM profiles 
WHERE email = 'user@polymarket.com';
```

### Issue: User gets "admin" role but shouldn't
**Solution:** Check email domain logic in `/server/api/auth/slack/callback.ts`

### Issue: User can see all clients (should only see theirs)
**Solution:** 
1. Check RLS policies are enabled
2. Run migration: `20250112_add_client_guests.sql`
3. Verify their profile has `client_id` set

---

## 📝 Next Steps (After Basic SSO Works)

1. **Email invitation system**
   - Send invite email to `guest@polymarket.com`
   - Include "Sign in with Slack" link
   - Auto-assign on first login

2. **Guest management UI**
   - Admin page to invite/remove guests
   - View all guests per client
   - Resend invitations

3. **Client-specific branding**
   - Custom colors per client
   - Client logo in header for guests
   - Personalized welcome message

4. **Activity tracking**
   - Log when guests view requests
   - Track comment activity
   - Generate usage reports

---

## 🚀 Deploy Now

**Quick Deploy:**
```bash
# 1. Apply migration (via Supabase dashboard)
# 2. Seed data
node scripts/seed-data.js

# 3. Push to GitHub (triggers Vercel deploy)
git add .
git commit -m "feat: add Slack SSO with client guest support"
git push origin main

# 4. Test on Vercel preview URL
```

**Your Slack SSO is ready to test!** 🎉
