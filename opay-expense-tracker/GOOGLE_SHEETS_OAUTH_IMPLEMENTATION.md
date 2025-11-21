# Google Sheets OAuth Integration - Setup Guide

## Overview

The OPay Expense Tracker now includes secure Google Sheets synchronization with OAuth 2.0 authentication. Users can connect their Google account with a single click and sync their expense data to Google Sheets for advanced reporting and analysis.

## Features Implemented

### 1. OAuth Authentication Flow
- Secure Google OAuth 2.0 integration
- Token storage in Supabase database
- Automatic token refresh when expired
- Minimal OAuth scope (sheets only)

### 2. Profile UI Integration
- Google Sheets section in Profile settings
- Connection status indicator (Connected/Not Connected)
- Dynamic button states:
  - **Before Connection**: "Connect Google Account" button
  - **After Connection**: "Sync Now" button with last sync time
- Disconnect option available when connected

### 3. Sync Functionality
- Export all expense data to Google Sheets
- Automatic spreadsheet creation: "OPay Expenses - [User's Email]"
- Data format: Date | Amount | Category | Merchant | Notes | Currency
- Formatted headers (bold, gray background)
- Updates last sync time after successful sync

### 4. Security & Privacy
- Secure token storage in Supabase
- Minimal OAuth scopes (spreadsheets only)
- Token expiration handling with automatic refresh
- Users can revoke access anytime via "Disconnect" button

## Database Schema Updates

Added the following fields to the `profiles` table:

```sql
- google_access_token: TEXT (stores OAuth access token)
- google_refresh_token: TEXT (stores OAuth refresh token for token renewal)
- google_token_expires: TIMESTAMP WITH TIME ZONE (token expiration time)
- google_sheets_id: TEXT (stores created spreadsheet ID)
- last_sync_time: TIMESTAMP WITH TIME ZONE (tracks last successful sync)
```

## Edge Functions Deployed

### 1. google-auth-initiate
- **Purpose**: Generates Google OAuth authorization URL
- **Endpoint**: `https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/google-auth-initiate`
- **Method**: POST
- **Returns**: OAuth authorization URL for user redirect

### 2. google-auth-callback
- **Purpose**: Handles OAuth callback and exchanges code for tokens
- **Endpoint**: `https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/google-auth-callback`
- **Method**: POST
- **Input**: `{ code: string }` (authorization code from Google)
- **Action**: Stores access and refresh tokens in user's profile

### 3. google-sheets-sync
- **Purpose**: Syncs user's expenses to Google Sheets
- **Endpoint**: `https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/google-sheets-sync`
- **Method**: POST
- **Actions**:
  - Checks and refreshes expired tokens
  - Creates new spreadsheet (if first sync)
  - Exports all expense data with formatting
  - Updates last sync time

### 4. google-disconnect
- **Purpose**: Disconnects Google account and removes tokens
- **Endpoint**: `https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/google-disconnect`
- **Method**: POST
- **Action**: Clears all Google OAuth data from user's profile

## Google OAuth Configuration Required

To enable this feature, you need to configure Google OAuth credentials:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**

### Step 2: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in application details:
   - App name: "OPay Expense Tracker"
   - Support email: Your email
   - Authorized domains: `minimax.io`
4. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
5. Add test users (optional for development)

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "OPay Expense Tracker Web Client"
5. Authorized redirect URIs:
   - `https://72ow33a3v26m.space.minimax.io/auth/google/callback`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Supabase Environment Variables

Add the following secrets to your Supabase project:

```bash
# In Supabase Dashboard → Settings → Edge Functions → Secrets

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://72ow33a3v26m.space.minimax.io/auth/google/callback
```

**Note**: Replace placeholder values in the edge functions with actual credentials.

## User Flow

### Connecting Google Account

1. User navigates to Profile → Google Sheets section
2. Clicks "Connect Google Account" button
3. Popup window opens with Google OAuth consent screen
4. User authorizes access to Google Sheets
5. Google redirects to callback URL with authorization code
6. Callback page sends code to parent window via `postMessage`
7. Frontend calls `google-auth-callback` edge function
8. Edge function exchanges code for tokens and stores in database
9. UI updates to show "Connected" status with "Sync Now" button

### Syncing Data

1. User clicks "Sync Now" button
2. Frontend calls `google-sheets-sync` edge function
3. Edge function:
   - Checks token validity (refreshes if expired)
   - Fetches all user's expenses from database
   - Creates spreadsheet (first sync) or updates existing
   - Formats data with headers
   - Updates last sync time
4. Success message shows number of synced expenses
5. Optional: Opens Google Sheet in new tab

### Disconnecting

1. User clicks "Disconnect" button
2. Confirmation dialog appears
3. Frontend calls `google-disconnect` edge function
4. Edge function clears all Google OAuth data
5. UI returns to "Connect Google Account" state

