import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, profile: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface UIState {
  showVoiceModal: boolean;
  showExpenseModal: boolean;
  showAchievementModal: boolean;
  achievementToShow: string | null;
  setShowVoiceModal: (show: boolean) => void;
  setShowExpenseModal: (show: boolean) => void;
  setShowAchievementModal: (show: boolean, achievement?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showVoiceModal: false,
  showExpenseModal: false,
  showAchievementModal: false,
  achievementToShow: null,
  setShowVoiceModal: (show) => set({ showVoiceModal: show }),
  setShowExpenseModal: (show) => set({ showExpenseModal: show }),
  setShowAchievementModal: (show, achievement) => 
    set({ showAchievementModal: show, achievementToShow: achievement || null }),
}));

interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  queue: OfflineQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => void;
  removeFromQueue: (id: string) => void;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  incrementRetry: (id: string) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],
      isOnline: navigator.onLine,
      isSyncing: false,
      addToQueue: (item) => set((state) => ({
        queue: [
          ...state.queue,
          {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            retries: 0,
          },
        ],
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((item) => item.id !== id),
      })),
      setOnline: (isOnline) => set({ isOnline }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      incrementRetry: (id) => set((state) => ({
        queue: state.queue.map((item) =>
          item.id === id ? { ...item, retries: item.retries + 1 } : item
        ),
      })),
    }),
    {
      name: 'offline-queue',
    }
  )
);

interface NavigationState {
  currentPage: 'dashboard' | 'profile';
  setCurrentPage: (page: 'dashboard' | 'profile') => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}));

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  actualTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActualTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      actualTheme: 'light',
      setTheme: (theme) => set({ theme }),
      setActualTheme: (actualTheme) => set({ actualTheme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
