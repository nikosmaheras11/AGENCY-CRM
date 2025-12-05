# Slack OAuth Setup Checklist

## 1. Configure Slack in Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt
2. Navigate to: **Authentication** → **Providers** → **Slack**

### Step 2: Enable Slack Provider
1. Toggle "Enable Slack Provider" to ON
2. Add your Slack OAuth credentials:
   - **Slack Client ID**: `SLACK_CLIENT_ID` from your `.env`
   - **Slack Client Secret**: `SLACK_CLIENT_SECRET` from your `.env`

### Step 3: Configure Callback URL
The callback URL should be:
```
https://vzhthefdgumjkhnjpydt.supabase.co/auth/v1/callback
```

Copy this URL and add it to your Slack App settings.

## 2. Configure Your Slack App

### Step 1: Go to Slack API Dashboard
Visit: https://api.slack.com/apps

### Step 2: Add Redirect URL
1. Click on your app
2. Go to **OAuth & Permissions**
3. Under **Redirect URLs**, add:
   ```
   https://vzhthefdgumjkhnjpydt.supabase.co/auth/v1/callback
   ```
4. Also add your production domain callback:
   ```
   https://your-production-domain.vercel.app/auth/callback
   ```

### Step 3: Verify OAuth Scopes
Ensure your Slack app has the following scopes:
- `openid`
- `email`
- `profile`

These are the minimum required for OIDC authentication.

## 3. Environment Variables

Verify these are set in both `.env` (local) and Vercel (production):

### Local (.env)
```bash
SUPABASE_URL=https://vzhthefdgumjkhnjpydt.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
```

### Vercel
Run this command to verify:
```bash
vercel env ls | grep -E "SUPABASE|SLACK"
```

Should show:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`

## 4. Test the Flow

### Test Locally
1. Start dev server: `pnpm dev`
2. Go to: http://localhost:3000/login
3. Click "Sign in with Slack"
4. Complete OAuth flow
5. Should redirect to dashboard

### Test in Production
1. Go to: https://your-app.vercel.app/login
2. Click "Sign in with Slack"
3. Complete OAuth flow
4. Should redirect to dashboard

## 5. Verify Session Persistence

After logging in:
1. Refresh the page
2. User should remain logged in
3. Check browser DevTools → Application → Local Storage
4. Look for: `sb-vzhthefdgumjkhnjpydt-auth-token`

## Troubleshooting

### Issue: "Invalid redirect URL"
- **Solution**: Make sure the callback URL in Supabase Dashboard matches exactly what's in Slack App settings

### Issue: "Session not persisting"
- **Solution**: Check that your Supabase client is configured with:
  ```typescript
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  }
  ```
  This is already configured in `composables/useSupabase.ts`

### Issue: "Profile not found"
- **Solution**: The callback page now automatically creates a profile if it doesn't exist

### Debug Mode
To see detailed OAuth flow logs:
1. Open browser DevTools → Console
2. Look for logs starting with `[auth/callback]`
3. Check for any errors in the flow

## Current Implementation Status

✅ Login page with Slack OAuth button
✅ OAuth callback handler with code exchange
✅ PKCE flow enabled
✅ Session persistence enabled
✅ Automatic profile creation
✅ Dark mode UI components

## Next Steps

1. **Configure Slack in Supabase Dashboard** (if not done)
2. **Add callback URL to Slack App**
3. **Test the flow**
4. **Verify session persists after page refresh**

## Support

If you encounter issues:
- Check Supabase logs: https://supabase.com/dashboard/project/vzhthefdgumjkhnjpydt/logs/explorer
- Check Vercel deployment logs: `vercel logs --follow`
- Review browser console for OAuth errors
