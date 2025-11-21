import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          // Redirect to login with error
          window.location.href = '/?error=oauth_failed';
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          window.location.href = '/';
        } else {
          // No session, redirect to login
          window.location.href = '/?error=no_session';
        }
      } catch (error) {
        console.error('Unexpected error during OAuth callback:', error);
        window.location.href = '/?error=unexpected_error';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we sign you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;