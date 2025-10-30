import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { request } from '../../services/request';
import toast from 'react-hot-toast';
import { USER_KEY } from '../../utils/constants';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawToken = params.get('token');
  const token = (rawToken || '').replace(/[\s'"`]/g, '');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        const rawUser = localStorage.getItem(USER_KEY);
        if (rawUser) {
          toast.error('Missing token');
          navigate('/');
        }
        return;
      }
      try {
        const res = await request(() => api.get('/auth/reset-password/validate', { params: { token } }));
        if (!res?.data?.data?.valid) {
          toast.error('Reset link is invalid or expired');
          navigate('/');
        }
      } catch (_) {
        toast.error('Reset link is invalid or expired');
        navigate('/');
      }
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');

    try {
      setLoading(true);
      await request(() => api.post('/auth/reset-password', { token, password }));
      toast.success('Password reset successfully');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
        <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm password" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition">
          {loading ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Resetting...</span></>) : (<>Reset Password</>)}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
