'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { UserRole } from '@/types';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await signup(name, email, role);
      router.push(`/${role.toLowerCase()}`);
    } catch {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your RIVA Account"
      subtitle="Join India's next-gen intelligent FMCG retail platform"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-earth-text mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              required
              className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 focus:ring-1 focus:ring-sage-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-earth-text mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              required
              className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 focus:ring-1 focus:ring-sage-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-earth-text mb-1">Password</label>
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
            <label className="block text-xs font-semibold text-earth-text mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 focus:ring-1 focus:ring-sage-600 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-earth-text mb-1.5">Select Role</label>
          <div className="grid grid-cols-3 gap-2">
            {(['CUSTOMER', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  role === r
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
          className="w-full py-3 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2 text-xs mt-3"
        >
          {isLoading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-earth-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-sage-700 hover:text-sage-800 font-semibold underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
