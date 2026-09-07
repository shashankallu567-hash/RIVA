'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, Filter, Search, ShieldCheck, User, Clock } from 'lucide-react';
import { AuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useStoreData();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q);

    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">System Audit & Traceability Trail</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                COMPLIANCE LOGS
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Immutable event log capturing every AI decision, auto-approval, staff override, and inventory mutation.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs by action, user, or entity ID..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'RETURN', 'INVENTORY', 'TICKET', 'PRODUCT'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEntityFilter(e)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    entityFilter === e
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Event Log Stream ({filteredLogs.length})</h3>
            <span className="text-xs text-slate-400">Timestamped ISO-8601</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity / ID</th>
                  <th className="py-3 px-4">Description & Audit Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-bold text-[11px]">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{log.userName}</div>
                        <div className="text-[10px] text-slate-500">{log.role}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-400 font-mono">{log.entityId}</div>
                        <div className="text-[10px] text-slate-500">{log.entity}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-xs text-slate-300 leading-relaxed">{log.details}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
