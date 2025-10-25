import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../../services/authService';
import ErrorMessage from '../../components/common/ErrorMessage';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Username
              </label>
              <input
                type="text"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Only letters, numbers and underscore'
                  }
                })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Email address
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Confirm password
              </label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
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