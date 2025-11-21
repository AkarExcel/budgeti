# Manual Testing Guide - AI Voice Parser

## Prerequisites

Before testing, ensure:
- [ ] Database migration completed (type column exists)
- [ ] OpenAI API key provided
- [ ] Edge function deployed
- [ ] Frontend deployed at https://8rn5edppono5.space.minimax.io

## Database Migration Verification

### Step 1: Check Type Column Exists

Run in Supabase SQL Editor:
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'type';
```

**Expected Result**:
```
column_name | data_type | column_default | is_nullable
type        | text      | 'expense'::text| NO
```

### Step 2: Check Index Exists

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'expenses' AND indexname = 'idx_expenses_type';
```

**Expected Result**:
```
indexname          | indexdef
idx_expenses_type  | CREATE INDEX idx_expenses_type ON public.expenses USING btree (type)
```

### Step 3: Check Existing Data

```sql
SELECT type, COUNT(*) as count 
FROM expenses 
GROUP BY type;
```

**Expected Result**:
```
type    | count
expense | [number of existing records]
```

---

## Edge Function Testing

### Test 1: Edge Function Deployed

Check if function is accessible:
```bash
curl -X OPTIONS https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser
```

**Expected**: HTTP 200 response with CORS headers

### Test 2: Simple Expense

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"transcript": "spent 20 on lunch"}'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "type": "expense",
    "amount": 20,
    "category": "food",
    "merchant": null,
    "notes": "lunch",
    "raw_transcript": "spent 20 on lunch",
    "ai_processed": true
  }
}
```

### Test 3: Complex Expense

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"transcript": "paid 45 dollars for groceries at Walmart yesterday"}'
```

**Expected**:
- type: "expense"
- amount: 45
- category: "food"
- merchant: "Walmart"

### Test 4: Simple Income

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"transcript": "earned 500 from freelance"}'
```

**Expected**:
- type: "income"
- amount: 500
- category: "freelance"

### Test 5: Complex Income

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"transcript": "received 2000 salary from Acme Corp today"}'
```

**Expected**:
- type: "income"
- amount: 2000
- category: "salary"
- merchant: "Acme Corp"

### Automated Test Suite

Run all tests:
```bash
cd /workspace/opay-expense-tracker
./test-ai-parser.sh
```

---

## Frontend Integration Testing

### Test 1: Login

1. Open https://8rn5edppono5.space.minimax.io
2. Click "Sign Up" or "Login"
3. Enter credentials and login
4. Verify you reach the dashboard

**Expected**: Successful login, dashboard loads

### Test 2: Voice Entry - Simple Expense

1. Click microphone icon (Voice Entry)
2. Click the red recording button
3. Say: "I spent 20 dollars on lunch"
4. Wait for processing (AI icon should show)
5. Review parsed data

**Expected**:
- Type badge shows "Expense" (red)
- Amount: 20
- Category: food (or similar)
- AI processing indicator shown

### Test 3: Voice Entry - Complex Expense

1. Click microphone icon
2. Start recording
3. Say: "paid 45 dollars for groceries at Walmart yesterday"
4. Wait for AI processing
5. Review results

**Expected**:
- Type: Expense
- Amount: 45
- Category: food
- Merchant: Walmart
- All fields auto-populated

### Test 4: Voice Entry - Income

1. Click microphone icon
2. Start recording
3. Say: "I earned 500 dollars from freelance work"
4. Wait for processing
5. Review results

**Expected**:
- Type badge shows "Income" (green)
- Amount: 500
- Category: freelance
- Can see "Source" field instead of "Merchant"

### Test 5: Voice Entry - Complex Income

1. Click microphone icon
2. Start recording
3. Say: "received 2000 salary from Acme Corporation today"
4. Wait for AI processing
5. Review and save

**Expected**:
- Type: Income
- Amount: 2000
- Category: salary
- Source: Acme Corporation
- Transaction saves successfully

### Test 6: Dashboard Display

After creating transactions:

1. Go to dashboard
2. Check Net Income card
3. Check Income summary (green card)
4. Check Expense summary (red card)
5. Check transaction list

**Expected**:
- Net Income = Total Income - Total Expenses
- Income card shows only income transactions
- Expense card shows only expense transactions
- Transaction list shows type badges
- Green/red color coding correct

