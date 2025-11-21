# Google Cloud Console Setup Guide
## Personal Income & Expense Tracker

This guide will walk you through setting up Google Cloud Console to obtain the API credentials needed for your expense tracker application.

---

## Prerequisites
- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create a New Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top of the page (next to "Google Cloud")
   - Click **"NEW PROJECT"**
   - Enter project details:
     - **Project name**: `Expense Tracker` (or your preferred name)
     - **Organization**: Leave as default (if applicable)
   - Click **"CREATE"**
   - Wait for the project to be created (takes a few seconds)

3. **Select Your New Project**
   - Once created, make sure your new project is selected in the project dropdown

---

## Step 2: Enable Required APIs

1. **Navigate to APIs & Services**
   - In the left sidebar, click on **"APIs & Services"** → **"Library"**
   - Or visit: https://console.cloud.google.com/apis/library

2. **Enable Google Sheets API**
   - In the search bar, type: `Google Sheets API`
   - Click on **"Google Sheets API"**
   - Click the **"ENABLE"** button
   - Wait for it to be enabled

3. **Enable Google Drive API** (required for Sheets access)
   - Go back to the API Library
   - Search for: `Google Drive API`
   - Click on **"Google Drive API"**
   - Click the **"ENABLE"** button

---

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
   - Or visit: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**
   - Select **"External"** (for testing with any Google account)
   - Click **"CREATE"**

3. **Fill in App Information**
   - **App name**: `Expense Tracker`
   - **User support email**: Your email address
   - **App logo**: (Optional) Skip for now
   - **Application home page**: Leave blank for now
   - **Authorized domains**: Leave blank for now
   - **Developer contact information**: Your email address
   - Click **"SAVE AND CONTINUE"**

4. **Scopes**
   - Click **"ADD OR REMOVE SCOPES"**
   - Search and add these scopes:
     - `https://www.googleapis.com/auth/spreadsheets` (Google Sheets API)
     - `https://www.googleapis.com/auth/drive.file` (Google Drive API - file access)
     - `https://www.googleapis.com/auth/userinfo.email` (User email)
     - `https://www.googleapis.com/auth/userinfo.profile` (User profile)
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

5. **Test Users** (For External Apps in Testing Mode)
   - Click **"ADD USERS"**
   - Add your Google email address (and any other test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

6. **Review and Complete**
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - In the left sidebar, click **"APIs & Services"** → **"Credentials"**
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `Expense Tracker Web Client`
   
4. **Add Authorized Origins and Redirect URIs**
   - **Authorized JavaScript origins**: 
     - For local development: `http://localhost:5173`
     - For local development: `http://localhost:3000`
     - (We'll add the production URL after deployment)
   
   - **Authorized redirect URIs**:
     - For local development: `http://localhost:5173`
     - For local development: `http://localhost:3000`
     - (We'll add the production URL after deployment)

5. **Create Credentials**
   - Click **"CREATE"**
   - A popup will appear with your credentials

6. **Save Your Credentials** ⚠️ **IMPORTANT**
   - **Client ID**: Copy this (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like: `GOCSPX-xxxxx`)
   - Click **"DOWNLOAD JSON"** to save the credentials file
   - Store these securely - you'll need them for the application

---

## Step 5: Create a Service Account (Optional but Recommended)

For server-side operations with Google Sheets, a service account is useful:

1. **Create Service Account**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"Service account"**

2. **Service Account Details**
   - **Service account name**: `expense-tracker-service`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for Expense Tracker backend operations`
   - Click **"CREATE AND CONTINUE"**

3. **Grant Permissions**
   - **Role**: Select **"Editor"** (or more restrictive based on needs)
   - Click **"CONTINUE"**
   - Click **"DONE"**

4. **Create Service Account Key**
   - Find your newly created service account in the list
   - Click on the service account email
   - Go to the **"KEYS"** tab
   - Click **"ADD KEY"** → **"Create new key"**
   - Select **"JSON"**
   - Click **"CREATE"**
   - A JSON file will be downloaded - **keep this secure!**

---

## Step 6: Prepare Your Credentials

After completing the above steps, you should have:

✅ **OAuth 2.0 Client Credentials**:
   - Client ID (e.g., `123456789.apps.googleusercontent.com`)
   - Client Secret (e.g., `GOCSPX-abcdefghijk`)

✅ **Service Account Credentials** (if created):
   - JSON key file with service account email and private key

✅ **API Access Enabled**:
   - Google Sheets API
   - Google Drive API

---

## Step 7: Test Your Setup

1. **Verify APIs are Enabled**
   - Go to **"APIs & Services"** → **"Enabled APIs & services"**
   - Confirm you see:
     - Google Sheets API
     - Google Drive API

2. **Verify OAuth Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Confirm your OAuth 2.0 Client ID is listed

---

## Next Steps

Once you have your credentials:
1. Keep the **Client ID** and **Client Secret** ready
2. Keep the downloaded JSON files secure
3. Provide these credentials when prompted during application setup

---

## Important Security Notes

⚠️ **DO NOT commit credentials to version control (Git)**
⚠️ **DO NOT share your Client Secret or Service Account keys publicly**
⚠️ **Store credentials securely** (environment variables, secure vaults)

---

## Troubleshooting

### Issue: "Access blocked: This app's request is invalid"
- **Solution**: Make sure you've added your email as a test user in the OAuth consent screen

### Issue: "The OAuth client was not found"
- **Solution**: Ensure you've selected the correct project in Google Cloud Console

### Issue: "API has not been used in project before"
- **Solution**: Make sure you've enabled both Google Sheets API and Google Drive API

---

## Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api)

---

**Ready to proceed?** Once you have your OAuth credentials, we can start building your expense tracker application!
