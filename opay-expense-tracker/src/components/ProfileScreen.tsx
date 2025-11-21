import { useState, useEffect } from 'react';
import { Settings, Sheet, Bell, LogOut, ChevronDown, Sun, Moon, Link2, CheckCircle } from 'lucide-react';
import { signOut } from '../lib/supabase';
import { useAuthStore, useNavigationStore, useThemeStore } from '../stores';
import { supabase } from '../lib/supabase';

// Currency options with symbols
const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

export default function ProfileScreen() {
  const { user, profile, logout, setProfile } = useAuthStore();
  const { setCurrentPage } = useNavigationStore();
  const { theme, setTheme, actualTheme } = useThemeStore();
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || 'NGN');
  const [saving, setSaving] = useState(false);
  const [oauthWindow, setOauthWindow] = useState<Window | null>(null);

  const handleSignOut = async () => {
    await signOut();
    logout();
    setCurrentPage('dashboard'); // Reset to dashboard on logout
  };

  // Check for connection status
  const isGoogleConnected = !!(profile?.google_access_token);
  const lastSyncTime = profile?.last_sync_time ? new Date(profile.last_sync_time) : null;

  // Format last sync time
  const formatSyncTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Handle OAuth message from popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_OAUTH_CODE') {
        const { code } = event.data;
        
        setConnecting(true);
        try {
          const { data, error } = await supabase.functions.invoke('google-auth-callback', {
            body: { code },
          });

          if (error) throw error;

          // Refresh profile to get updated tokens
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile?.id)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
          }

          alert('Google account connected successfully!');
          if (oauthWindow) {
            oauthWindow.close();
          }
        } catch (error: any) {
          console.error('OAuth error:', error);
          alert('Failed to connect Google account: ' + (error.message || 'Unknown error'));
        } finally {
          setConnecting(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [profile, setProfile, oauthWindow]);

  const handleConnectGoogle = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-auth-initiate');

      if (error) throw error;

      const authUrl = data?.data?.authUrl;
      if (!authUrl) {
        throw new Error('No auth URL received');
      }

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'Google OAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      setOauthWindow(popup);

      // Note: User needs to manually handle the callback URL
      alert('Please complete the Google authorization in the popup window. After authorization, copy the code from the URL and we will handle it automatically.');
      
    } catch (error: any) {
      console.error('Connect error:', error);
      alert('Failed to initiate Google connection: ' + (error.message || 'Unknown error'));
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-sync');

      if (error) throw error;

      // Refresh profile to get updated last_sync_time
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile?.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      const syncedCount = data?.data?.syncedCount || 0;
      const spreadsheetUrl = data?.data?.spreadsheetUrl;

      alert(`Successfully synced ${syncedCount} expenses to Google Sheets!`);
      
      // Optionally open the spreadsheet
      if (spreadsheetUrl && window.confirm('Open the Google Sheet?')) {
        window.open(spreadsheetUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      alert('Failed to sync to Google Sheets: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Google account?')) {
      return;
    }

    setDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke('google-disconnect');

      if (error) throw error;

      // Refresh profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile?.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      alert('Google account disconnected successfully!');
    } catch (error: any) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Google account: ' + (error.message || 'Unknown error'));
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCurrencySave = async () => {
    if (!profile || selectedCurrency === profile.currency) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: selectedCurrency })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local profile state
      setProfile({
        ...profile,
        currency: selectedCurrency,
      });

      alert('Currency updated successfully!');
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Failed to update currency. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-16 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-24">
        <h1 className="text-heading-xl text-neutral-900 dark:text-white">Profile & Settings</h1>
        <Settings className="w-24 h-24 text-neutral-400 dark:text-neutral-500" />
      </div>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-24 shadow-card mb-24 transition-colors duration-base">
        <div className="flex items-center gap-16 mb-16">
          <div className="w-64 h-64 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-heading-xl text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-heading-md text-neutral-900 dark:text-white">{user?.email}</h2>
            <p className="text-body-sm text-neutral-400 dark:text-neutral-500">
              Member since {new Date(user?.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="pt-16 border-t border-neutral-200 dark:border-gray-700">
          {/* Currency Selection */}
          <div className="mb-16">
            <label className="block text-body-base font-semibold text-neutral-700 dark:text-neutral-300 mb-8">
              Currency
            </label>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full h-48 px-16 border-2 border-neutral-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:outline-none text-body-base appearance-none bg-white pr-24"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-16 top-1/2 transform -translate-y-1/2 w-20 h-20 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            </div>
            {selectedCurrency !== (profile?.currency || 'NGN') && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleCurrencySave}
                  disabled={saving}
                  className="h-40 px-16 bg-primary-500 text-white text-body-sm font-semibold rounded-md hover:bg-primary-400 transition-colors disabled:opacity-50 flex items-center gap-8"
                >
                  {saving ? (
                    <>
                      <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Currency'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Monthly Budget Display */}
          <div className="flex items-center justify-between">
            <span className="text-body-base text-neutral-700 dark:text-neutral-300">Monthly Budget</span>
            <span className="text-body-base font-semibold text-neutral-900 dark:text-white">
              {CURRENCIES.find(c => c.code === (profile?.currency || 'NGN'))?.symbol || '₦'}
              {profile?.monthly_budget?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-24 shadow-card mb-24 transition-colors duration-base">
        <div className="flex items-center gap-12 mb-16">
          {actualTheme === 'dark' ? (
            <Moon className="w-20 h-20 text-primary-500 dark:text-primary-400" />
          ) : (
            <Sun className="w-20 h-20 text-primary-500 dark:text-primary-400" />
          )}
          <h2 className="text-heading-lg text-neutral-900 dark:text-white">Appearance</h2>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between py-12 border-b border-neutral-200 dark:border-gray-700">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">Light Mode</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Use light color scheme</div>
            </div>
            <button
              onClick={() => setTheme('light')}
              className={`w-20 h-20 rounded-full border-2 transition-colors ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 dark:border-gray-600'
              }`}
            >
              {theme === 'light' && (
                <div className="w-12 h-12 bg-white rounded-full mx-auto" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-12 border-b border-neutral-200 dark:border-gray-700">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">Dark Mode</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Use dark color scheme</div>
            </div>
            <button
              onClick={() => setTheme('dark')}
              className={`w-20 h-20 rounded-full border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 dark:border-gray-600'
              }`}
            >
              {theme === 'dark' && (
                <div className="w-12 h-12 bg-white rounded-full mx-auto" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-12">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">System Default</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Match system preference</div>
            </div>
            <button
              onClick={() => setTheme('system')}
              className={`w-20 h-20 rounded-full border-2 transition-colors ${
                theme === 'system'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 dark:border-gray-600'
              }`}
            >
              {theme === 'system' && (
                <div className="w-12 h-12 bg-white rounded-full mx-auto" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Google Sheets OAuth Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-24 shadow-card mb-24 transition-colors duration-base">
        <div className="flex items-center gap-12 mb-16">
          <Sheet className="w-20 h-20 text-primary-500 dark:text-primary-400" />
          <h2 className="text-heading-lg text-neutral-900 dark:text-white">Google Sheets</h2>
        </div>
        
        {!isGoogleConnected ? (
          <>
            <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mb-16">
              Connect your Google Account to sync expenses to Google Sheets
            </p>
            <button
              onClick={handleConnectGoogle}
              disabled={connecting}
              className="w-full h-48 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-8"
            >
              {connecting ? (
                <>
                  <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-20 h-20" />
                  Connect Google Account
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-8 mb-12">
              <CheckCircle className="w-16 h-16 text-success" />
              <span className="text-body-sm text-success font-medium">Connected to Google Account</span>
            </div>
            
            {lastSyncTime && (
              <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mb-16">
                Last synced: {formatSyncTime(lastSyncTime)}
              </p>
            )}
            
            <div className="flex gap-12">
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="flex-1 h-48 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-8"
              >
                {syncing ? (
                  <>
                    <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Sheet className="w-20 h-20" />
                    Sync Now
                  </>
                )}
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="h-48 px-16 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-24 shadow-card mb-24 transition-colors duration-base">
        <div className="flex items-center gap-12 mb-16">
          <Bell className="w-20 h-20 text-primary-500 dark:text-primary-400" />
          <h2 className="text-heading-lg text-neutral-900 dark:text-white">Notifications</h2>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between py-12 border-b border-neutral-200 dark:border-gray-700">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">Streak Reminders</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Daily reminder to log expenses</div>
            </div>
            <label className="relative inline-block w-48 h-24">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-48 h-24 bg-neutral-200 dark:bg-gray-700 peer-checked:bg-primary-500 rounded-full transition-colors cursor-pointer"></div>
              <div className="absolute left-4 top-4 w-16 h-16 bg-white rounded-full transition-transform peer-checked:translate-x-24"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-12 border-b border-neutral-200 dark:border-gray-700">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">Achievement Notifications</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Get notified when you unlock badges</div>
            </div>
            <label className="relative inline-block w-48 h-24">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-48 h-24 bg-neutral-200 dark:bg-gray-700 peer-checked:bg-primary-500 rounded-full transition-colors cursor-pointer"></div>
              <div className="absolute left-4 top-4 w-16 h-16 bg-white rounded-full transition-transform peer-checked:translate-x-24"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-12">
            <div>
              <div className="text-body-base font-medium text-neutral-900 dark:text-white">Budget Alerts</div>
              <div className="text-body-sm text-neutral-400 dark:text-neutral-500">Alerts when approaching budget limits</div>
            </div>
            <label className="relative inline-block w-48 h-24">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-48 h-24 bg-neutral-200 dark:bg-gray-700 peer-checked:bg-primary-500 rounded-full transition-colors cursor-pointer"></div>
              <div className="absolute left-4 top-4 w-16 h-16 bg-white rounded-full transition-transform peer-checked:translate-x-24"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full h-48 border-2 border-error text-error rounded-md hover:bg-error/10 dark:hover:bg-error/20 transition-colors flex items-center justify-center gap-8"
      >
        <LogOut className="w-20 h-20" />
        Sign Out
      </button>
    </div>
  );
}
