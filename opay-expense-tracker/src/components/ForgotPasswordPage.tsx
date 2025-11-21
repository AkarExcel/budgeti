import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword, isSupabaseConfigured } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    const newErrors: Record<string, string> = {};
    setSuccessMessage('');

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isSupabaseConfigured()) {
      newErrors.general = 'Authentication service is not configured';
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        newErrors.general = error.message;
        setErrors(newErrors);
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email. Please check your inbox.');
        setEmail(''); // Clear the email field after successful submission
      }
    } catch (err) {
      newErrors.general = 'An unexpected error occurred. Please try again.';
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email || errors.general) {
      const newErrors = { ...errors };
      delete newErrors.email;
      delete newErrors.general;
      setErrors(newErrors);
    }
    
    // Clear success message when user starts typing again
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 p-16">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-card p-32">
        <div className="mb-24 text-center">
          <div className="w-64 h-64 mx-auto mb-16 bg-primary-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-heading-xl text-neutral-900 dark:text-white mb-8">Reset Password</h1>
          <p className="text-body-base text-neutral-700 dark:text-neutral-300">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-body-sm font-semibold text-neutral-900 dark:text-white mb-8">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full h-48 px-16 border rounded-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-4 text-body-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-48 bg-primary-500 text-white text-body-lg font-semibold rounded-md hover:bg-primary-400 transition-all duration-base shadow-card hover:shadow-card-hover flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-white"></div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Error Message */}
          {errors.general && (
            <div className="p-12 bg-red-50 border border-red-200 rounded-md">
              <p className="text-body-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-12 bg-green-50 border border-green-200 rounded-md">
              <p className="text-body-sm text-green-700">{successMessage}</p>
            </div>
          )}
        </form>

        {/* Back to Login Link */}
        <div className="mt-24 text-center">
          <p className="text-body-sm text-neutral-700 dark:text-neutral-300">
            Remember your password?{' '}
            <Link to="/auth/login" className="text-primary-500 font-semibold hover:text-primary-400">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Auth Options */}
        <div className="mt-16 text-center">
          <Link to="/" className="text-body-sm text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:text-white">
            Back to sign in options
          </Link>
        </div>
      </div>
    </div>
  );
}
