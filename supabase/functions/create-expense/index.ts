// Edge Function: Create Expense with Streak Update and Achievement Check
// Type: normal
// Handles expense creation with automatic streak tracking and achievement unlocking

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
    const {
      date,
      amount,
      currency,
      category_id,
      merchant,
      notes,
      source,
      idempotency_key
    } = await req.json();

    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token and get user (simplified - in production use Supabase client)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Validate required fields
    if (!date || !amount || !source) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: date, amount, source' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user from token
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseKey }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid authentication token');
    }

    const { id: user_id } = await userResponse.json();

    // Check for existing expense with idempotency key (prevent duplicates)
    if (idempotency_key) {
      const existingCheck = await fetch(
        `${supabaseUrl}/rest/v1/expenses?idempotency_key=eq.${idempotency_key}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const existing = await existingCheck.json();
      
      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ data: existing[0], note: 'Returned existing expense (idempotent)' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create expense
    const expenseData = {
      user_id,
      date,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      category_id: category_id || null,
      merchant: merchant || null,
      notes: notes || null,
      source,
      idempotency_key: idempotency_key || null,
      sheet_sync_status: 'pending'
    };

    const expenseResponse = await fetch(`${supabaseUrl}/rest/v1/expenses`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(expenseData)
    });

    if (!expenseResponse.ok) {
      const error = await expenseResponse.text();
      throw new Error(`Failed to create expense: ${error}`);
    }

    const expense = await expenseResponse.json();

    // Update streak
    const today = new Date(date).toISOString().split('T')[0];
    
    // Get current streak
    const streakResponse = await fetch(
      `${supabaseUrl}/rest/v1/streaks?user_id=eq.${user_id}`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    
    let streakData = await streakResponse.json();
    let updatedStreak;

    if (streakData && streakData.length > 0) {
      const streak = streakData[0];
      const lastDate = streak.last_logged_date;
      let newStreak = streak.current_streak;
      
      // Calculate streak
      if (lastDate) {
        const lastLogDate = new Date(lastDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1; // Continue streak
        } else if (diffDays > 1) {
          newStreak = 1; // Reset streak
        }
        // If diffDays === 0, same day, no change
      } else {
        newStreak = 1; // First log
      }

      const longestStreak = Math.max(streak.longest_streak, newStreak);

      // Update streak
      const updateStreakResponse = await fetch(
        `${supabaseUrl}/rest/v1/streaks?id=eq.${streak.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_logged_date: today,
            updated_at: new Date().toISOString()
          })
        }
      );

      updatedStreak = await updateStreakResponse.json();
    } else {
      // Create new streak
      const createStreakResponse = await fetch(`${supabaseUrl}/rest/v1/streaks`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id,
          current_streak: 1,
          longest_streak: 1,
          last_logged_date: today
        })
      });

      updatedStreak = await createStreakResponse.json();
    }

    // Check for achievement unlocks
    const achievementsToUnlock = [];

    // Get total expense count
    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/expenses?user_id=eq.${user_id}&select=count`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'count=exact' } }
    );
    const countHeader = countResponse.headers.get('Content-Range');
    const totalCount = countHeader ? parseInt(countHeader.split('/')[1]) : 0;

    // Check achievements
    const currentStreak = Array.isArray(updatedStreak) ? updatedStreak[0].current_streak : updatedStreak.current_streak;
    
    if (currentStreak === 7) achievementsToUnlock.push('first_week');
    if (currentStreak === 30) achievementsToUnlock.push('month_master');
    if (totalCount === 100) achievementsToUnlock.push('century_club');
    if (totalCount === 1) achievementsToUnlock.push('first_entry');

    // Unlock achievements
    for (const achievementType of achievementsToUnlock) {
      // Check if already unlocked
      const existingAchievement = await fetch(
        `${supabaseUrl}/rest/v1/achievements?user_id=eq.${user_id}&achievement_type=eq.${achievementType}`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const existing = await existingAchievement.json();

      if (!existing || existing.length === 0) {
        await fetch(`${supabaseUrl}/rest/v1/achievements`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id,
            achievement_type: achievementType
          })
        });
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          expense: Array.isArray(expense) ? expense[0] : expense,
          streak: Array.isArray(updatedStreak) ? updatedStreak[0] : updatedStreak,
          achievements_unlocked: achievementsToUnlock
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
