'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { MailCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      setIsVerified(true);
    }
  };

  return (
    <AuthLayout
      title="Verify your Email Address"
      subtitle="Complete your retail profile registration with one-time verification"
    >
      {isVerified ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Email Address Verified</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your account is fully activated. You can now access in-store assistant kiosks and return portals.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/customer"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-900/30"
            >
              <span>Launch Customer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-slate-700">
              <MailCheck className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400">
              We have dispatched a 6-digit confirmation code to your inbox.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 592810"
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-center text-base tracking-widest font-mono text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-xs"
          >
            <span>Verify & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
