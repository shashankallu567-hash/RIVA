'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketStatus, SupportTicket } from '@/types';
import { TicketCheck, Filter, ShieldCheck, Activity } from 'lucide-react';

export default function AdminTicketsPage() {
  const { tickets, updateTicketStatus } = useStoreData();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const filtered = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const handleUpdate = async (id: string, status: TicketStatus) => {
    await updateTicketStatus(id, status, 'usr-admin-301');
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Enterprise Support Tickets Command</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                DISPUTE & ESCALATION SLA
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Centralized view of customer queries, stock-out triggers, and policy return escalations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === s
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              onUpdateStatus={handleUpdate}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
