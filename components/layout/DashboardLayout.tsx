'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  allowedRoles,
}) => {
  const { role, isLoading, switchPersona } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-earth-bg flex flex-col items-center justify-center text-earth-muted">
        <div className="w-10 h-10 border-4 border-sage-500/20 border-t-sage-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-earth-text">Loading RIVA Intelligence Engine...</p>
      </div>
    );
  }

  // If role does not match allowed roles
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-earth-bg text-earth-text flex flex-col">
        <DemoRoleSwitcher />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-earth-card border border-earth-border rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-terracotta-500/10 border border-terracotta-500/20 text-terracotta-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-earth-text mb-2">Unauthorized Role Access</h2>
            <p className="text-sm text-earth-muted mb-6 leading-relaxed">
              This portal requires <span className="font-semibold text-earth-text">{allowedRoles.join(' or ')}</span> privileges. You are currently logged in as a <span className="font-semibold text-sage-600">{role}</span>.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => switchPersona(allowedRoles[0])}
                className="w-full py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <span>Switch to {allowedRoles[0]} Persona</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href={`/${role.toLowerCase()}`}
                className="block text-xs text-earth-muted hover:text-earth-text pt-2"
              >
                Return to your {role.toLowerCase()} dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-bg text-earth-text flex flex-col font-sans selection:bg-sage-500/20">
      <DemoRoleSwitcher />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
