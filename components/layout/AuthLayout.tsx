'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-earth-bg text-earth-text flex flex-col font-sans selection:bg-sage-200">
      <DemoRoleSwitcher />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-sage-600 flex items-center justify-center shadow-md shadow-sage-900/10 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-2xl text-earth-text tracking-wide block leading-none">RIVA</span>
                <span className="text-[10px] text-sage-700 font-semibold tracking-wider uppercase">FMCG Intelligence</span>
              </div>
            </Link>
            <p className="text-xs text-earth-muted mt-2 font-medium">Retail Intelligence & Virtual Assistant</p>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-sage-50 border border-sage-200 text-[11px] text-sage-800 font-medium">
              <Sparkles className="w-3 h-3 text-sage-600" />
              <span>&ldquo;Good Choices. Brighter Lives.&rdquo;</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-earth-text/5 relative overflow-hidden">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-xl font-bold text-earth-text tracking-tight">{title}</h1>
              <p className="text-xs text-earth-muted mt-1">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-earth-muted hover:text-earth-text transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to RIVA Main Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
