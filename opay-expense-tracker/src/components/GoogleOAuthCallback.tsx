import { useEffect } from 'react';

export default function GoogleOAuthCallback() {
  useEffect(() => {
    // Get the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      alert('Google authorization failed: ' + error);
      window.close();
      return;
    }

    if (code) {
      // Send the code to the parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_CODE',
          code: code,
        }, window.location.origin);
        
        // Show success message before closing
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        alert('Unable to communicate with parent window. Please close this window and try again.');
      }
    } else {
      alert('No authorization code received from Google.');
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-16">
      <div className="text-center">
        <div className="w-64 h-64 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-24"></div>
        <h2 className="text-heading-lg text-neutral-900 dark:text-white mb-8">
          Authorization Successful
        </h2>
        <p className="text-body-base text-neutral-600 dark:text-neutral-400">
          Connecting your Google account...
        </p>
      </div>
    </div>
  );
}
