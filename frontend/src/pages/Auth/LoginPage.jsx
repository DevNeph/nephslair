import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const LoginPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await login(data);
      updateUser(response.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to continue to Nephslair</p>
        </div>

        {/* Form Container */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 backdrop-blur-sm">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register('password', { required: 'Password is required' })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 transition-colors"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
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
                New to Nephslair?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full text-center py-3 border border-neutral-800 rounded-lg text-gray-400 hover:bg-neutral-800/50 hover:text-gray-300 transition-all duration-200"
          >
            Create an account
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default LoginPage;