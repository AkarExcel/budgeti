import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Expense, Category, Streak, Achievement, ExpenseFormData } from '../types';
import { useOfflineStore } from '../stores';

// Query keys
export const queryKeys = {
  expenses: ['expenses'] as const,
  categories: ['categories'] as const,
  streak: ['streak'] as const,
  achievements: ['achievements'] as const,
  budgets: ['budgets'] as const,
};

// Fetch expenses
export const useExpenses = () => {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*)
        `)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

// Fetch categories
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch streak
export const useStreak = () => {
  return useQuery({
    queryKey: queryKeys.streak,
    queryFn: async (): Promise<Streak | null> => {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Fetch achievements
export const useAchievements = () => {
  return useQuery({
    queryKey: queryKeys.achievements,
    queryFn: async (): Promise<Achievement[]> => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create expense mutation
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { addToQueue, isOnline } = useOfflineStore();

  return useMutation({
    mutationFn: async (expenseData: ExpenseFormData) => {
      const idempotencyKey = crypto.randomUUID();
      
      // If offline, add to queue
      if (!isOnline) {
        addToQueue({
          type: 'create',
          data: { ...expenseData, idempotency_key: idempotencyKey },
        });
        return { offline: true };
      }

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert expense directly to database
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          date: expenseData.date,
          amount: parseFloat(expenseData.amount),
          currency: 'NGN', // Default currency
          category_id: expenseData.category_id || null,
          merchant: expenseData.merchant || null,
          notes: expenseData.notes || null,
          source: expenseData.source,
          type: expenseData.type || 'expense',
          idempotency_key: idempotencyKey,
          sheet_sync_status: 'pending',
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      // Update or create streak
      await updateStreak(user.id);

      return { expense: data, achievements_unlocked: [] };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.streak });
      
      // Show achievement modal if new achievements unlocked
      if (data.achievements_unlocked && data.achievements_unlocked.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
      }
    },
  });
};

// Helper function to update streak
async function updateStreak(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak
    const { data: currentStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentStreak) {
      // Create new streak
      await supabase.from('streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_logged_date: today,
      });
    } else {
      const lastLogged = currentStreak.last_logged_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = currentStreak.current_streak;
      
      // Check if logged yesterday (continue streak) or today (same day)
      if (lastLogged === yesterdayStr) {
        newStreak += 1;
      } else if (lastLogged !== today) {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, currentStreak.longest_streak);

      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_logged_date: today,
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    // Don't throw - streak is a nice-to-have feature
  }
}

// Update expense mutation
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
};

// Delete expense mutation
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
};
