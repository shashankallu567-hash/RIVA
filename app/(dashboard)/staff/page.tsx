'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { ProductTable } from '@/components/products/ProductTable';
import { ReturnStatusBadge, PriorityBadge, TicketStatusBadge } from '@/components/common/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Wrench, 
  Boxes, 
  RotateCcw, 
  TicketCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Activity,
  Bot
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { products, inventory, returns, tickets, activeStore } = useStoreData();

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minThreshold);
  const openReturns = returns.filter((r) => r.status === 'MANUAL_REVIEW');
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Store Floor Operations • {activeStore?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Store Operations Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Real-time inventory thresholds, manual return escalations, and automated support tickets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/staff/inventory"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30"
              >
                <Boxes className="w-4 h-4" />
                <span>Manage Stock</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Low-Stock Alerts"
            value={lowStockItems.length}
            subtitle="Requires Restocking"
            icon={AlertTriangle}
            variant="warm-yellow"
          />
          <StatCard
            title="Manual Return Queue"
            value={openReturns.length}
            subtitle="Disputed / Unsealed Items"
            icon={RotateCcw}
            variant="terracotta"
          />
          <StatCard
            title="Active Support Tickets"
            value={openTickets.length}
            subtitle="Floor & Inventory Issues"
            icon={TicketCheck}
            variant="soft-blue"
          />
          <StatCard
            title="Auto-Resolved by RIVA"
            value={returns.filter(r => r.status === 'AUTO_APPROVED').length}
            subtitle="Zero Staff Time Spent"
            icon={Bot}
            variant="olive"
          />
        </div>

        {/* Low Stock Alerts & Urgent Tickets Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Watch */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Critical Low-Stock Alerts</h3>
              </div>
              <Link href="/staff/inventory" className="text-xs text-blue-400 hover:underline">
                View All Inventory &rarr;
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">All shelf items healthy.</div>
            ) : (
              <div className="divide-y divide-slate-800/60 space-y-1">
                {lowStockItems.map((inv) => {
                  const prod = products.find((p) => p.id === inv.productId);
                  if (!prod) return null;
                  return (
                    <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{prod.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {prod.location.aisle} • {prod.location.shelf}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-400 font-mono">
                          {inv.quantity} {inv.quantity === 0 ? '(OUT OF STOCK)' : 'remaining'}
                        </div>
                        <div className="text-[10px] text-slate-500">Min: {inv.minThreshold}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Open Escalated Returns */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Escalated Return Approvals</h3>
              </div>
              <Link href="/staff/returns" className="text-xs text-blue-400 hover:underline">
                Review Queue &rarr;
              </Link>
            </div>

            {openReturns.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No pending manual reviews.</div>
            ) : (
              <div className="divide-y divide-slate-800/60 space-y-1">
                {openReturns.map((ret) => (
                  <div key={ret.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{ret.productName}</div>
                      <div className="text-[11px] text-slate-400">
                        Cust: {ret.customerName} • {formatCurrency(ret.amount || ret.price || 0)}
                      </div>
                    </div>
                    <Link
                      href="/staff/returns"
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Inventory Overview Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Real-Time Inventory & Shelf Management</h2>
            <span className="text-xs text-slate-400">Use +/- buttons to update physical shelf counts</span>
          </div>
          <ProductTable showInventoryControls={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}
