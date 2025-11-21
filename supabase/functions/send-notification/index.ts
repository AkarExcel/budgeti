// Edge Function: Send Push Notification
// Type: normal
// Sends push notifications for gamification events

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
    const { user_id, notification_type, data } = await req.json();

    if (!user_id || !notification_type) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing user_id or notification_type' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get user's notification preferences
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=notification_preferences`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    const profiles = await profileResponse.json();
    const preferences = profiles[0]?.notification_preferences || {};

    // Check if user has enabled this notification type
    if (preferences[notification_type] === false) {
      return new Response(
        JSON.stringify({ data: { sent: false, reason: 'User disabled this notification type' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notification based on type
    let notification = {
      title: '',
      body: '',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: {},
    };

    switch (notification_type) {
      case 'streak_reminder':
        notification.title = 'Keep your streak alive!';
        notification.body = `Your ${data?.current_streak || 0}-day streak continues if you log an expense today`;
        notification.data = { action: 'open_add_expense' };
        break;

      case 'streak_at_risk':
        notification.title = 'Streak at risk!';
        notification.body = `Don't break your ${data?.current_streak || 0}-day streak! Log an expense now`;
        notification.data = { action: 'open_add_expense', urgent: true };
        break;

      case 'achievement_unlocked':
        notification.title = 'Achievement Unlocked!';
        notification.body = `You earned: ${data?.achievement_name || 'New Achievement'}`;
        notification.data = { action: 'open_achievements', achievement: data?.achievement_type };
        break;

      case 'budget_warning':
        notification.title = 'Budget Alert';
        notification.body = `You've used ${data?.percentage || 0}% of your monthly budget`;
        notification.data = { action: 'open_reports' };
        break;

      case 'weekly_recap':
        notification.title = 'Weekly Recap';
        notification.body = `This week: ${data?.expense_count || 0} expenses, $${data?.total_amount || 0} spent`;
        notification.data = { action: 'open_history' };
        break;

      default:
        notification.title = 'Expense Tracker';
        notification.body = data?.message || 'You have a new notification';
    }

    // Note: In a real implementation, you would:
    // 1. Store user's push notification tokens (from service worker registration)
    // 2. Use Firebase Cloud Messaging or similar service to send push notifications
    // 3. For now, this is a placeholder that logs the notification

    // Placeholder: In production, integrate with FCM or similar
    console.log('Sending notification:', notification);

    // For demo purposes, we'll just return success
    // In production, you'd integrate with FCM:
    /*
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userToken, // Retrieved from database
        notification: notification,
      }),
    });
    */

    return new Response(
      JSON.stringify({
        data: {
          sent: true,
          notification_type,
          notification,
          note: 'Push notification system requires FCM integration - currently in demo mode'
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
