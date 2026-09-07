'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { ProductTable } from '@/components/products/ProductTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  computeInventoryIntelligence,
  computeReturnAnalytics,
  computeStoreHealthScore,
} from '@/lib/analytics';
import {
  Wrench,
  Boxes,
  RotateCcw,
  TicketCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Bot,
  Zap,
  Package,
  Clock,
  TrendingDown,
  Activity,
} from 'lucide-react';

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-earth-secondary rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { products, inventory, returns, tickets, activityLogs, orders, activeStore } = useStoreData();

  const invIntel = useMemo(
    () => computeInventoryIntelligence(inventory, products, activityLogs),
    [inventory, products, activityLogs]
  );
  const returnAnalytics = useMemo(() => computeReturnAnalytics(returns), [returns]);
  const health = useMemo(
    () => computeStoreHealthScore(inventory, returns, tickets, orders),
    [inventory, returns, tickets, orders]
  );

  const openReturns = returns.filter((r) => r.status === 'MANUAL_REVIEW');
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  // Demand forecast: items in reorder queue with urgency context
  const criticalReorders = invIntel.reorderQueue.filter(r => r.urgency === 'CRITICAL');
  const highReorders = invIntel.reorderQueue.filter(r => r.urgency === 'HIGH');

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6">
        {/* Header — earth theme (consistent with rest of app) */}
        <div className="bg-gradient-to-r from-earth-card via-earth-card to-blue-50 border border-earth-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-300/30 text-blue-700 text-xs font-semibold mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Store Floor Operations • {activeStore?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight">
                Store Operations Command
              </h1>
              <p className="text-xs sm:text-sm text-earth-muted mt-1">
                Real-time inventory thresholds, manual return escalations, and automated support tickets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-earth-muted">Store Health</div>
                <div
                  className="text-2xl font-black"
                  style={{ color: health.color }}
                >
                  {health.score}
                  <span className="text-sm font-bold ml-0.5">/{health.grade}</span>
                </div>
              </div>
              <Link
                href="/staff/inventory"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Boxes className="w-4 h-4" />
                <span>Manage Stock</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Operational KPI Cards — data-driven */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Critical Stockouts"
            value={invIntel.outOfStockCount}
            subtitle={`${invIntel.lowStockCount} more at low-stock threshold`}
            icon={AlertTriangle}
            variant="warm-yellow"
          />
          <StatCard
            title="Manual Return Queue"
            value={openReturns.length}
            subtitle="Disputed / unsealed items"
            icon={RotateCcw}
            variant="terracotta"
          />
          <StatCard
            title="Active Support Tickets"
            value={openTickets.length}
            subtitle="Floor & inventory issues"
            icon={TicketCheck}
            variant="soft-blue"
          />
          <StatCard
            title="Auto-Resolved by RIVA"
            value={returnAnalytics.autoApproved}
            subtitle={`${returnAnalytics.autoApprovalRate}% automation rate`}
            icon={Bot}
            variant="olive"
            trend={returnAnalytics.autoApprovalRate > 60
              ? { value: 'Above target', isPositive: true }
              : { value: 'Below target', isPositive: false }
            }
          />
        </div>

        {/* Demand Forecast + Escalated Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Reorder & Demand Forecast */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-earth-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-bold text-earth-text text-sm">Smart Reorder & Demand Forecast</h3>
              </div>
              <Link href="/staff/inventory" className="text-xs text-sage-700 hover:underline flex items-center gap-1">
                Full Inventory <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                <div className="text-lg font-black text-red-700">{criticalReorders.length}</div>
                <div className="text-[10px] font-bold text-red-600 uppercase">Critical</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-lg font-black text-amber-700">{highReorders.length}</div>
                <div className="text-[10px] font-bold text-amber-600 uppercase">High</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-lg font-black text-blue-700">
                  {invIntel.reorderQueue.filter(r => r.urgency === 'MEDIUM').length}
                </div>
                <div className="text-[10px] font-bold text-blue-600 uppercase">Medium</div>
              </div>
            </div>

            {invIntel.reorderQueue.length === 0 ? (
              <div className="py-6 text-center text-earth-muted text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-sage-500" />
                <span>All shelf items adequately stocked.</span>
              </div>
            ) : (
              <div className="divide-y divide-earth-border/60">
                {invIntel.reorderQueue.slice(0, 7).map((item) => {
                  const stockPct = item.minThreshold > 0
                    ? Math.min(100, (item.currentQty / (item.minThreshold * 3)) * 100)
                    : 0;
                  const barColor =
                    item.urgency === 'CRITICAL' ? '#C87552' :
                    item.urgency === 'HIGH' ? '#E8B94F' : '#8FAFC0';
                  return (
                    <div key={item.productId} className="py-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-earth-text text-xs truncate">{item.productName}</div>
                          <div className="text-[11px] text-earth-muted">
                            {item.aisle} •{' '}
                            {item.daysUntilStockout !== undefined
                              ? `~${item.daysUntilStockout}d until stockout`
                              : 'Reorder needed'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono font-bold text-earth-text text-xs">{item.currentQty}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            item.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            item.urgency === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.urgency}
                          </span>
                        </div>
                      </div>
                      <ProgressBar pct={stockPct} color={barColor} />
                    </div>
                  );
                })}
              </div>
            )}

            {invIntel.reorderQueue.length > 7 && (
              <Link
                href="/staff/inventory"
                className="block text-center text-xs text-sage-700 hover:underline pt-1"
              >
                +{invIntel.reorderQueue.length - 7} more items need restocking →
              </Link>
            )}
          </div>

          {/* Escalated Return Approvals */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-earth-border pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-bold text-earth-text text-sm">Escalated Return Approvals</h3>
              </div>
              <Link href="/staff/returns" className="text-xs text-sage-700 hover:underline flex items-center gap-1">
                Review Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Return stats summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-sage-50 border border-sage-200">
                <div className="text-lg font-black text-sage-700">{returnAnalytics.autoApproved}</div>
                <div className="text-[10px] font-bold text-sage-600 uppercase">Auto OK</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-lg font-black text-amber-700">{returnAnalytics.manualReview}</div>
                <div className="text-[10px] font-bold text-amber-600 uppercase">Pending</div>
              </div>
              <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                <div className="text-lg font-black text-red-700">{returnAnalytics.rejected}</div>
                <div className="text-[10px] font-bold text-red-600 uppercase">Rejected</div>
              </div>
            </div>

            {openReturns.length === 0 ? (
              <div className="py-6 text-center text-earth-muted text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-sage-500" />
                <span>No pending manual reviews. Queue clear.</span>
              </div>
            ) : (
              <div className="divide-y divide-earth-border/60">
                {openReturns.slice(0, 5).map((ret) => (
                  <div key={ret.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-earth-text truncate">{ret.productName}</div>
                      <div className="text-[11px] text-earth-muted">
                        {ret.customerName} • {formatCurrency(ret.amount || ret.price || 0)} • {ret.reason}
                      </div>
                    </div>
                    <Link
                      href="/staff/returns"
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Inventory Health */}
        <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-earth-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sage-600" />
              <h3 className="font-bold text-earth-text text-sm">Inventory Health by Category</h3>
            </div>
            <span className="text-[11px] text-earth-muted">
              {invIntel.inStockCount} healthy · {invIntel.lowStockCount} low · {invIntel.outOfStockCount} empty
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {invIntel.categoryBreakdown.slice(0, 9).map((cat) => {
              const healthPct = cat.totalSKUs > 0
                ? Math.round((cat.inStock / cat.totalSKUs) * 100)
                : 100;
              const barColor =
                cat.stockoutRisk === 'HIGH' ? '#C87552' :
                cat.stockoutRisk === 'MEDIUM' ? '#E8B94F' : '#687B4F';
              return (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl bg-earth-secondary border border-earth-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-earth-text truncate pr-2">{cat.category}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      cat.stockoutRisk === 'HIGH' ? 'bg-red-100 text-red-700' :
                      cat.stockoutRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {cat.stockoutRisk}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-lg font-black" style={{ color: barColor }}>
                      {healthPct}%
                    </div>
                    <div className="text-[11px] text-earth-muted leading-tight">
                      {cat.inStock}/{cat.totalSKUs} SKUs healthy
                      {cat.outOfStock > 0 && (
                        <span className="text-terracotta-600 block">{cat.outOfStock} out of stock</span>
                      )}
                    </div>
                  </div>
                  <ProgressBar pct={healthPct} color={barColor} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Inventory Overview Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-earth-text tracking-tight">
              Real-Time Inventory & Shelf Management
            </h2>
            <span className="text-xs text-earth-muted">Use +/- buttons to update physical shelf counts</span>
          </div>
          <ProductTable showInventoryControls={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}