## Data Export Format

Expenses are exported to Google Sheets with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Date | Expense date | 2025-01-15 |
| Amount | Expense amount | 45.00 |
| Category | Expense category | Food |
| Merchant | Merchant name | Starbucks |
| Notes | Additional notes | Coffee |
| Currency | Currency code | NGN |

### Formatting Applied

- **Headers**: Bold text with light gray background (#E5E5E5)
- **Data**: Standard formatting, left-aligned
- **Sheet Name**: "Expenses"

## Technical Implementation Details

### Frontend Components

**ProfileScreen.tsx** (Updated)
- Added Google Sheets section with OAuth UI
- State management for connection status
- OAuth popup window handling
- Message listener for OAuth callback
- Functions: `handleConnectGoogle()`, `handleSyncNow()`, `handleDisconnect()`

**GoogleOAuthCallback.tsx** (New)
- Handles OAuth redirect from Google
- Extracts authorization code from URL
- Sends code to parent window via `postMessage`
- Auto-closes popup after successful communication

**App.tsx** (Updated)
- Added route: `/auth/google/callback` → `GoogleOAuthCallback` component

### State Management

The profile state is updated after successful operations:
- After connecting: Tokens and connection status updated
- After syncing: Last sync time updated
- After disconnecting: All Google OAuth fields cleared

### Error Handling

All edge functions include comprehensive error handling:
- Invalid tokens
- Expired tokens (automatic refresh)
- API failures
- Network errors
- User feedback via alerts and UI states

## Testing

### Manual Testing Steps

1. **Connect Google Account**
   - Navigate to Profile → Google Sheets
   - Click "Connect Google Account"
   - Authorize in popup window
   - Verify "Connected" status appears

2. **Sync Data**
   - Click "Sync Now" button
   - Verify success message
   - Check Google Sheets for exported data
   - Verify last sync time displays correctly

3. **Disconnect**
   - Click "Disconnect" button
   - Confirm action
   - Verify UI returns to "Connect" state
   - Check database: tokens should be cleared

### Database Verification

```sql
-- Check user's Google connection status
SELECT 
  id,
  google_access_token IS NOT NULL as has_access_token,
  google_refresh_token IS NOT NULL as has_refresh_token,
  google_sheets_id,
  last_sync_time
FROM profiles
WHERE id = 'user-id-here';
```

## Current Status

- **Database Migration**: ✅ Applied
- **Edge Functions**: ✅ Deployed (4 functions, version 3 with correct redirect URIs)
- **Frontend UI**: ✅ Implemented
- **OAuth Flow**: ✅ Complete (ready for credentials)
- **Deployment**: ✅ Live at https://72ow33a3v26m.space.minimax.io
- **End-to-End Testing**: ⚠️ Awaiting OAuth credentials

## Quick Start Guide

For step-by-step instructions on obtaining Google OAuth credentials, see:
**[GET_OAUTH_CREDENTIALS.md](./GET_OAUTH_CREDENTIALS.md)**

The guide includes:
- Complete Google Cloud Console setup (10 minutes)
- Screenshot-friendly instructions
- Troubleshooting tips
- What to do with the credentials once obtained

## Next Steps (Required for Production)

1. **Configure Google OAuth Credentials**
   - Create Google Cloud project
   - Set up OAuth consent screen
   - Generate Client ID and Secret
   - Add credentials to Supabase secrets

2. **Update Edge Functions**
   - Replace placeholder credentials with actual values
   - Redeploy edge functions if needed

3. **Test End-to-End**
   - Test complete OAuth flow
   - Verify token refresh works
   - Test sync with real expense data
   - Test disconnect functionality

## Security Considerations

- Tokens are stored securely in Supabase database
- Access tokens have limited lifetime (1 hour)
- Refresh tokens enable automatic renewal
- Minimal OAuth scope (only spreadsheets access)
- Users can revoke access at any time
- HTTPS enforced for all OAuth communications

## Troubleshooting

### Issue: OAuth Popup Blocked
**Solution**: Ensure popup blockers are disabled for the site

### Issue: "Google account not connected" error when syncing
**Solution**: Reconnect Google account (tokens may have expired or been revoked)

### Issue: Token refresh fails
**Solution**: Disconnect and reconnect to obtain new tokens

### Issue: Spreadsheet not created
**Solution**: Check Google Sheets API is enabled in Google Cloud Console

## Support

For issues or questions, check:
- Edge function logs in Supabase Dashboard
- Browser console for frontend errors
- Network tab for failed API requests

---

**Implementation Date**: 2025-11-02  
**Deployed URL**: https://72ow33a3v26m.space.minimax.io  
**Developer**: MiniMax Agent
