"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;
      
      setAuth(user, access_token);
      router.push('/profile');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail && String(detail).toLowerCase().includes('verify')) {
        setError('Please verify your email before logging in.');
        setShowResend(true);
      } else {
        setError(detail || 'Invalid email or password');
        setShowResend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authApi.resendVerification(email);
      setError('Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-emerald-950">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center italic">
              {error}
            </div>
          )}
          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full text-[10px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600 pb-1 disabled:opacity-60"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                placeholder="Email Address"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-[0.2em] text-white bg-emerald-950 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'SIGN IN'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-500 underline underline-offset-4">
                Register now
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <Link href="/forgot-password" className="font-bold text-emerald-600 hover:text-emerald-500 underline underline-offset-4">
                Forgot password?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
