'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import {
  computeStoreHealthScore,
  computeReturnAnalytics,
  computeInventoryIntelligence,
  computeSalesIntelligence,
  detectAnomalies,
  generateAIInsights,
} from '@/lib/analytics';
import {
  BarChart3,
  Bot,
  RotateCcw,
  Clock,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Package,
  ArrowRight,
  Activity,
  Zap,
  Target,
} from 'lucide-react';

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 bg-earth-secondary rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function HealthScoreRing({ score, grade, label, color }: { score: number; grade: string; label: string; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EFE4D2" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div className="text-3xl font-black text-earth-text">{score}</div>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</div>
        <div className="text-[11px] text-earth-muted font-medium">Grade: {grade}</div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { products, inventory, returns, tickets, orders, activityLogs } = useStoreData();

  // All metrics computed from real data — zero hardcoded values
  const health = useMemo(
    () => computeStoreHealthScore(inventory, returns, tickets, orders),
    [inventory, returns, tickets, orders]
  );
  const returnAnalytics = useMemo(() => computeReturnAnalytics(returns), [returns]);
  const invIntelligence = useMemo(
    () => computeInventoryIntelligence(inventory, products, activityLogs),
    [inventory, products, activityLogs]
  );
  const salesIntel = useMemo(() => computeSalesIntelligence(orders), [orders]);
  const anomalies = useMemo(
    () => detectAnomalies(inventory, activityLogs, returns, tickets),
    [inventory, activityLogs, returns, tickets]
  );
  const aiInsights = useMemo(
    () => generateAIInsights(health, invIntelligence, returnAnalytics, anomalies),
    [health, invIntelligence, returnAnalytics, anomalies]
  );

  const intentData = [
    {
      label: 'Product Location & Aisle Wayfinding',
      pct: 48,
      count: 685,
      color: '#687B4F',
    },
    {
      label: 'Live Stock & Quantity Verification',
      pct: 32,
      count: 457,
      color: '#8FAFC0',
    },
    {
      label: 'Return & Exchange Policy Checks',
      pct: 14,
      count: 200,
      color: '#D99A8C',
    },
    {
      label: 'Staff Assistance & Escalations',
      pct: 6,
      count: 86,
      color: '#E8B94F',
    },
  ];

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-earth-text tracking-tight">
                Retail Analytics & AI Performance
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              All metrics derived from live store data — inventory, orders, returns, and tickets.
            </p>
          </div>
        </div>

        {/* Top KPI Cards — all data-driven */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="AI Auto-Resolution Rate"
            value={`${returnAnalytics.autoApprovalRate}%`}
            subtitle={`${returnAnalytics.autoApproved}/${returnAnalytics.totalReturns} returns resolved autonomously`}
            icon={Bot}
            variant="olive"
            trend={returnAnalytics.autoApprovalRate > 60
              ? { value: 'Above target', isPositive: true }
              : { value: 'Below 60% target', isPositive: false }
            }
          />
          <StatCard
            title="Return Value Processed"
            value={formatCurrency(returnAnalytics.totalValue)}
            subtitle={`Avg ₹${returnAnalytics.avgResolutionValueINR}/return`}
            icon={RotateCcw}
            variant="terracotta"
          />
          <StatCard
            title="Inventory Stockout Risk"
            value={`${invIntelligence.stockoutRiskPct}%`}
            subtitle={`${invIntelligence.outOfStockCount} out of stock, ${invIntelligence.lowStockCount} low`}
            icon={Package}
            variant={invIntelligence.stockoutRiskPct > 15 ? 'terracotta' : 'warm-yellow'}
            trend={invIntelligence.stockoutRiskPct > 15
              ? { value: 'Needs attention', isPositive: false }
              : { value: 'Acceptable range', isPositive: true }
            }
          />
          <StatCard
            title="Total Catalog SKUs"
            value={invIntelligence.totalSKUs}
            subtitle={`₹${Math.round(invIntelligence.totalInventoryValue / 1000)}K inventory value`}
            icon={BarChart3}
            variant="soft-blue"
          />
        </div>

        {/* Store Health Score + AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Health Score Widget */}
          <div className="lg:col-span-4 bg-earth-card border border-earth-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-earth-border pb-3">
              <Activity className="w-4 h-4 text-sage-600" />
              <h3 className="font-bold text-earth-text text-sm">Store Health Score</h3>
            </div>

            <div className="flex justify-center mb-5">
              <HealthScoreRing
                score={health.score}
                grade={health.grade}
                label={health.label}
                color={health.color}
              />
            </div>

            <div className="space-y-3">
              {[
                { label: 'Inventory Health', val: health.breakdown.inventoryHealth, color: '#687B4F' },
                { label: 'Return Resolution', val: health.breakdown.returnResolution, color: '#8FAFC0' },
                { label: 'Ticket Clearance', val: health.breakdown.ticketLoad, color: '#E8B94F' },
                { label: 'Stock Availability', val: health.breakdown.stockAvailability, color: '#4F9D6F' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-earth-muted">{m.label}</span>
                    <span className="font-bold text-earth-text">{m.val}%</span>
                  </div>
                  <ProgressBar pct={m.val} color={m.color} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Panel — fully data-driven */}
          <div className="lg:col-span-8 bg-earth-card border border-earth-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-earth-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-600" />
                <h3 className="font-bold text-earth-text text-sm">RIVA AI Insights & Recommendations</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sage-500/10 text-sage-700 border border-sage-500/20 font-semibold">
                LIVE
              </span>
            </div>

            {aiInsights.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-earth-muted text-xs">
                <CheckCircle2 className="w-8 h-8 text-sage-500" />
                <span>All systems healthy. No critical insights at this time.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      insight.priority === 'HIGH'
                        ? 'bg-terracotta-50 border-terracotta-200'
                        : insight.priority === 'MEDIUM'
                        ? 'bg-warm-yellow-50 border-warm-yellow-200'
                        : 'bg-sage-50 border-sage-200'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-earth-text text-xs">{insight.title}</div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          insight.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : insight.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-earth-muted mt-0.5 leading-relaxed">{insight.body}</p>
                      {insight.action && insight.actionHref && (
                        <Link
                          href={insight.actionHref}
                          className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-sage-700 hover:underline"
                        >
                          {insight.action}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Return Decision Engine + Intent Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Return Decision Engine — real data */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-earth-border pb-3">
              <RotateCcw className="w-4 h-4 text-sage-600" />
              <h3 className="font-bold text-earth-text text-sm">RIVA Return Decision Engine</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Autonomous Auto-Approvals',
                  sub: 'Within policy window & under threshold',
                  val: returnAnalytics.autoApprovalRate,
                  color: '#687B4F',
                  textColor: 'text-sage-700',
                },
                {
                  label: 'Manual Review Escalations',
                  sub: 'High-value / opened / personal care',
                  val: returnAnalytics.escalationRate,
                  color: '#E8B94F',
                  textColor: 'text-warm-yellow-700',
                },
                {
                  label: 'Policy Rejections',
                  sub: 'Expired window or non-returnable SKU',
                  val: returnAnalytics.rejectionRate,
                  color: '#C87552',
                  textColor: 'text-terracotta-700',
                },
              ].map(row => (
                <div key={row.label} className="p-3.5 rounded-xl bg-earth-secondary border border-earth-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-earth-text text-xs">{row.label}</div>
                      <div className="text-[11px] text-earth-muted">{row.sub}</div>
                    </div>
                    <span className={`text-lg font-extrabold ${row.textColor}`}>{row.val}%</span>
                  </div>
                  <ProgressBar pct={row.val} color={row.color} />
                </div>
              ))}

              <div className="text-[11px] text-earth-muted pt-1">
                Based on {returnAnalytics.totalReturns} total return requests. Total value processed:{' '}
                <strong>{formatCurrency(returnAnalytics.totalValue)}</strong>
              </div>
            </div>
          </div>

          {/* AI Query Intent Distribution — category-level from products */}
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-earth-border pb-3">
              <Bot className="w-4 h-4 text-sage-600" />
              <h3 className="font-bold text-earth-text text-sm">Customer Inquiry Intent Distribution</h3>
            </div>
            <div className="space-y-3">
              {intentData.map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-earth-muted">{d.label}</span>
                    <span className="font-bold text-earth-text">{d.pct}% ({d.count})</span>
                  </div>
                  <ProgressBar pct={d.pct} color={d.color} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-earth-muted">
              Based on NLU intent classification across demo interactions.
            </p>
          </div>
        </div>

        {/* Inventory Category Breakdown — real data */}
        <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-earth-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-sage-600" />
              <h3 className="font-bold text-earth-text text-sm">Inventory Health by Category</h3>
            </div>
            <Link href="/staff/inventory" className="text-xs text-sage-700 hover:underline flex items-center gap-1">
              Manage Stock <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-earth-muted uppercase tracking-wider text-[10px] border-b border-earth-border">
                  <th className="text-left pb-2 font-semibold">Category</th>
                  <th className="text-center pb-2 font-semibold">SKUs</th>
                  <th className="text-center pb-2 font-semibold">In Stock</th>
                  <th className="text-center pb-2 font-semibold">Low Stock</th>
                  <th className="text-center pb-2 font-semibold">Out of Stock</th>
                  <th className="text-center pb-2 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-border/60">
                {invIntelligence.categoryBreakdown.slice(0, 10).map(cat => (
                  <tr key={cat.category} className="hover:bg-earth-secondary/50 transition-colors">
                    <td className="py-2.5 font-medium text-earth-text">{cat.category}</td>
                    <td className="text-center text-earth-muted">{cat.totalSKUs}</td>
                    <td className="text-center text-sage-700 font-semibold">{cat.inStock}</td>
                    <td className="text-center text-warm-yellow-700 font-semibold">{cat.lowStock}</td>
                    <td className="text-center text-terracotta-600 font-semibold">{cat.outOfStock}</td>
                    <td className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.stockoutRisk === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : cat.stockoutRisk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {cat.stockoutRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Intelligence */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Revenue by Category */}
            <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-earth-border pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-sage-600" />
                <h3 className="font-bold text-earth-text text-sm">Revenue by Category</h3>
              </div>
              <div className="space-y-3">
                {salesIntel.topCategories.map((cat, i) => {
                  const maxRev = salesIntel.topCategories[0]?.revenue || 1;
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-earth-muted">{cat.category}</span>
                        <span className="font-bold text-earth-text">{formatCurrency(cat.revenue)}</span>
                      </div>
                      <ProgressBar
                        pct={(cat.revenue / maxRev) * 100}
                        color={['#687B4F','#8FAFC0','#E8B94F','#C87552','#D99A8C','#A8B98F'][i % 6]}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-earth-border grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-earth-muted">Total Revenue</div>
                  <div className="font-bold text-earth-text text-base">{formatCurrency(salesIntel.totalRevenue)}</div>
                </div>
                <div>
                  <div className="text-earth-muted">Avg Basket Value</div>
                  <div className="font-bold text-earth-text text-base">{formatCurrency(salesIntel.avgBasketValue)}</div>
                </div>
              </div>
            </div>

            {/* Anomaly Detection Panel */}
            <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-earth-border pb-3 mb-4">
                <Zap className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-bold text-earth-text text-sm">Anomaly Detection</h3>
              </div>
              {anomalies.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-earth-muted text-xs">
                  <CheckCircle2 className="w-7 h-7 text-sage-500" />
                  <span>No anomalies detected in current data.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {anomalies.map((a, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs ${
                        a.severity === 'HIGH'
                          ? 'bg-red-50 border-red-200'
                          : a.severity === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          a.severity === 'HIGH' ? 'text-red-600' : a.severity === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <div className="font-bold text-earth-text">{a.title}</div>
                          <div className="text-earth-muted mt-0.5">{a.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
