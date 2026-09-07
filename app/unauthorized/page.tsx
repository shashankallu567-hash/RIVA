'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';
import { Navbar } from '@/components/common/Navbar';

export default function UnauthorizedPage() {
  const { role, switchPersona } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <DemoRoleSwitcher />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            HTTP 403 Forbidden
          </span>

          <h1 className="text-2xl font-bold text-white mt-4 mb-2">Access Restricted</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You do not possess the necessary role credentials to view this area. Your current active role is <strong className="text-emerald-400">{role || 'None'}</strong>.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-left text-xs space-y-2 mb-4">
              <div className="font-semibold text-slate-300">Quick Hackathon Role Switch:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => switchPersona('CUSTOMER')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-center"
                >
                  Customer
                </button>
                <button
                  onClick={() => switchPersona('STAFF')}
                  className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-center"
                >
                  Staff
                </button>
                <button
                  onClick={() => switchPersona('ADMIN')}
                  className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-center"
                >
                  Admin
                </button>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2 text-xs"
            >
              <Home className="w-4 h-4" />
              <span>Return to RIVA Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
