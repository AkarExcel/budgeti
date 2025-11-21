# Complete Supabase Deployment Instructions

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase account and project created
- Project credentials ready (URL and anon key)

## Step 1: Database Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `/workspace/supabase/migrations/20250101000000_initial_schema.sql`
4. Paste into SQL Editor
5. Click "Run" to execute
6. Verify in Table Editor that all tables were created:
   - profiles
   - categories
   - expenses
   - streaks
   - achievements
   - budgets

### Option B: Via Supabase CLI
```bash
cd /workspace
supabase db push
```

## Step 2: Deploy Edge Functions

### Deploy all 4 functions:

```bash
# 1. Main expense creation function
supabase functions deploy create-expense --project-ref YOUR_PROJECT_REF

# 2. Google Sheets sync function
supabase functions deploy sync-to-sheets --project-ref YOUR_PROJECT_REF

# 3. Push notification function  
supabase functions deploy send-notification --project-ref YOUR_PROJECT_REF

# 4. Cron job for streak reminders
supabase functions deploy check-streak-reminder --project-ref YOUR_PROJECT_REF
```

### Verify deployments:
1. Go to Supabase Dashboard > Edge Functions
2. Confirm all 4 functions appear
3. Check logs for any deployment errors

## Step 3: Set Up Cron Job

### Create cron job for daily streak checks:

Using Supabase Dashboard:
1. Go to Database > Cron Jobs
2. Create new cron job:
   - Name: "Daily Streak Reminder"
   - Schedule: `0 18 * * *` (6 PM daily)
   - Command: `SELECT net.http_post('https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-streak-reminder', '{}'::jsonb, '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb);`

Or via SQL Editor:
```sql
SELECT cron.schedule(
  'daily-streak-reminder',
  '0 18 * * *', -- 6 PM every day
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-streak-reminder',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Step 4: Configure Google OAuth

### In Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `https://YOUR_PROJECT_REF.supabase.co`
     - `https://your-deployed-app.com`
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

### In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google provider
3. Paste Client ID and Client Secret
4. Save

## Step 5: Configure Frontend Environment

Create `/workspace/opay-expense-tracker/.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

## Step 6: Build Frontend

```bash
cd /workspace/opay-expense-tracker
pnpm install
pnpm build
```

Build output will be in `dist/` folder

## Step 7: Deploy Frontend

The dist folder can be deployed to any static hosting:

### Using this platform's deploy tool:
```bash
# Will be handled automatically
```

### Manual deployment options:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **Cloudflare Pages**: `wrangler pages publish dist`
- **GitHub Pages**: Commit dist to gh-pages branch

## Step 8: Update OAuth Redirect URLs

After frontend deployment:
1. Note your deployment URL (e.g., `https://expense-tracker.vercel.app`)
2. Go back to Google Cloud Console > Credentials
3. Edit OAuth 2.0 Client
4. Add to Authorized redirect URIs:
   - `https://your-deployed-url.com/auth/callback`
5. Save

## Step 9: Test End-to-End

### Authentication Test:
- [ ] Visit deployed app
- [ ] Click "Sign in with Google"
- [ ] Verify redirect to Google OAuth
- [ ] Verify redirect back to app
- [ ] Verify dashboard loads

### Expense Entry Test:
- [ ] Click "Add Expense" button
- [ ] Fill form and submit
- [ ] Verify expense appears in recent transactions
- [ ] Check Supabase Database that expense was created
- [ ] Verify streak counter increments

### Voice Entry Test (Chrome/Edge/Safari):
- [ ] Click "Voice Entry" button
- [ ] Grant microphone permissions
- [ ] Say "I spent 50 dollars on groceries"
- [ ] Verify transcript appears
- [ ] Review parsed data
- [ ] Confirm and save
- [ ] Verify expense created

### Gamification Test:
- [ ] Create first expense → Check for "First Entry" achievement
- [ ] Create expenses on 7 consecutive days → Check for "Week Warrior" achievement
- [ ] Verify streak counter updates daily
- [ ] Check achievement modal appears on unlock

### Offline Test:
- [ ] Disable network
- [ ] Create expense
- [ ] Verify queued message
- [ ] Re-enable network
- [ ] Verify auto-sync happens
- [ ] Check expense appears

### Google Sheets Sync Test:
- [ ] Create Google Sheet
- [ ] Get OAuth token from Google OAuth Playground
- [ ] Go to Profile screen
- [ ] Enter Sheet ID and token
- [ ] Click "Sync to Sheets"
- [ ] Verify expenses appear in sheet

## Troubleshooting

### "Invalid authentication token"
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check Supabase project is active
- Verify OAuth provider is enabled

### Edge function errors
- Check function logs in Supabase Dashboard
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
- Test function with "Invoke" button in dashboard

### Voice not working
- Verify HTTPS (required for Web Speech API)
- Check browser is Chrome/Edge/Safari
- Grant microphone permissions
- Check browser console for errors

### Streak not updating
- Verify create-expense function deployed successfully
- Check function logs for errors
- Verify RLS policies allow reading/writing streaks table

### Cron job not running
- Verify cron job created successfully
- Check cron logs in Database > Cron Jobs
- Verify check-streak-reminder function is deployed
- Test function manually first

## Security Checklist

- [ ] Environment variables not in git
- [ ] RLS policies enabled on all tables
- [ ] Google OAuth redirect URIs restricted
- [ ] HTTPS enabled in production
- [ ] Service role key never exposed to frontend
- [ ] API keys restricted to specific domains

## Monitoring

### Check Supabase Dashboard regularly:
- Auth: User sign-ins and sessions
- Database: Query performance
- Edge Functions: Invocation count and errors
- API: Usage and rate limits

### Set up alerts for:
- High error rates
- Unusual authentication patterns
- API quota approaching limits
- Edge function failures

## Next Steps After Deployment

1. **User Testing**: Invite beta users
2. **Monitor Metrics**: Track usage and errors
3. **Gather Feedback**: User experience insights
4. **Iterate**: Add features based on feedback
5. **Scale**: Upgrade Supabase plan as needed

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Edge Functions Guide: https://supabase.com/docs/guides/functions
- Auth Guide: https://supabase.com/docs/guides/auth
- Database Guide: https://supabase.com/docs/guides/database
