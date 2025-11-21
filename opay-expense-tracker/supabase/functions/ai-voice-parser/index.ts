// OpenAI-powered voice transaction parser edge function
// Intelligently extracts transaction details from natural language input

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid transcript provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define available categories for the AI
    const expenseCategories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'personal', 'education', 'other'];
    const incomeCategories = ['salary', 'freelance', 'business', 'investment', 'rental', 'gifts', 'refunds', 'other'];

    // Create intelligent prompt for OpenAI
    const systemPrompt = `You are a financial transaction parser. Extract structured data from natural language expense and income descriptions.

Available expense categories: ${expenseCategories.join(', ')}
Available income categories: ${incomeCategories.join(', ')}

Extract and return ONLY a valid JSON object with these fields:
{
  "type": "expense" or "income",
  "amount": number (extracted from the text, required),
  "category": string (from the appropriate category list above, lowercase),
  "merchant": string (store/company name for expenses, or source for income, optional),
  "notes": string (brief description, optional)
}

Rules:
- Detect type based on keywords: income words (earned, received, salary, freelance, bonus, refund, got paid) vs expense words (spent, paid, bought, purchase, cost)
- Extract exact amount as a number
- Choose the most appropriate category from the available lists
- For expenses, merchant is where money was spent (e.g., "Walmart", "McDonald's")
- For income, merchant is the source (e.g., "Freelance Client", "Salary", "Dividend")
- Keep notes brief and relevant
- Return valid JSON only, no other text`;

    const userPrompt = `Parse this transaction: "${transcript}"`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to parse transaction with AI', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    const parsedData = JSON.parse(aiResponse);

    // Validate and structure the response
    const result = {
      type: parsedData.type === 'income' ? 'income' : 'expense',
      amount: parsedData.amount ? parseFloat(parsedData.amount) : null,
      category: parsedData.category || null,
      merchant: parsedData.merchant || null,
      notes: parsedData.notes || null,
      raw_transcript: transcript,
      ai_processed: true
    };

    // Validate category is from the correct list
    const validCategories = result.type === 'income' ? incomeCategories : expenseCategories;
    if (result.category && !validCategories.includes(result.category)) {
      result.category = 'other';
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice parser error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process voice input', 
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
