Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { voiceText } = await req.json();

        if (!voiceText) {
            throw new Error('Voice text is required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // Define available categories
        const expenseCategories = ['food', 'transport', 'shopping', 'entertainment', 'health', 'bills', 'education', 'other'];
        const incomeCategories = ['salary', 'freelance', 'business', 'investment', 'rental', 'gifts', 'refunds', 'other'];

        // Create OpenAI prompt
        const prompt = `You are an intelligent expense and income parser. Analyze the following voice input and extract structured data.

Voice Input: "${voiceText}"

Extract and return ONLY a JSON object with these fields:
{
  "type": "expense" or "income",
  "amount": number (extract the monetary amount),
  "category": one of [${expenseCategories.join(', ')}] for expenses or [${incomeCategories.join(', ')}] for income,
  "merchant": string (where money was spent or received from),
  "notes": string (any additional context, optional)
}

IMPORTANT RULES:
- Determine if it's an expense (money spent) or income (money received)
- For expenses: use expense categories. For income: use income categories
- Extract the actual amount mentioned
- Be specific with merchant/source names
- If unclear, use "other" category
- Return only the JSON object, no additional text

Examples:
- "paid $45 for groceries at Walmart" -> {"type": "expense", "amount": 45, "category": "food", "merchant": "Walmart", "notes": ""}
- "received $2000 salary" -> {"type": "income", "amount": 2000, "category": "salary", "merchant": "", "notes": ""}
- "bought coffee for about 5 dollars" -> {"type": "expense", "amount": 5, "category": "food", "merchant": "", "notes": "coffee"}

Now parse: "${voiceText}"`;

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            })
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        const openaiData = await openaiResponse.json();
        const aiResponse = openaiData.choices[0].message.content;

        // Parse AI response
        let parsedData;
        try {
            // Clean the response to extract JSON
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            throw new Error(`Failed to parse AI response: ${parseError.message}`);
        }

        // Validate the parsed data
        if (!parsedData.type || !parsedData.amount || !parsedData.category) {
            throw new Error('Incomplete data from AI');
        }

        // Ensure category is valid for the type
        if (parsedData.type === 'expense' && !expenseCategories.includes(parsedData.category)) {
            parsedData.category = 'other';
        }
        if (parsedData.type === 'income' && !incomeCategories.includes(parsedData.category)) {
            parsedData.category = 'other';
        }

        // Ensure type is valid
        if (!['expense', 'income'].includes(parsedData.type)) {
            throw new Error('Invalid transaction type');
        }

        return new Response(JSON.stringify({
            data: {
                ...parsedData,
                originalText: voiceText,
                success: true
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI voice parser error:', error);

        const errorResponse = {
            error: {
                code: 'AI_PARSER_FAILED',
                message: error.message,
                fallback: true
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});