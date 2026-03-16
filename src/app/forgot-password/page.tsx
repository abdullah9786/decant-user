"use client";

import React, { useState } from 'react';
import { authApi } from '@/lib/api';
import { Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await authApi.forgotPassword(email);
      setMessage('If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setMessage('If an account exists, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-emerald-950">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">We will email you a reset link</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="bg-gray-50 text-gray-600 p-3 rounded text-sm text-center italic">
              {message}
            </div>
          )}
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-[0.2em] text-white bg-emerald-950 hover:bg-emerald-900 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'SEND RESET LINK'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 underline underline-offset-4">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
