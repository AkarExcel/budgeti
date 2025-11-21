-- Migration: add_income_expense_type
-- Created at: 1762205355

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' 
  CHECK (type IN ('expense', 'income'));
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
UPDATE expenses SET type = 'expense' WHERE type IS NULL;;