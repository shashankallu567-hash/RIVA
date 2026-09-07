'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { ProductTable } from '@/components/products/ProductTable';
import { ReturnStatusBadge, PriorityBadge, TicketStatusBadge } from '@/components/common/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ShieldCheck, 
  Package, 
  Boxes, 
  FileText, 
  Users, 
  TicketCheck, 
  BarChart3, 
  ShieldAlert,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, inventory, policies, returns, tickets, auditLogs } = useStoreData();

  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;
  const autoApprovedReturns = returns.filter((r) => r.status === 'AUTO_APPROVED').length;
  const escalatedDisputes = returns.filter((r) => r.status === 'MANUAL_REVIEW').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-earth-card via-earth-card to-purple-50 border border-earth-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-300/30 text-purple-700 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Operations Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight">
                RIVA Retail HQ Control Tower
              </h1>
              <p className="text-xs sm:text-sm text-earth-muted mt-1">
                Enterprise telemetry, autonomous agent automation rates, catalog master, and security audit trails.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/analytics"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Deep Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enterprise Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Catalog Master Items"
            value={products.length}
            subtitle="FMCG & Kirana SKUs"
            icon={Package}
            variant="soft-blue"
          />
          <StatCard
            title="RIVA AI Automation Rate"
            value="78.4%"
            subtitle="Autonomous instant resolutions"
            icon={Bot}
            variant="olive"
            trend={{ value: '12.5%', isPositive: true }}
          />
          <StatCard
            title="Low-Stock SKUs"
            value={lowStockCount}
            subtitle="Auto-PO alerts active"
            icon={Boxes}
            variant="warm-yellow"
          />
          <StatCard
            title="Total Audit Events"
            value={auditLogs.length}
            subtitle="Immutable security logs"
            icon={ShieldAlert}
            variant="terracotta"
          />
        </div>

        {/* Quick Admin Hub Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-soft-blue-400/50 hover:shadow-md transition-all group card-lift shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-soft-blue-50 text-soft-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-soft-blue-700 flex items-center justify-between">
              <span>Products Master</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">Manage SKU metadata, barcodes, and pricing.</p>
          </Link>

          <Link
            href="/admin/policies"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-sage-500/50 hover:shadow-md transition-all group card-lift shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-sage-700 flex items-center justify-between">
              <span>Return Policy Studio</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">Configure auto-approval limits and category return windows.</p>
          </Link>

          <Link
            href="/admin/users"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-warm-yellow-500/50 hover:shadow-md transition-all group card-lift shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-warm-yellow-50 text-warm-yellow-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-warm-yellow-800 flex items-center justify-between">
              <span>User & Role Directory</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">Manage Customer, Staff, and Admin privileges.</p>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-terracotta-400/50 hover:shadow-md transition-all group card-lift shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-terracotta-700 flex items-center justify-between">
              <span>Security Audit Trail</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">Track every RIVA autonomous decision and staff action.</p>
          </Link>
        </div>

        {/* Recent Audit Logs Strip */}
        <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-earth-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-earth-text text-sm">Live System Audit Stream</h3>
            </div>
            <Link href="/admin/audit-logs" className="text-xs text-sage-700 hover:underline">
              Full Logs ({auditLogs.length}) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-earth-border/60">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sage-700 text-[11px] bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                    {log.action}
                  </span>
                  <span className="text-earth-text font-medium">{log.details}</span>
                </div>
                <div className="text-[11px] text-earth-muted whitespace-nowrap">
                  {formatDate(log.timestamp)} by <strong>{log.userName}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
