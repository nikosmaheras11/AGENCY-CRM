# Slack SSO Login Setup Guide

This guide explains how to set up Slack Single Sign-On (SSO) for your Agency Dashboard OS.

## Overview

The Slack SSO integration allows users to:
- ✅ Sign in with their Slack account
- ✅ Automatically create a profile linked to their Slack ID
- ✅ See mentions in the dashboard
- ✅ Access all dashboard features

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Slack OAuth │────▶│   Callback  │
│             │     │              │     │   Handler   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │  Supabase    │
                                         │  - Auth      │
                                         │  - Profile   │
                                         └──────────────┘
```

## Step 1: Configure Slack App

### 1.1 Create or Update Your Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your existing app or create a new one
3. Note your **Client ID** and **Client Secret** (Basic Information page)

### 1.2 Configure OAuth & Permissions

Navigate to **OAuth & Permissions** in your Slack app settings:

**Redirect URLs:**
Add these redirect URLs:
- Development: `http://localhost:3000/api/auth/slack/callback`
- Production: `https://yourdomain.com/api/auth/slack/callback`

**User Token Scopes:**
Add these scopes for user authentication:
- `identity.basic` - View user's basic profile
- `identity.email` - View user's email
- `identity.avatar` - View user's avatar

**Bot Token Scopes** (for message monitoring):
- `channels:history` - View messages in public channels
- `channels:read` - View basic channel information  
- `groups:history` - View messages in private channels (optional)
- `users:read` - View user information
- `chat:write` - Send messages

### 1.3 Enable Socket Mode (for message monitoring)

1. Navigate to **Socket Mode** in app settings
2. Enable Socket Mode
3. Generate an app-level token with `connections:write` scope
4. Save the token as `SLACK_APP_TOKEN`

### 1.4 Install App to Workspace

1. Click **Install to Workspace**
2. Review permissions and authorize
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

## Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# Slack OAuth Configuration
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret

# Slack Bot Configuration (for message monitoring)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Site Configuration
SITE_URL=http://localhost:3000  # Change for production
```

## Step 3: Database Setup

The SSO system uses the existing `profiles` table. Ensure it has these fields:

```sql
-- The profiles table should already have these fields from the main schema:
-- id (UUID) - Primary key, references auth.users
-- slack_id (TEXT) - Slack user ID (unique)
-- first_name (TEXT)
-- last_name (TEXT)
-- avatar_url (TEXT)
-- slack_access_token (TEXT) - OAuth access token
-- created_at (TIMESTAMPTZ)
-- updated_at (TIMESTAMPTZ)

-- Verify the unique index exists:
CREATE UNIQUE INDEX IF NOT EXISTS profiles_slack_id_idx 
ON profiles(slack_id) WHERE slack_id IS NOT NULL;
```

## Step 4: Testing the Integration

### Local Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click **Sign in with Slack**

4. You'll be redirected to Slack for authorization

5. After authorizing, you'll be redirected back and logged in

### Verify in Supabase

After signing in, check your Supabase dashboard:

1. **Auth** → **Users**: You should see a new user
2. **Table Editor** → **profiles**: You should see a profile with `slack_id` populated

## Step 5: Production Deployment

### Environment Variables

In your production environment (Vercel, Netlify, etc.), set:

```bash
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SITE_URL=https://yourdomain.com
```

### Slack App Configuration

Update your Slack app's redirect URL to your production URL:
- `https://yourdomain.com/api/auth/slack/callback`

## How It Works

### OAuth Flow

1. **User clicks "Sign in with Slack"**
   - Browser redirects to Slack OAuth page
   - User authorizes the app

2. **Slack redirects back with authorization code**
   - `/api/auth/slack/callback` receives the code

3. **Server exchanges code for access token**
   - Makes request to `slack.com/api/oauth.v2.access`
   - Receives user's access token

4. **Server fetches user info from Slack**
   - Makes request to `slack.com/api/users.info`
   - Gets user's profile data

5. **Server creates/updates Supabase user**
   - Checks if profile with `slack_id` exists
   - Creates new user if not exists
   - Updates profile data if exists

6. **Server creates session**
   - Generates Supabase auth session
   - Sets secure HTTP-only cookies
   - Redirects to dashboard

### Security Features

- ✅ **HTTP-only cookies** - Session tokens not accessible via JavaScript
- ✅ **State parameter** - CSRF protection in OAuth flow
- ✅ **Secure flag** - Cookies only sent over HTTPS in production
- ✅ **SameSite** - Protection against CSRF attacks
- ✅ **Service key isolation** - Only used server-side

## Customization

### Change Redirect After Login

Edit `/server/api/auth/slack/callback.ts`:

```typescript
// Line 149 - Change redirect destination
return sendRedirect(event, '/your-custom-page')
```

### Add Additional Slack Scopes

If you need more user data, add scopes in `/pages/login.vue`:

```typescript
// Line 137
slackAuthUrl.searchParams.append('user_scope', 'identity.basic,identity.email,identity.avatar,identity.team')
```

### Custom Error Handling

Add custom error messages in `/pages/login.vue`:

```typescript
// Line 116-124
const errorMessages: Record<string, string> = {
  'slack_auth_failed': 'Your custom message here',
  // ... other error messages
}
```

## Troubleshooting

### "Invalid redirect_uri" Error

**Problem**: Slack shows error about invalid redirect URI

**Solution**:
- Verify redirect URL matches exactly in Slack app settings
- Check for trailing slashes
- Ensure protocol matches (http vs https)

### "User creation failed" Error

**Problem**: Cannot create user in Supabase

**Solution**:
- Verify `SUPABASE_SERVICE_KEY` is set correctly
- Check Supabase Auth settings allow email confirmation
- Ensure profiles table has correct schema

### Users Can't See Mentions

**Problem**: User logged in but can't see mentions in dashboard

**Solution**:
- Verify `slack_id` is stored in profiles table
- Check message monitor worker is running
- Ensure user has been mentioned in monitored channels

### Session Not Persisting

**Problem**: User gets logged out on page refresh

**Solution**:
- Check cookies are being set correctly
- Verify `SITE_URL` matches your actual domain
- Ensure cookies aren't being blocked by browser

## API Reference

### `POST /api/auth/slack/callback`

Handles OAuth callback from Slack.

**Query Parameters:**
- `code` (string) - Authorization code from Slack
- `error` (string, optional) - Error if authorization failed

**Returns:**
- Redirect to `/dashboard` on success
- Redirect to `/?error=xxx` on failure

**Errors:**
- `slack_auth_failed` - User denied authorization
- `no_code` - No authorization code received
- `token_exchange_failed` - Failed to exchange code for token
- `user_info_failed` - Failed to get user info from Slack
- `user_creation_failed` - Failed to create Supabase user
- `session_creation_failed` - Failed to create session
- `unexpected_error` - Unknown error occurred

## Next Steps

1. **Customize the login page** - Update branding, colors, copy
2. **Add email fallback** - Implement traditional email/password login
3. **Set up team management** - Create admin interface for managing users
4. **Configure workspace** - Set up Slack channels and permissions
5. **Monitor usage** - Track login analytics and user activity

## Support

For issues:
1. Check Slack app configuration at [api.slack.com/apps](https://api.slack.com/apps)
2. Verify environment variables are set correctly
3. Check Supabase dashboard for auth errors
4. Review server logs for detailed error messages

---

**Congratulations!** 🎉 Your Slack SSO integration is now complete!