### Test 7: Transaction List

1. Scroll to "Recent Transactions"
2. Check each transaction

**Expected**:
- Income transactions have green badge
- Expense transactions have red badge
- Amounts show +/- prefix
- Green amounts for income, red for expenses
- Up to 10 transactions displayed

### Test 8: Dark Mode

1. Go to Profile
2. Toggle to Dark mode
3. Return to dashboard
4. Check all UI elements

**Expected**:
- Net Income card readable
- Income/Expense cards visible
- Type badges contrast well
- Transaction list readable
- No broken styling

### Test 9: Manual Entry Toggle

1. Click "Add Expense" button (shows "Add Transaction")
2. Check toggle buttons
3. Click "Income" (should turn green)
4. Click "Expense" (should turn red)
5. Notice label changes

**Expected**:
- Toggle works smoothly
- Colors change correctly
- "Merchant" → "Source" when Income selected
- Save button color matches type

### Test 10: Fallback Mechanism

1. Disconnect internet
2. Try voice entry
3. Say: "spent 30 on coffee"
4. Observe behavior

**Expected**:
- AI call fails (network error)
- Automatically falls back to keyword matching
- Transaction still created
- No user-visible error
- Works with reduced accuracy

---

## Performance Testing

### Test 1: AI Response Time

Measure time from voice end to parsed result:
- **Target**: < 3 seconds
- **Acceptable**: 3-5 seconds
- **Slow**: > 5 seconds

### Test 2: Fallback Response Time

Measure with AI disabled:
- **Target**: < 100ms
- **Expected**: Instant

### Test 3: Multiple Rapid Entries

Create 5 transactions in quick succession:
- Should all process correctly
- No rate limiting issues
- No errors

---

## Error Handling Tests

### Test 1: Empty Transcript

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"transcript": ""}'
```

**Expected**: 400 error with message

### Test 2: Invalid Input

```bash
curl -X POST https://fpjvwyaysvcklojntggf.supabase.co/functions/v1/ai-voice-parser \
  -H "Content-Type: application/json" \
  -d '{"wrong_field": "test"}'
```

**Expected**: 400 error

### Test 3: No Amount in Speech

Say: "I went to the store"

**Expected**:
- AI tries to extract
- If no amount, returns null
- Frontend handles gracefully

---

## Category Coverage Tests

Test each expense category:
- [ ] Food: "spent 15 on pizza"
- [ ] Transport: "paid 30 for uber"
- [ ] Shopping: "bought clothes for 100"
- [ ] Entertainment: "movie tickets 25 dollars"
- [ ] Bills: "paid electric bill 80"
- [ ] Health: "pharmacy 40 dollars"
- [ ] Personal: "haircut 30"
- [ ] Education: "bought textbook 60"

Test each income category:
- [ ] Salary: "received 3000 salary"
- [ ] Freelance: "earned 500 from freelance"
- [ ] Business: "business revenue 1000"
- [ ] Investment: "dividend payment 200"
- [ ] Rental: "rent income 1500"
- [ ] Gifts: "birthday gift 100"
- [ ] Refunds: "refund from Amazon 50"
- [ ] Other: "income 75"

---

## Sign-Off Checklist

### Database
- [ ] Type column exists
- [ ] Index created
- [ ] Existing data migrated
- [ ] New transactions work

### Edge Function
- [ ] Deployed successfully
- [ ] API key configured
- [ ] All test cases pass
- [ ] Error handling works

### Frontend
- [ ] Voice entry works
- [ ] AI processing shows
- [ ] Fallback works
- [ ] Dashboard accurate
- [ ] Dark mode works
- [ ] Manual toggle works

### Integration
- [ ] End-to-end flow works
- [ ] All categories supported
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsive

### Production Ready
- [ ] All tests passed
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] User experience smooth

---

## Troubleshooting

### AI Not Working
- Check OpenAI API key in Supabase
- Check edge function logs
- Verify network connectivity
- Test edge function directly with curl

### Fallback Not Working
- Check browser console for errors
- Verify useVoiceInput.ts changes
- Test keyword matching logic

### Database Errors
- Verify migration completed
- Check RLS policies
- Test with simple insert

### Frontend Issues
- Clear browser cache
- Check network tab
- Review console errors
- Test in incognito mode
