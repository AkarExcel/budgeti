import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signInWithGoogle, isSupabaseConfigured } from '../lib/supabase';

export default function AuthScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for OAuth errors in URL params
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
          setError('Google authentication failed. Please try again.');
          break;
        case 'no_session':
          setError('Authentication session was not established. Please try again.');
          break;
        case 'unexpected_error':
          setError('An unexpected error occurred. Please try again.');
          break;
        default:
          setError('Authentication error occurred.');
      }
    }
  }, [searchParams]);
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please set up your environment variables.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Error signing in:', error);
        setError(`Failed to sign in with Google: ${error.message}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 p-16">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-card p-32 text-center">
        <div className="mb-24">
          <div className="w-64 h-64 mx-auto mb-16 bg-primary-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-heading-xl text-neutral-900 dark:text-white mb-8">Expense Tracker</h1>
          <p className="text-body-base text-neutral-700 dark:text-neutral-300">
            Track your expenses with voice input, stay motivated with streaks, and achieve your financial goals.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-48 bg-primary-500 text-white text-body-lg font-semibold rounded-md hover:bg-primary-400 transition-all duration-base shadow-card hover:shadow-card-hover flex items-center justify-center gap-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-white"></div>
          ) : (
            <>
              <svg className="w-24 h-24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-12 my-16">
          <div className="flex-1 border-t border-neutral-300 dark:border-gray-600"></div>
          <span className="text-body-sm text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">OR</span>
          <div className="flex-1 border-t border-neutral-300 dark:border-gray-600"></div>
        </div>

        {/* Email/Password Options */}
        <div className="space-y-12">
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full h-48 bg-white dark:bg-gray-800 text-primary-500 text-body-lg font-semibold rounded-md border-2 border-primary-500 hover:bg-primary-50 transition-all duration-base flex items-center justify-center gap-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Sign in with Email
          </button>

          <button
            onClick={() => navigate('/auth/signup')}
            className="w-full h-48 bg-white dark:bg-gray-800 text-neutral-900 dark:text-white text-body-base font-semibold rounded-md border border-neutral-300 dark:border-gray-600 hover:bg-neutral-50 transition-all duration-base"
          >
            Create new account
          </button>
        </div>

        {error && (
          <div className="mt-16 p-12 bg-red-50 border border-red-200 rounded-md">
            <p className="text-body-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!isSupabaseConfigured() && !error && (
          <div className="mt-16 p-12 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-body-sm text-yellow-700">
              Setup required: Please configure Supabase credentials
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
