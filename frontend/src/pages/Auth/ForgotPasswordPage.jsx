import React, { useState } from 'react';
import api from '../../services/api';
import { request } from '../../services/request';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email');
    try {
      setLoading(true);
      await request(() => api.post('/auth/forgot-password', { email }));
      toast.success('If the email exists, a reset link has been sent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-4">Forgot Password</h1>
      <p className="text-gray-400 mb-6">Enter your email to receive a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition">
          {loading ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Sending...</span></>) : (<>Send Reset Link</>)}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
