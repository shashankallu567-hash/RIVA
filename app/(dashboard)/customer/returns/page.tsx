'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { ReturnStatusBadge, EligibilityBadge } from '@/components/common/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  RotateCcw, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  LifeBuoy,
  Receipt
} from 'lucide-react';

export default function CustomerReturnsPage() {
  const { user } = useAuth();
  const { returns, policies } = useStoreData();
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const myReturns = returns.filter((r) => r.customerId === user?.id || r.customerId === 'usr-cust-101');

  return (
    <DashboardLayout allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Self-Service Returns & Exchanges</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-500/15 text-sage-800 border border-sage-500/30">
                AI POLICY ENGINE
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Submit return or exchange requests. RIVA autonomously verifies policy rules and issues instant tokens.
            </p>
          </div>

          <button
            onClick={() => setReturnModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Return / Exchange</span>
          </button>
        </div>

        {/* Policy Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Instant Auto-Approval</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Returns within policy window under category threshold are approved instantly with zero staff wait time.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>Item Swaps & Exchanges</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Swap for equivalent items directly in-store by generating an autonomous exchange token.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <LifeBuoy className="w-4 h-4" />
              <span>Automated Dispute Escalation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complex or unsealed items automatically trigger support tickets directly to floor supervisors.
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Your Return Requests & Audit History</h3>
              <p className="text-xs text-slate-400">Real-time status updates from RIVA Policy Engine</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400">{myReturns.length} Total Requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Request ID / Product</th>
                  <th className="py-3 px-4">Order / Purchase</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reason & AI Evaluation</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myReturns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No return requests found. Use the &quot;Start New Return&quot; button above.
                    </td>
                  </tr>
                ) : (
                  myReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{ret.productName}</div>
                        <div className="font-mono text-emerald-400 text-[11px] mt-0.5">{ret.id.toUpperCase()}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white">{ret.orderId}</div>
                        <div className="text-[11px] text-slate-400">{formatDate(ret.purchaseDate)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{formatCurrency(ret.amount || ret.price || 0)}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">{ret.resolutionType}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-200 line-clamp-2">{ret.reason}</p>
                        {ret.notes && (
                          <div className="mt-1 text-[11px] text-slate-400 italic bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            🤖 {ret.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <ReturnStatusBadge status={ret.status} />
                          {ret.ticketId && (
                            <div className="text-[10px] text-amber-400 font-mono">
                              Ticket: {ret.ticketId.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Policy Quick View Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Store Return Policy Guidelines (Indian Kirana & FMCG)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {policies.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{p.category}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    {p.windowDays} {p.windowDays === 1 ? 'Day' : 'Days'} Window
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Auto-Approval Limit: <strong className="text-emerald-300">{formatCurrency(p.autoApprovalLimit)}</strong>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.conditions[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReturnWizardModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
      />
    </DashboardLayout>
  );
}
