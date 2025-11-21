import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, isSupabaseConfigured } from '../lib/supabase';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    const newErrors: Record<string, string> = {};
    setSuccessMessage('');

    // Validate all fields
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { data, error } = await signUp(email, password);

      if (error) {
        newErrors.general = error.message;
        setErrors(newErrors);
      } else if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setSuccessMessage('Account created! Please check your email to confirm your account.');
        } else {
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
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
    if (errors.email) {
      const newErrors = { ...errors };
      delete newErrors.email;
      setErrors(newErrors);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      const newErrors = { ...errors };
      delete newErrors.confirmPassword;
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 p-16">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-card p-32">
        <div className="mb-24 text-center">
          <div className="w-64 h-64 mx-auto mb-16 bg-primary-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-heading-xl text-neutral-900 dark:text-white mb-8">Create Account</h1>
          <p className="text-body-base text-neutral-700 dark:text-neutral-300">
            Sign up to start tracking your expenses
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
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="mt-4 text-body-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-4 text-body-xs text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-body-sm font-semibold text-neutral-900 dark:text-white mb-8">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full h-48 px-16 border rounded-md text-body-base focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-4 text-body-sm text-red-600">{errors.confirmPassword}</p>
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
              'Create Account'
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

        {/* Sign In Link */}
        <div className="mt-24 text-center">
          <p className="text-body-sm text-neutral-700 dark:text-neutral-300">
            Already have an account?{' '}
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
