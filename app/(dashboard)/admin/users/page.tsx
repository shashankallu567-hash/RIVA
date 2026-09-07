'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_USERS_LIST } from '@/data/mockUsers';
import { formatDate } from '@/lib/utils';
import { Users, ShieldCheck, Wrench, User as UserIcon, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">User & Role Management</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                RBAC ACCESS CONTROL
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Manage retail user accounts, floor staff permission grants, and security roles.
            </p>
          </div>
        </div>

        {/* User list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Users & Personas ({MOCK_USERS_LIST.length})</h3>
            <span className="text-xs text-slate-400">Role-Based Access Control Enabled</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {MOCK_USERS_LIST.map((u) => {
              const roleColor = {
                ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                STAFF: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                CUSTOMER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
              }[u.role];

              const RoleIcon = {
                ADMIN: ShieldCheck,
                STAFF: Wrench,
                CUSTOMER: UserIcon,
              }[u.role];

              return (
                <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor}`}>
                          <RoleIcon className="w-3 h-3" />
                          {u.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {u.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Joined {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 self-end sm:self-center">
                    {u.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
