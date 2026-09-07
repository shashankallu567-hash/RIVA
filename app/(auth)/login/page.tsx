'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { UserRole } from '@/types';
import { UserCheck, Wrench, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { DEMO_USERS } from '@/data/mockUsers';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('aarav@customer.riva.ai');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email, selectedRole);
      router.push(`/${selectedRole.toLowerCase()}`);
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const demo = DEMO_USERS[role.toLowerCase() as keyof typeof DEMO_USERS];
      await login(demo.email, role);
      router.push(`/${role.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to RIVA"
      subtitle="Access retail intelligence, FMCG catalog, returns, and order management"
    >
      {/* 1-Click Demo Accounts */}
      <div className="mb-6 p-4 rounded-2xl bg-earth-bg/70 border border-earth-border">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-earth-text uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sage-600" />
            Quick 1-Click Demo Personas
          </span>
          <span className="text-[10px] text-sage-800 font-semibold bg-sage-100 px-2 py-0.5 rounded border border-sage-200">
            Hackathon Ready
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('CUSTOMER')}
            className="p-2.5 rounded-xl bg-white hover:bg-sage-50 border border-earth-border hover:border-sage-600 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-earth-text group-hover:text-sage-700">
              <UserCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>Customer</span>
            </div>
            <div className="text-[10px] text-earth-muted truncate mt-0.5 font-medium">Aarav (Shopper)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('STAFF')}
            className="p-2.5 rounded-xl bg-white hover:bg-sage-50 border border-earth-border hover:border-sage-600 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-earth-text group-hover:text-sage-700">
              <Wrench className="w-3.5 h-3.5 text-sage-600" />
              <span>Staff</span>
            </div>
            <div className="text-[10px] text-earth-muted truncate mt-0.5 font-medium">Priya (Floor Mgr)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('ADMIN')}
            className="p-2.5 rounded-xl bg-white hover:bg-sage-50 border border-earth-border hover:border-sage-600 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-earth-text group-hover:text-sage-700">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>Admin</span>
            </div>
            <div className="text-[10px] text-earth-muted truncate mt-0.5 font-medium">Vikram (Ops HQ)</div>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-earth-border w-full" />
        <span className="bg-earth-card px-3 text-[11px] text-earth-muted uppercase tracking-wider font-semibold absolute">
          Or Enter Credentials
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-earth-text mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@riva.ai"
              required
              className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 focus:ring-1 focus:ring-sage-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-earth-text">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-sage-700 hover:text-sage-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 focus:ring-1 focus:ring-sage-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-earth-text mb-1.5">Role Permission</label>
          <div className="grid grid-cols-3 gap-2">
            {(['CUSTOMER', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  selectedRole === r
                    ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                    : 'bg-white text-earth-muted border-earth-border hover:text-earth-text hover:bg-earth-bg/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2 text-xs mt-2"
        >
          {isLoading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In with Selected Role</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-earth-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-sage-700 hover:text-sage-800 font-semibold underline">
          Create new account
        </Link>
      </div>
    </AuthLayout>
  );
}
