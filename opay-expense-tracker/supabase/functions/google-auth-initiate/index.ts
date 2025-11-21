Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Google OAuth credentials (to be configured with real values)
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_CLIENT_ID';
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || 'https://72ow33a3v26m.space.minimax.io/auth/google/callback';
    
    // OAuth parameters
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(JSON.stringify({ 
      data: { authUrl } 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auth initiation error:', error);
    return new Response(JSON.stringify({ 
      error: { 
        code: 'AUTH_INIT_FAILED', 
        message: error.message 
      } 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
