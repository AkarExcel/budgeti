import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import { useAuthStore, useNavigationStore, useThemeStore } from './stores';
import Dashboard from './components/Dashboard';
import ProfileScreen from './components/ProfileScreen';
import AuthScreen from './components/AuthScreen';
import AuthCallback from './components/AuthCallback';
import GoogleOAuthCallback from './components/GoogleOAuthCallback';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import BottomNavigation from './components/BottomNavigation';
import ExpenseModal from './components/ExpenseModal';
import VoiceModal from './components/VoiceModal';
import AchievementModal from './components/AchievementModal';
import { useUIStore } from './stores';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, setUser, setProfile, setLoading, isAuthenticated } = useAuthStore();
  const { showExpenseModal, showVoiceModal, showAchievementModal } = useUIStore();
  const { currentPage } = useNavigationStore();
  const { theme, setActualTheme } = useThemeStore();

  // Handle theme changes
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        setActualTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setActualTheme('light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme, setActualTheme]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || '',
        });
        
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
            } else {
              // Create profile if doesn't exist
              supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  currency: 'NGN',
                  notification_preferences: {},
                })
                .select()
                .single()
                .then(({ data: newProfile }) => {
                  if (newProfile) setProfile(newProfile);
                });
            }
          });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || '',
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background-page dark:bg-gray-900 pb-56 transition-colors duration-base">
      {currentPage === 'dashboard' ? <Dashboard /> : <ProfileScreen />}
      <BottomNavigation />
      
      {/* Modals */}
      {showExpenseModal && <ExpenseModal />}
      {showVoiceModal && <VoiceModal />}
      {showAchievementModal && <AchievementModal />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
