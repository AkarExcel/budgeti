# Quick Start: Get Google OAuth Credentials

## Step-by-Step Guide (10 minutes)

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" at the top
4. Click "NEW PROJECT"

### Step 2: Create a New Project
1. **Project name**: "OPay Expense Tracker" (or any name you prefer)
2. **Organization**: Leave as default
3. Click "CREATE"
4. Wait for the project to be created (~30 seconds)
5. Select your newly created project from the dropdown

### Step 3: Enable Google Sheets API
1. In the left sidebar, go to **"APIs & Services" → "Library"**
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click the "ENABLE" button
5. Wait for confirmation (~5 seconds)

### Step 4: Configure OAuth Consent Screen
1. Go to **"APIs & Services" → "OAuth consent screen"** (left sidebar)
2. Select **"External"** user type
3. Click "CREATE"

4. **Fill in App Information**:
   - **App name**: OPay Expense Tracker
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - Leave other fields as default
   - Click "SAVE AND CONTINUE"

5. **Scopes** (Step 2):
   - Click "ADD OR REMOVE SCOPES"
   - In the filter box, type: `spreadsheets`
   - Check the box for: `https://www.googleapis.com/auth/spreadsheets`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

6. **Test users** (Step 3):
   - Click "ADD USERS"
   - Add your email address (for testing)
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

7. **Summary** (Step 4):
   - Review and click "BACK TO DASHBOARD"

### Step 5: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services" → "Credentials"** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth 2.0 Client ID"**

4. If prompted to configure consent screen, you've already done this in Step 4

5. **Configure OAuth Client**:
   - **Application type**: Web application
   - **Name**: OPay Expense Tracker Web Client
   
6. **Authorized redirect URIs**:
   - Click "ADD URI"
   - Paste: `https://72ow33a3v26m.space.minimax.io/auth/google/callback`
   - Click "CREATE"

7. **Copy Your Credentials**:
   - A popup will appear with your Client ID and Client Secret
   - **IMPORTANT**: Copy both values immediately
   - Client ID format: `xxxxx.apps.googleusercontent.com`
   - Client Secret format: `GOCSPX-xxxxx`

### Step 6: Save Your Credentials

Copy these values:

```
GOOGLE_CLIENT_ID=<paste your Client ID here>
GOOGLE_CLIENT_SECRET=<paste your Client Secret here>
```

Example:
```
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghij
```

## Troubleshooting

### "OAuth consent screen configuration required"
- Complete Step 4 first before creating credentials

### "Redirect URI mismatch" error during testing
- Verify you added exactly: `https://72ow33a3v26m.space.minimax.io/auth/google/callback`
- No trailing slashes, exact match required

### Can't find Google Sheets API
- Make sure you're in the correct project (check dropdown at top)
- Refresh the Library page

### Test user restrictions
- For development, add your email as a test user in OAuth consent screen
- For production, publish the app (not required for testing)

## What Happens Next

Once you provide the credentials, we will:
1. Configure them in Supabase as environment secrets
2. Test the complete OAuth flow
3. Verify expense data syncs to Google Sheets
4. Confirm all features work end-to-end

## Security Notes

- These credentials allow your application to request access to users' Google Sheets
- They do NOT give you access to user data directly
- Users must explicitly authorize the app during OAuth flow
- Users can revoke access at any time from their Google Account settings
- Credentials are stored securely in Supabase environment variables

---

**Ready?** Once you have your Client ID and Client Secret, provide them to complete the setup!
