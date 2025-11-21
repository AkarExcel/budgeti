// Edge Function: Sync Expenses to Google Sheets
// Type: normal
// Syncs pending expenses to user's Google Sheet

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { sheet_id, access_token } = await req.json();

    if (!sheet_id || !access_token) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing sheet_id or access_token' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Verify user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseKey }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid authentication token');
    }

    const { id: user_id } = await userResponse.json();

    // Get pending expenses
    const expensesResponse = await fetch(
      `${supabaseUrl}/rest/v1/expenses?user_id=eq.${user_id}&sheet_sync_status=eq.pending&select=*,category:categories(*)&order=date.asc`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    const expenses = await expensesResponse.json();

    if (!expenses || expenses.length === 0) {
      return new Response(
        JSON.stringify({ data: { synced_count: 0, message: 'No pending expenses to sync' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for Google Sheets
    const rows = expenses.map((expense: any) => [
      expense.id,
      expense.date,
      expense.amount,
      expense.currency,
      expense.category?.name || '',
      expense.merchant || '',
      expense.notes || '',
      expense.source,
      expense.created_at,
      expense.updated_at,
      'synced'
    ]);

    // Call Google Sheets API
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/Expenses!A:K:append?valueInputOption=USER_ENTERED`;
    
    const sheetsResponse = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    if (!sheetsResponse.ok) {
      const error = await sheetsResponse.text();
      throw new Error(`Google Sheets API error: ${error}`);
    }

    // Update sync status in database
    const expenseIds = expenses.map((e: any) => e.id);
    
    for (const id of expenseIds) {
      await fetch(
        `${supabaseUrl}/rest/v1/expenses?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sheet_sync_status: 'synced' })
        }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          synced_count: expenses.length,
          sheet_id,
          message: `Successfully synced ${expenses.length} expenses to Google Sheets`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'FUNCTION_ERROR',
          message: error.message
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
