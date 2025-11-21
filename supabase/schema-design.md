# Database Schema Design - OPay Expense Tracker

## Tables Overview

### 1. profiles
Extends Supabase auth.users with app-specific user data
- id (uuid, PK, references auth.users)
- currency (text, default 'USD')
- monthly_budget (decimal)
- notification_preferences (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

### 2. categories
User-specific expense categories
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- name (text)
- icon (text) - icon identifier from Lucide
- color (text) - hex color code
- is_default (boolean) - system default categories
- created_at (timestamp)

### 3. expenses
Core expense tracking
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- date (date)
- amount (decimal)
- currency (text)
- category_id (uuid, FK to categories)
- merchant (text, nullable)
- notes (text, nullable)
- source (text) - 'voice' or 'typed'
- idempotency_key (text, unique) - for offline sync
- sheet_sync_status (text) - 'pending', 'synced', 'error'
- created_at (timestamp)
- updated_at (timestamp)

### 4. streaks
Gamification - tracking logging streaks
- id (uuid, PK)
- user_id (uuid, FK to auth.users, unique)
- current_streak (integer, default 0)
- longest_streak (integer, default 0)
- last_logged_date (date, nullable)
- updated_at (timestamp)

### 5. achievements
Gamification - unlocked achievements
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- achievement_type (text) - 'first_week', 'month_master', 'century_club', etc.
- unlocked_at (timestamp)
- unique(user_id, achievement_type)

### 6. budgets
Monthly budget limits by category
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- category_id (uuid, FK to categories, nullable) - null means overall budget
- monthly_limit (decimal)
- created_at (timestamp)
- updated_at (timestamp)
- unique(user_id, category_id)

## Indexes
- expenses: (user_id, date DESC)
- expenses: (user_id, category_id)
- expenses: (idempotency_key)
- categories: (user_id)
- achievements: (user_id, unlocked_at)

## RLS Policies
All tables use Row Level Security with user_id matching auth.uid()
