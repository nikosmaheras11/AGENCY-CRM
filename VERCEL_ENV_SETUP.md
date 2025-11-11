# Vercel Environment Variables Setup

## Required Environment Variables for Slack OAuth

To fix the "Please specify 'client_id'" error, ensure all these environment variables are set in your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/nikosmaheras11/agency-crm
- Click **Settings** → **Environment Variables**

### 2. Add These Variables

#### Public Variables (Available to Client-Side)
```bash
SLACK_CLIENT_ID=123456789012.1234567890123
SITE_URL=https://your-production-url.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Server-Only Variables (Secrets)
```bash
SLACK_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Slack Channel IDs (Optional)
```bash
SLACK_CHANNEL_CREATIVE=C09HBDKSUGH
SLACK_CHANNEL_PERFORMANCE=C09F44R90UX
SLACK_CHANNEL_REQUESTS=C09RDUX4198
SLACK_CHANNEL_UGC=C09RJ82TFPG
```

### 3. Find Your Slack OAuth Credentials

#### Get Client ID & Client Secret:
1. Go to: https://api.slack.com/apps
2. Select your app
3. Click **OAuth & Permissions** in the sidebar
4. Find:
   - **Client ID** (e.g., `123456789012.1234567890123`)
   - **Client Secret** (click "Show" to reveal)

#### Configure Redirect URLs:
In the same **OAuth & Permissions** section:
1. Scroll to **Redirect URLs**
2. Add: `https://your-production-url.vercel.app/api/auth/slack/callback`
3. Click **Save URLs**

### 4. Set Required Scopes

Still in **OAuth & Permissions**:

**User Token Scopes:**
- `identity.basic`
- `identity.email`
- `identity.avatar`

**Bot Token Scopes:** (if using bot features)
- `channels:history`
- `channels:read`
- `users:read`
- `chat:write`

### 5. Verify Environment Variables in Vercel

After adding all variables, redeploy:
```bash
git push origin main
```

Or trigger manual redeploy in Vercel dashboard.

### 6. Test the Flow

1. Visit: `https://your-production-url.vercel.app/login`
2. Click "Sign in with Slack"
3. Should redirect to Slack OAuth (not show "client_id" error)
4. After authorization, should redirect back to your dashboard

### 7. Debug Issues

If you still see errors, check browser console on `/login` page:
```javascript
// You should see this output:
console.log(config.public.slackClientId) // Should show your actual client ID
```

If it shows `undefined` or empty string, the environment variable isn't being loaded properly.

## Common Issues & Solutions

### Issue: `client_id` is undefined
**Solution:** Make sure `SLACK_CLIENT_ID` is added in Vercel **without** the `NUXT_PUBLIC_` prefix. Nuxt automatically maps `SLACK_CLIENT_ID` to `config.public.slackClientId`.

### Issue: "Invalid redirect_uri"
**Solution:** Ensure your production URL matches exactly in both:
- Vercel's `SITE_URL` environment variable
- Slack app's Redirect URLs configuration

### Issue: Still seeing errors after adding variables
**Solution:** 
1. Check variable names are exact (case-sensitive)
2. Ensure variables are available for **Production** environment
3. Trigger a fresh deployment (not just rebuild)

## Verification Checklist

- [ ] `SLACK_CLIENT_ID` added in Vercel
- [ ] `SLACK_CLIENT_SECRET` added in Vercel
- [ ] `SITE_URL` matches production URL
- [ ] All Supabase credentials added
- [ ] Slack app redirect URL matches production URL
- [ ] Deployed and tested `/login` page
- [ ] No console errors when clicking Slack button
- [ ] Successful OAuth flow to dashboard
