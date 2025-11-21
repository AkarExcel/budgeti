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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': serviceRoleKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Invalid token');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Get user's profile with Google tokens
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profiles = await profileResponse.json();
    const profile = profiles[0];

    if (!profile || !profile.google_access_token) {
      throw new Error('Google account not connected');
    }

    // Check if token is expired and refresh if needed
    let accessToken = profile.google_access_token;
    const tokenExpires = new Date(profile.google_token_expires);
    
    if (tokenExpires <= new Date()) {
      // Token expired, refresh it
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_CLIENT_ID';
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_CLIENT_SECRET';

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: profile.google_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update access token and expiration
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_access_token: accessToken,
          google_token_expires: newExpiresAt,
        }),
      });
    }

    // Fetch user's expenses
    const expensesResponse = await fetch(`${supabaseUrl}/rest/v1/expenses?user_id=eq.${userId}&select=*&order=date.desc`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    });

    if (!expensesResponse.ok) {
      throw new Error('Failed to fetch expenses');
    }

    const expenses = await expensesResponse.json();

    // Create or update Google Sheet
    let spreadsheetId = profile.google_sheets_id;
    
    if (!spreadsheetId) {
      // Create new spreadsheet
      const createSheetResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `OPay Expenses - ${userData.email}`,
          },
          sheets: [{
            properties: {
              title: 'Expenses',
            },
          }],
        }),
      });

      if (!createSheetResponse.ok) {
        const errorText = await createSheetResponse.text();
        throw new Error(`Failed to create spreadsheet: ${errorText}`);
      }

      const sheetData = await createSheetResponse.json();
      spreadsheetId = sheetData.spreadsheetId;

      // Save spreadsheet ID to profile
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_sheets_id: spreadsheetId,
        }),
      });
    }

    // Prepare data for Google Sheets
    const headers = ['Date', 'Amount', 'Category', 'Merchant', 'Notes', 'Currency'];
    const rows = expenses.map((expense: any) => [
      expense.date,
      expense.amount,
      expense.category || '',
      expense.merchant || '',
      expense.notes || '',
      expense.currency || 'NGN',
    ]);

    const values = [headers, ...rows];

    // Clear existing data and write new data
    await fetch(`${supabaseUrl}/storage/v1/object/public/temp/clear`, {
      method: 'DELETE',
    }).catch(() => {}); // Ignore errors

    // Update spreadsheet
    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Expenses!A1:F${values.length}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update spreadsheet: ${errorText}`);
    }

    // Format headers (make them bold)
    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          }],
        }),
      }
    );

    if (!formatResponse.ok) {
      console.error('Failed to format headers, but sync succeeded');
    }

    // Update last sync time
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        last_sync_time: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ 
      data: { 
        success: true,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        syncedCount: expenses.length,
      } 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ 
      error: { 
        code: 'SYNC_FAILED', 
        message: error.message 
      } 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
