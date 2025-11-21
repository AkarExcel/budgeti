// Type definitions for the expense tracker application

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  currency: string;
  monthly_budget: number | null;
  notification_preferences: Record<string, boolean>;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expires: string | null;
  google_sheets_id: string | null;
  last_sync_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  currency: string;
  category_id: string | null;
  category?: Category;
  merchant: string | null;
  notes: string | null;
  source: 'voice' | 'typed';
  type: 'expense' | 'income';
  idempotency_key: string | null;
  sheet_sync_status: 'pending' | 'synced' | 'error';
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_logged_date: string | null;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
}

export type AchievementType =
  | 'first_entry'
  | 'first_week'
  | 'month_master'
  | 'century_club'
  | 'budget_boss';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category_id: string;
  merchant: string;
  notes: string;
  source: 'voice' | 'typed';
  type: 'expense' | 'income';
}

export interface ExpenseData {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface VoiceExpenseData {
  amount: number | null;
  category: string | null;
  merchant: string | null;
  notes: string | null;
  type: 'expense' | 'income';
  raw_transcript: string;
}

export interface CreateExpenseResponse {
  expense: Expense;
  streak: Streak;
  achievements_unlocked: AchievementType[];
}
