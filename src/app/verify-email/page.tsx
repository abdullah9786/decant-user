"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setVerifying(true);
      setMessage(null);
      try {
        const response = await authApi.verifyEmail(token);
        if (response.data?.verified) {
          setVerified(true);
          setMessage('Email verified. You can now sign in.');
          setTimeout(() => router.push('/login?verified=true'), 1200);
        } else {
          setMessage(response.data?.message || 'Invalid or expired token.');
        }
      } catch (err: any) {
        setMessage(err.response?.data?.detail || 'Verification failed.');
      } finally {
        setVerifying(false);
      }
    };
    run();
  }, [token, router]);

  const handleResend = async () => {
    if (!email) return;
    setSending(true);
    setMessage(null);
    try {
      await authApi.resendVerification(email);
      setMessage('Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-serif text-emerald-950">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">Activate your SCENTS account</p>
        </div>

        {verifying && (
          <div className="flex flex-col items-center space-y-3 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-xs uppercase tracking-widest">Verifying...</p>
          </div>
        )}

        {!verifying && verified && (
          <div className="flex flex-col items-center space-y-3 text-green-600">
            <CheckCircle2 size={36} />
            <p className="text-xs uppercase tracking-widest">{message}</p>
          </div>
        )}

        {!verifying && !verified && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 p-4 text-xs text-gray-500 uppercase tracking-widest">
              {message || 'We sent a verification link to your email.'}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm"
                placeholder="Email Address"
              />
            </div>
            <button
              onClick={handleResend}
              disabled={sending || !email}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-[0.2em] text-white bg-emerald-950 hover:bg-emerald-900 transition-all disabled:opacity-70"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : 'RESEND VERIFICATION EMAIL'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
