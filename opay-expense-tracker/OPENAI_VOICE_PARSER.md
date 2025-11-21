# OpenAI Voice Parser Implementation

## Overview
Enhanced the voice entry system with OpenAI GPT-4o-mini for intelligent transaction parsing, replacing basic keyword matching with advanced natural language understanding.

## Implementation Status

### Completed Components

1. **Edge Function**: `ai-voice-parser` 
   - Location: `/supabase/functions/ai-voice-parser/index.ts`
   - Uses OpenAI GPT-4o-mini for parsing
   - Extracts: type, amount, category, merchant/source, notes
   - Validates categories against predefined lists
   - Includes fallback to keyword matching if API fails

2. **Frontend Integration**: `useVoiceInput.ts`
   - Added `parseExpenseFromTextWithAI()` async function
   - Calls edge function after voice-to-text conversion
   - Graceful fallback to `parseExpenseFromTextFallback()`
   - Maintains existing UI and UX

3. **AI Capabilities**:
   - Detects transaction type (income vs expense) intelligently
   - Extracts amounts in various formats
   - Maps to appropriate categories
   - Identifies merchant/source names
   - Handles complex natural language inputs

## API Integration Details

### OpenAI Configuration
- **Model**: gpt-4o-mini (fast, cost-effective)
- **Temperature**: 0.3 (consistent, predictable)
- **Max Tokens**: 200
- **Response Format**: JSON object

### System Prompt Design
The AI is instructed to:
- Recognize income keywords: earned, received, salary, freelance, bonus, refund, got paid
- Recognize expense keywords: spent, paid, bought, purchase, cost
- Extract numerical amounts accurately
- Map to predefined categories (8 expense + 8 income categories)
- Identify merchant/source names
- Generate brief, relevant notes

### Supported Categories

**Expense Categories**:
- food, transport, shopping, entertainment, bills, health, personal, education, other

**Income Categories**:
- salary, freelance, business, investment, rental, gifts, refunds, other

## Example Inputs & Expected Outputs

### Complex Inputs Now Supported

**Input**: "paid $45 for groceries at Walmart yesterday"
**AI Output**:
```json
{
  "type": "expense",
  "amount": 45,
  "category": "food",
  "merchant": "Walmart",
  "notes": "groceries"
}
```

**Input**: "received $2000 salary from Acme Corp"
**AI Output**:
```json
{
  "type": "income",
  "amount": 2000,
  "category": "salary",
  "merchant": "Acme Corp",
  "notes": "salary payment"
}
```

**Input**: "spent about 25 bucks on coffee at Starbucks this morning"
**AI Output**:
```json
{
  "type": "expense",
  "amount": 25,
  "category": "food",
  "merchant": "Starbucks",
  "notes": "coffee"
}
```

## Deployment Requirements

### Prerequisites
- ✅ Edge function code created
- ✅ Frontend code updated
- ⚠️ **OpenAI API key required**
- ⚠️ **Supabase access token refresh needed**

### Deployment Steps

1. **Add OpenAI API Key** (Required):
   - Key will be stored as environment variable in Supabase
   - Edge function accesses via `Deno.env.get('OPENAI_API_KEY')`

2. **Deploy Edge Function**:
   ```bash
   # Deploy ai-voice-parser function
   # File: supabase/functions/ai-voice-parser/index.ts
   ```

3. **Build & Deploy Frontend**:
   ```bash
   cd /workspace/opay-expense-tracker
   pnpm run build
   # Deploy dist/ directory
   ```

4. **Test Integration**:
   - Test voice input with complex phrases
   - Verify AI parsing accuracy
   - Confirm fallback works if API fails
   - Check all categories work correctly

## Error Handling

### Fallback Strategy
If OpenAI API fails (network error, rate limit, etc.):
1. Error is logged to console
2. System automatically falls back to keyword matching
3. User experience is uninterrupted
4. Transaction can still be created

### Edge Function Error Responses
- 400: Invalid transcript provided
- 500: OpenAI API key not configured
- 500: OpenAI API request failed
- 500: Failed to process voice input

## Performance & Cost

### Response Time
- OpenAI API call: ~1-2 seconds
- Total processing: ~2-3 seconds (including voice-to-text)
- Fallback parsing: ~50ms

### Cost Estimation
- Model: GPT-4o-mini
- Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Average request: ~200 input + 100 output tokens
- Per transaction: ~$0.00003 (negligible)
- 1000 transactions: ~$0.03

## Benefits Over Keyword Matching

1. **Better Accuracy**: Understands context and intent
2. **Natural Language**: Handles various phrasings
3. **Complex Inputs**: Parses multi-part sentences
4. **Temporal Context**: Can understand "yesterday", "last week"
5. **Ambiguity Resolution**: Makes intelligent category decisions
6. **Robust Extraction**: Handles typos and variations

## Testing Checklist

- [ ] Deploy edge function with OpenAI API key
- [ ] Test simple expense: "spent 20 on lunch"
- [ ] Test complex expense: "paid $45 for groceries at Walmart yesterday"
- [ ] Test simple income: "earned 500 from freelance"
- [ ] Test complex income: "received $2000 salary from Acme Corp today"
- [ ] Test ambiguous input: "got 100 dollars" (should default to income)
- [ ] Test fallback: Disconnect from internet, verify keyword matching works
- [ ] Test all expense categories
- [ ] Test all income categories
- [ ] Verify dark mode displays AI-parsed data correctly

## Files Modified

1. **supabase/functions/ai-voice-parser/index.ts** (NEW)
   - OpenAI API integration
   - Transaction parsing logic
   - Response validation

2. **src/hooks/useVoiceInput.ts** (MODIFIED)
   - Added `parseExpenseFromTextWithAI()` async function
   - Renamed original to `parseExpenseFromTextFallback()`
   - Updated `recognition.onend` to use AI parsing
   - Added error handling and fallback logic

## Next Steps

1. ✅ Edge function code ready
2. ✅ Frontend code ready
3. ⏳ Waiting for OpenAI API key
4. ⏳ Deploy edge function
5. ⏳ Build and deploy frontend
6. ⏳ Test AI parsing
7. ⏳ Verify fallback mechanism
8. ⏳ Production deployment

## Documentation

- Full implementation in this file
- Edge function: `supabase/functions/ai-voice-parser/index.ts`
- Frontend hook: `src/hooks/useVoiceInput.ts`
- Original keyword matching preserved as fallback
