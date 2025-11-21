# Deployment Guide - OPay Expense Tracker

## Overview

This guide walks through deploying the complete expense tracker application including backend (Supabase) and frontend (React).

## Prerequisites

- Supabase account and project
- Google Cloud Console account (for OAuth)
- Node.js 18+ and pnpm installed

## Part 1: Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key from Project Settings > API

### Step 2: Deploy Database Schema

1. In Supabase Dashboard, go to SQL Editor
2. Copy the contents of `/supabase/migrations/20250101000000_initial_schema.sql`
3. Execute the SQL to create tables, policies, and indexes
4. Verify tables were created in Table Editor

### Step 3: Configure Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: Add `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

6. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

### Step 4: Deploy Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd /workspace
   supabase link --project-ref your-project-ref
   ```

4. Deploy the edge function:
   ```bash
   supabase functions deploy create-expense
   ```

5. Verify deployment in Supabase Dashboard > Edge Functions

## Part 2: Frontend Deployment

### Step 1: Configure Environment Variables

1. In `/workspace/opay-expense-tracker`, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 2: Build the Application

```bash
cd /workspace/opay-expense-tracker
pnpm install
pnpm build
```

The production build will be in `/workspace/opay-expense-tracker/dist`

### Step 3: Deploy to Web Server

The `dist` folder can be deployed to any static hosting service:

**Option A: Deploy via this platform**
```bash
# Will deploy the dist directory automatically
```

**Option B: Manual deployment**
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Any static host: Upload `dist` folder contents

### Step 4: Configure OAuth Redirect URLs

After deployment, update Google OAuth settings:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add authorized redirect URIs:
   - `https://your-deployed-url.com/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`

## Part 3: Testing

### Test Checklist

1. **Authentication**
   - [ ] Google sign-in works
   - [ ] User profile is created
   - [ ] Session persists on refresh

2. **Expense Entry**
   - [ ] Manual entry creates expense
   - [ ] Voice entry works (on supported browsers)
   - [ ] Offline queue works
   - [ ] Streak is updated

3. **Data Display**
   - [ ] Dashboard shows expenses
   - [ ] Streak counter displays
   - [ ] Recent transactions load

4. **Gamification**
   - [ ] First entry achievement unlocks
   - [ ] 7-day streak achievement works
   - [ ] Achievement modal displays

## Part 4: Optional Features

### Google Sheets Integration

To enable Google Sheets mirroring:

1. Create a Google Sheets API key in Cloud Console
2. Add to `.env`:
   ```env
   VITE_GOOGLE_SHEETS_API_KEY=your-sheets-api-key
   ```
3. Deploy additional edge function for sheets sync

### Push Notifications

To enable push notifications:

1. Set up Firebase Cloud Messaging
2. Add Firebase config to frontend
3. Implement notification edge functions

## Troubleshooting

### Issue: "Supabase is not configured"

**Solution**: Ensure `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Issue: Google OAuth fails

**Solution**: 
- Verify redirect URIs match exactly
- Check Google OAuth consent screen is configured
- Ensure Google+ API is enabled

### Issue: Voice input not working

**Solution**:
- Use Chrome, Edge, or Safari browser
- Grant microphone permissions
- Check for HTTPS (required for Web Speech API)

### Issue: Database errors

**Solution**:
- Verify migration was executed successfully
- Check RLS policies are enabled
- Ensure user is authenticated

## Monitoring

### Supabase Dashboard

Monitor your application in Supabase Dashboard:
- **Database**: Check tables and query performance
- **Auth**: View user sign-ins and sessions
- **Edge Functions**: Monitor function invocations and logs
- **API**: Track API usage and rate limits

### Error Logging

Check browser console and Supabase logs for errors:
```javascript
// Frontend errors appear in browser console
// Backend errors in Supabase > Edge Functions > Logs
```

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] RLS policies enabled on all tables
- [ ] Google OAuth redirect URIs restricted
- [ ] HTTPS enabled in production
- [ ] API keys restricted to specific domains
- [ ] Regular security updates applied

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure CDN caching
- [ ] Optimize images (already using SVG icons)
- [ ] Enable Supabase Connection Pooling
- [ ] Monitor database query performance

## Support

For issues:
1. Check browser console for frontend errors
2. Check Supabase logs for backend errors
3. Review technical architecture: `/docs/architecture/technical-architecture.md`
4. Review design spec: `/docs/design-specification.md`

## Backup and Recovery

### Database Backups

Supabase provides automatic backups. To manually backup:
```sql
-- Export expenses
SELECT * FROM expenses;

-- Export user data
SELECT * FROM profiles;
```

### Restore from Backup

1. In Supabase Dashboard, go to Database > Backups
2. Select backup date
3. Click "Restore"

## Scaling Considerations

As your app grows:
- Monitor Supabase usage limits
- Consider upgrading Supabase plan
- Optimize database indexes
- Implement data archiving for old expenses
- Add caching layer if needed

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Invite beta users
3. Monitor error rates and performance
4. Gather user feedback
5. Iterate on features based on usage patterns
