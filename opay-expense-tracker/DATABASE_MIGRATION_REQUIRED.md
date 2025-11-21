# Database Migration Instructions for Income Tracking

## IMPORTANT: Manual Migration Required

Due to Supabase access token expiration, the database migration needs to be run manually through the Supabase dashboard.

## Migration URL
https://supabase.com/dashboard/project/fpjvwyaysvcklojntggf/editor

## SQL to Execute

```sql
-- Step 1: Add transaction type column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' 
CHECK (type IN ('expense', 'income'));

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Step 3: Update existing records to be 'expense' by default
UPDATE expenses 
SET type = 'expense' 
WHERE type IS NULL;
```

## Verification Query

After running the migration, verify it worked:

```sql
-- Check if column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'type';

-- Check if index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'expenses' AND indexname = 'idx_expenses_type';

-- Check existing data
SELECT type, COUNT(*) as count 
FROM expenses 
GROUP BY type;
```

## Expected Results

1. Column `type` should exist with default value 'expense'
2. Index `idx_expenses_type` should exist
3. All existing records should have `type = 'expense'`

## After Migration

Once the migration is complete, the following features will work fully:

1. Income entry via manual form toggle
2. Income entry via voice recognition
3. Separate income/expense calculations on dashboard
4. Transaction type indicators in transaction list
5. Net income calculation (income - expenses)

## Alternative: Edge Function Migration

If SQL editor access is unavailable, you can use the edge function:

```bash
# Deploy the migration edge function
cd supabase/functions/migrate-income-tracking
# Then call it once via HTTP POST
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/migrate-income-tracking \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]"
```

## Status

- ✅ Frontend code deployed and ready
- ⚠️ Database migration pending
- 📝 Migration SQL prepared and documented
- 🔐 Waiting for Supabase access token refresh
