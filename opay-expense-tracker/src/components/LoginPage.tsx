import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmail, isSupabaseConfigured } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validate all fields
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
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
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          newErrors.general = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          newErrors.general = 'Please confirm your email address before signing in';
        } else {
          newErrors.general = error.message;
        }
        setErrors(newErrors);
      } else if (data.user) {
        // Successfully signed in, navigate to app
        navigate('/');
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
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (errors.password || errors.general) {
      const newErrors = { ...errors };
      delete newErrors.password;
      delete newErrors.general;
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 p-16">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-card p-32">
        <div className="mb-24 text-center">
          <div className="w-64 h-64 mx-auto mb-16 bg-primary-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-heading-xl text-neutral-900 dark:text-white mb-8">Welcome Back</h1>
          <p className="text-body-base text-neutral-700 dark:text-neutral-300">
            Sign in to continue tracking your expenses
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-body-sm font-semibold text-neutral-900 dark:text-white mb-8">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full h-48 px-16 border rounded-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-4 text-body-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link to="/auth/forgot-password" className="text-body-sm text-primary-500 hover:text-primary-400">
              Forgot password?
            </Link>
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
              'Sign In'
            )}
          </button>

          {/* Error Message */}
          {errors.general && (
            <div className="p-12 bg-red-50 border border-red-200 rounded-md">
              <p className="text-body-sm text-red-700">{errors.general}</p>
            </div>
          )}
        </form>

        {/* Sign Up Link */}
        <div className="mt-24 text-center">
          <p className="text-body-sm text-neutral-700 dark:text-neutral-300">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary-500 font-semibold hover:text-primary-400">
              Sign up
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
