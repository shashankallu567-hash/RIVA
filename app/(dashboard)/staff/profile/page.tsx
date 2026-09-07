'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { User, Mail, Phone, Store, Wrench, ShieldCheck } from 'lucide-react';

export default function StaffProfilePage() {
  const { user } = useAuth();
  const { activeStore } = useStoreData();

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6 max-w-4xl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-blue-500/40 flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden shrink-0 shadow-lg shadow-blue-950/50">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'Priya Sundaram'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  STORE FLOOR SUPERVISOR
                </span>
              </div>
              <p className="text-xs text-slate-400">Authorized Retail Floor Staff • Inventory & Returns Desk</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{user?.phone || '+91 98234 56789'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Assigned Store: {activeStore?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Tier-2 Return Override Permission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
