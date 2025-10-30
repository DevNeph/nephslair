import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../../services/authService';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useFormHandler } from '../../utils/useFormHandler';
import { request } from '../../services/request';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const form = useFormHandler({ username: '', email: '', password: '', confirmPassword: '' }, (values) => {
    const errors = {};
    if (!values.username?.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      errors.username = 'Only letters, numbers and underscore';
    } else if (values.username.length < 3) {
      errors.username = 'Minimum 3 characters';
    }

    if (!values.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password?.trim()) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Minimum 6 characters';
    }

    if (!values.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    await request(() => registerUser(values), setError, undefined);
    if (!setError) {
      navigate('/login');
    }
  });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-500">Join Nephslair today</p>
        </div>

        {/* Form Container */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 backdrop-blur-sm">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.form.username}
                onChange={form.handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="johndoe"
              />
              {form.errors.username && (
                <p className="text-red-400 text-sm mt-1">{form.errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.form.email}
                onChange={form.handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="you@example.com"
              />
              {form.errors.email && (
                <p className="text-red-400 text-sm mt-1">{form.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.form.password}
                onChange={form.handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="Create a password"
              />
              {form.errors.password && (
                <p className="text-red-400 text-sm mt-1">{form.errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.form.confirmPassword}
                onChange={form.handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="Confirm your password"
              />
              {form.errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{form.errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={form.loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {form.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-900/50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full text-center py-3 border border-neutral-800 rounded-lg text-gray-400 hover:bg-neutral-800/50 hover:text-gray-300 transition-all duration-200"
          >
            Sign in instead
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;