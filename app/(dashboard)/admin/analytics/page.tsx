'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  Bot, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  LifeBuoy, 
  CheckCircle2 
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { products, returns, tickets } = useStoreData();

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Retail Analytics & AI Performance</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                TELEMETRY & IMPACT
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Measuring assistant interactions, resolution speed, and automated policy decisions.
            </p>
          </div>
        </div>

        {/* Analytics High Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total In-Store Queries"
            value="1,428"
            subtitle="Voice & text requests this week"
            icon={Bot}
            variant="purple"
            trend={{ value: '24.2%', isPositive: true }}
          />
          <StatCard
            title="Auto-Resolution Rate"
            value="86.4%"
            subtitle="Without floor staff intervention"
            icon={Sparkles}
            variant="emerald"
            trend={{ value: '8.1%', isPositive: true }}
          />
          <StatCard
            title="Avg Response Latency"
            value="240 ms"
            subtitle="RAG embedding lookup & synthesis"
            icon={Clock}
            variant="blue"
          />
          <StatCard
            title="Return Value Processed"
            value={formatCurrency(returns.reduce((acc, curr) => acc + (curr.amount || curr.price || 0), 0))}
            subtitle="Instant tokens & vouchers"
            icon={RotateCcw}
            variant="amber"
          />
        </div>

        {/* Breakdown Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Intent Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm">Customer Inquiry Distribution by Intent</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Product Location & Aisle Wayfinding</span>
                  <span className="text-white font-bold">48% (685 queries)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[48%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Live Stock & Quantity Verification</span>
                  <span className="text-white font-bold">32% (457 queries)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[32%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Return & Exchange Policy Checks</span>
                  <span className="text-white font-bold">14% (200 queries)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[14%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Staff Assistance & Exceptions</span>
                  <span className="text-white font-bold">6% (86 queries)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[6%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Return Resolution Efficiency */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm">RIVA Return Decision Engine Performance</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Autonomous Approvals</div>
                  <div className="text-[11px] text-slate-400">Within policy window & under threshold</div>
                </div>
                <span className="text-emerald-400 font-extrabold text-base">75%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Automated Ticket Escalation</div>
                  <div className="text-[11px] text-slate-400">Personal care seals / high-value items</div>
                </div>
                <span className="text-amber-400 font-extrabold text-base">18%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Direct Policy Rejections</div>
                  <div className="text-[11px] text-slate-400">Expired window or non-returnable SKU</div>
                </div>
                <span className="text-rose-400 font-extrabold text-base">7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
