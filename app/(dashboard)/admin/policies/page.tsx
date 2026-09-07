'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { FileText, Sparkles, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPoliciesPage() {
  const { policies } = useStoreData();

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Return & Exchange Policy Studio</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                DECISION ENGINE RULES
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Configure autonomous approval thresholds, return windows, and mandatory hygiene constraints across categories.
            </p>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{p.category}</h3>
                    <span className="text-[11px] text-purple-400 font-mono">Policy ID: {p.id}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {p.windowDays} {p.windowDays === 1 ? 'Day' : 'Days'} Window
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Autonomous Approval Limit:</span>
                    <strong className="text-emerald-400 font-bold">{formatCurrency(p.autoApprovalLimit)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Requires Invoice/Receipt:</span>
                    <span className="text-white font-medium">{p.requiresReceipt ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Direct Exchange Allowed:</span>
                    <span className="text-white font-medium">{p.exchangeAllowed ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rules & Conditions:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {p.conditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Non-returnable */}
                {p.nonReturnableItems && p.nonReturnableItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Strictly Non-Returnable:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.nonReturnableItems.map((item, i) => (
                        <span key={i} className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {p.notes && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                  💡 {p.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
