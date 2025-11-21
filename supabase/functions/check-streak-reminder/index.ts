// Edge Function: Check Streak Reminder (Cron Job)
// Type: cron
// Runs daily to check for at-risk streaks and send reminders

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Get all active streaks
    const streaksResponse = await fetch(
      `${supabaseUrl}/rest/v1/streaks?current_streak=gt.0&select=*`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    const streaks = await streaksResponse.json();

    if (!streaks || streaks.length === 0) {
      return new Response(
        JSON.stringify({ data: { processed: 0, message: 'No active streaks found' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const remindersProcessed = [];
    const streaksAtRisk = [];

    for (const streak of streaks) {
      const lastLoggedDate = streak.last_logged_date;
      
      if (!lastLoggedDate) continue;

      const lastDate = new Date(lastLoggedDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      // If last logged yesterday (1 day ago), streak is at risk today
      if (diffDays === 1) {
        streaksAtRisk.push({
          user_id: streak.user_id,
          current_streak: streak.current_streak,
        });

        // Send notification
        const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: streak.user_id,
            notification_type: 'streak_at_risk',
            data: {
              current_streak: streak.current_streak,
            },
          }),
        });

        remindersProcessed.push({
          user_id: streak.user_id,
          streak: streak.current_streak,
          notification_sent: notificationResponse.ok,
        });
      }
      
      // If last logged 2+ days ago, streak is already broken
      // Update streak to 0
      if (diffDays >= 2) {
        await fetch(
          `${supabaseUrl}/rest/v1/streaks?id=eq.${streak.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              current_streak: 0,
              updated_at: new Date().toISOString(),
            })
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          total_streaks_checked: streaks.length,
          streaks_at_risk: streaksAtRisk.length,
          reminders_sent: remindersProcessed.length,
          processed_details: remindersProcessed,
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
