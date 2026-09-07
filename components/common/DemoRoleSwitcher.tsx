'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, UserCheck, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, role, switchPersona } = useAuth();

  return (
    <div className="bg-earth-card-soft border-b border-earth-border text-xs py-1.5 px-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sage-500/15 text-sage-700 font-semibold px-2 py-0.5 rounded border border-sage-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-sage-600" />
            <span>HACKATHON DEMO SWITCHER</span>
          </div>
          <span className="hidden sm:inline text-earth-border">|</span>
          <span className="text-earth-muted hidden md:inline">
            Active Persona: <strong className="text-earth-text font-medium">{user?.name || 'Guest'}</strong> ({role || 'NONE'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-earth-muted font-medium hidden sm:inline mr-1">Switch Role:</span>
          
          {/* Customer button */}
          <button
            onClick={() => switchPersona('CUSTOMER')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium text-xs ${
              role === 'CUSTOMER'
                ? 'bg-sage-600 text-white shadow-sm ring-1 ring-sage-500'
                : 'bg-earth-card text-earth-muted hover:text-earth-text border border-earth-border'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          {/* Staff button */}
          <button
            onClick={() => switchPersona('STAFF')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium text-xs ${
              role === 'STAFF'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-earth-card text-earth-muted hover:text-earth-text border border-earth-border'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>

          {/* Admin button */}
          <button
            onClick={() => switchPersona('ADMIN')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium text-xs ${
              role === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-earth-card text-earth-muted hover:text-earth-text border border-earth-border'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Quick jump to active role dashboard */}
          {role && (
            <Link
              href={`/${role.toLowerCase()}`}
              className="ml-2 text-sage-700 hover:text-sage-800 underline font-semibold flex items-center gap-1"
            >
              Dashboard &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
