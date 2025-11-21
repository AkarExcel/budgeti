-- Migration: Add income tracking support
-- Description: Extends expenses table to support both income and expense transactions

-- Step 1: Add transaction type column
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income'));

-- Step 2: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Step 3: Update existing records to be 'expense' by default
UPDATE expenses SET type = 'expense' WHERE type IS NULL;

-- Step 4: Add income categories (will be inserted via application logic for each user)
-- Categories: Salary/Wages, Freelance, Business Income, Investment Returns, 
--            Rental Income, Gifts/Bonuses, Refunds, Other Income
