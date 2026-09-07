'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { ReturnStatusBadge } from '@/components/common/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  computeStoreHealthScore,
  computeReturnAnalytics,
  computeInventoryIntelligence,
  generateAIInsights,
  detectAnomalies,
} from '@/lib/analytics';
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
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';

function MiniHealthRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#EFE4D2" strokeWidth="8" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={c - (score / 100) * c}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { products, inventory, policies, returns, tickets, auditLogs, orders, activityLogs } = useStoreData();

  const health = useMemo(
    () => computeStoreHealthScore(inventory, returns, tickets, orders),
    [inventory, returns, tickets, orders]
  );
  const returnAnalytics = useMemo(() => computeReturnAnalytics(returns), [returns]);
  const invIntel = useMemo(
    () => computeInventoryIntelligence(inventory, products, activityLogs),
    [inventory, products, activityLogs]
  );
  const anomalies = useMemo(
    () => detectAnomalies(inventory, activityLogs, returns, tickets),
    [inventory, activityLogs, returns, tickets]
  );
  const aiInsights = useMemo(
    () => generateAIInsights(health, invIntel, returnAnalytics, anomalies),
    [health, invIntel, returnAnalytics, anomalies]
  );

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
                Enterprise telemetry, autonomous agent performance, catalog master, and security audit trails.
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

        {/* Store Health Score + Live KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Health Score Card */}
          <div className="lg:col-span-3 bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-earth-text font-bold text-xs w-full">
              <Activity className="w-4 h-4 text-sage-600" />
              <span>Store Health Score</span>
            </div>
            <div className="relative flex items-center justify-center">
              <MiniHealthRing score={health.score} color={health.color} />
              <div className="absolute text-center">
                <div className="text-xl font-black text-earth-text">{health.score}</div>
                <div className="text-[10px] font-bold" style={{ color: health.color }}>{health.grade}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-earth-text">{health.label}</div>
              <div className="text-[11px] text-earth-muted">
                {health.trend === 'UP' ? '↑ Improving' : health.trend === 'DOWN' ? '↓ Declining' : '→ Stable'}
              </div>
            </div>
            <Link href="/admin/analytics" className="w-full text-center text-xs text-sage-700 hover:underline">
              Full Breakdown →
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Catalog Master Items"
              value={products.length}
              subtitle="FMCG & Kirana SKUs"
              icon={Package}
              variant="soft-blue"
            />
            <StatCard
              title="RIVA AI Automation Rate"
              value={`${returnAnalytics.autoApprovalRate}%`}
              subtitle={`${returnAnalytics.autoApproved} of ${returnAnalytics.totalReturns} returns resolved`}
              icon={Bot}
              variant="olive"
              trend={returnAnalytics.autoApprovalRate > 60
                ? { value: 'Above 60% target', isPositive: true }
                : { value: 'Below target', isPositive: false }
              }
            />
            <StatCard
              title="Low-Stock SKUs"
              value={invIntel.lowStockCount + invIntel.outOfStockCount}
              subtitle={`${invIntel.outOfStockCount} out of stock, ${invIntel.lowStockCount} low`}
              icon={Boxes}
              variant="warm-yellow"
            />
            <StatCard
              title="Open Support Tickets"
              value={openTicketsCount}
              subtitle="Floor & inventory issues"
              icon={TicketCheck}
              variant="terracotta"
            />
            <StatCard
              title="Return Value Processed"
              value={formatCurrency(returnAnalytics.totalValue)}
              subtitle="Instant tokens & vouchers"
              icon={TrendingUp}
              variant="soft-blue"
            />
            <StatCard
              title="Total Audit Events"
              value={auditLogs.length}
              subtitle="Immutable security logs"
              icon={ShieldAlert}
              variant="terracotta"
            />
          </div>
        </div>

        {/* AI Insights + Smart Reorder Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-earth-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-600" />
                <h3 className="font-bold text-earth-text text-sm">RIVA AI Insights</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sage-500/10 text-sage-700 border border-sage-500/20 font-semibold">
                LIVE DATA
              </span>
            </div>

            {aiInsights.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-earth-muted text-xs">
                <CheckCircle2 className="w-7 h-7 text-sage-500" />
                <span>All systems healthy. No critical actions required.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.slice(0, 4).map((insight, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      insight.priority === 'HIGH'
                        ? 'bg-terracotta-50 border-terracotta-200'
                        : insight.priority === 'MEDIUM'
                        ? 'bg-warm-yellow-50 border-warm-yellow-200'
                        : 'bg-sage-50 border-sage-200'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-earth-text">{insight.title}</div>
                      <p className="text-earth-muted mt-0.5 text-[11px]">{insight.body}</p>
                      {insight.action && insight.actionHref && (
                        <Link
                          href={insight.actionHref}
                          className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-sage-700 hover:underline"
                        >
                          {insight.action} <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Reorder Queue */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-earth-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-bold text-earth-text text-sm">Smart Reorder Queue</h3>
              </div>
              <Link href="/staff/inventory" className="text-xs text-sage-700 hover:underline flex items-center gap-1">
                Manage All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {invIntel.reorderQueue.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-earth-muted text-xs">
                <CheckCircle2 className="w-7 h-7 text-sage-500" />
                <span>All products are adequately stocked.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {invIntel.reorderQueue.slice(0, 6).map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-xl bg-earth-secondary border border-earth-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-earth-text truncate">{item.productName}</div>
                      <div className="text-earth-muted text-[11px]">
                        {item.aisle} • Suggest order: {item.suggestedOrderQty} units
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-earth-text">{item.currentQty} left</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : item.urgency === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.urgency}
                      </span>
                    </div>
                  </div>
                ))}
                {invIntel.reorderQueue.length > 6 && (
                  <Link
                    href="/staff/inventory"
                    className="block text-center text-xs text-sage-700 hover:underline pt-1"
                  >
                    +{invIntel.reorderQueue.length - 6} more items need restocking →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Admin Hub Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-soft-blue-400/50 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-soft-blue-50 text-soft-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-soft-blue-700 flex items-center justify-between">
              <span>Products Master</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">{products.length} SKUs • Manage metadata, barcodes, pricing.</p>
          </Link>

          <Link
            href="/admin/policies"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-sage-500/50 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-sage-700 flex items-center justify-between">
              <span>Return Policy Studio</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">{policies.length} policies • Configure auto-approval thresholds.</p>
          </Link>

          <Link
            href="/admin/users"
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-warm-yellow-500/50 hover:shadow-md transition-all group shadow-sm"
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
            className="p-5 rounded-2xl bg-earth-card border border-earth-border hover:border-terracotta-400/50 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-text group-hover:text-terracotta-700 flex items-center justify-between">
              <span>Security Audit Trail</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-earth-muted mt-1">{auditLogs.length} events • Every RIVA decision logged.</p>
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
            {auditLogs.slice(0, 5).map((log) => (
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
