-- Migration: add_google_oauth_fields_to_profiles
-- Created at: 1762086847

-- Add Google OAuth fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS google_sheets_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_time TIMESTAMP WITH TIME ZONE;;