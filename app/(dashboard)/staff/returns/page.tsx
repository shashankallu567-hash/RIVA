'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { ReturnStatusBadge, EligibilityBadge } from '@/components/common/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RotateCcw, Check, X, Sparkles, Filter, LifeBuoy, Clock } from 'lucide-react';
import { ReturnStatus } from '@/types';

export default function StaffReturnsPage() {
  const { returns, updateReturnStatus } = useStoreData();
  const [filter, setFilter] = useState<'ALL' | 'MANUAL_REVIEW' | 'AUTO_APPROVED' | 'COMPLETED'>('MANUAL_REVIEW');

  const filteredReturns = returns.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const handleApprove = async (id: string) => {
    await updateReturnStatus(id, 'AUTO_APPROVED', 'Staff verified physical item at desk and approved store exchange.');
  };

  const handleReject = async (id: string) => {
    await updateReturnStatus(id, 'REJECTED', 'Rejected by staff due to physical damage or policy non-compliance.');
  };

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Return & Exchange Verification Queue</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
                STAFF DESK
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Review exceptions flagged by RIVA Decision Engine (e.g., opened personal care, high-value claims).
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['MANUAL_REVIEW', 'AUTO_APPROVED', 'ALL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'MANUAL_REVIEW' ? 'Pending Review' : f === 'AUTO_APPROVED' ? 'RIVA Auto-Approved' : 'All Returns'}
              </button>
            ))}
          </div>
        </div>

        {/* Return Queue List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Return Request Queue ({filteredReturns.length})</h3>
            <span className="text-xs text-slate-400">Policy Rules & Audit Trail Synced</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredReturns.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No returns found in this queue category.
              </div>
            ) : (
              filteredReturns.map((ret) => (
                <div key={ret.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {ret.id.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-white text-sm">{ret.productName}</h4>
                      <ReturnStatusBadge status={ret.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                      <div>Customer: <strong className="text-white">{ret.customerName}</strong> ({ret.customerPhone || 'N/A'})</div>
                      <div>Order ID: <span className="text-white font-mono">{ret.orderId}</span></div>
                      <div>Amount: <strong className="text-emerald-400">{formatCurrency(ret.amount || ret.price || 0)}</strong> ({ret.resolutionType})</div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <strong>Customer Stated Reason:</strong> &quot;{ret.reason}&quot;
                      {ret.notes && (
                        <span className="block text-slate-400 text-[11px] mt-1 italic border-t border-slate-800/80 pt-1">
                          🤖 <strong>AI Policy Evaluation:</strong> {ret.notes}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions if pending manual review */}
                  {ret.status === 'MANUAL_REVIEW' && (
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        onClick={() => handleReject(ret.id)}
                        className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(ret.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/30"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Exception</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
