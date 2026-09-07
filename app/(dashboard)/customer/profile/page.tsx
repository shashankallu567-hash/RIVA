'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  RotateCcw, 
  Ticket, 
  ShieldCheck,
  Store
} from 'lucide-react';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { returns, activeStore } = useStoreData();
  const myReturns = returns.filter((r) => r.customerId === user?.id || r.customerId === 'usr-cust-101');

  return (
    <DashboardLayout allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
      <div className="space-y-6 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden shrink-0 shadow-lg shadow-emerald-950/50">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'Aarav Sharma'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Registered In-Store Shopper • RIVA Smart Assistant Member</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{user?.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Home Store: {activeStore?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Retail Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Store Credit Balance</span>
            <h3 className="text-2xl font-bold text-emerald-400">₹450</h3>
            <p className="text-[11px] text-slate-500">Auto-credited from approved returns</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Returns</span>
            <h3 className="text-2xl font-bold text-white">{myReturns.length}</h3>
            <p className="text-[11px] text-slate-500">Policy verified & logged</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Recent Store Visits</span>
            <h3 className="text-2xl font-bold text-blue-400">4</h3>
            <p className="text-[11px] text-slate-500">Indiranagar Supermart</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
