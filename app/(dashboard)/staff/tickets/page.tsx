'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketStatus, SupportTicket } from '@/types';
import { TicketCheck, Filter, Plus, LifeBuoy } from 'lucide-react';

export default function StaffTicketsPage() {
  const { tickets, updateTicketStatus, createTicket } = useStoreData();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('OPEN');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const handleUpdateStatus = async (id: string, status: TicketStatus) => {
    await updateTicketStatus(id, status, 'usr-staff-201');
  };

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Support Tickets & Escalation Desk</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-soft-blue-50 text-soft-blue-800 border border-soft-blue-200">
                FLOOR ESCALATIONS
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Tickets autonomously raised by RIVA AI on return disputes, shelf out-of-stock events, or customer wayfinding issues.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ALL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <TicketCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white">No tickets found</h3>
            <p className="text-xs text-slate-400 mt-1">All issues in this view have been resolved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
