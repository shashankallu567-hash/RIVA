'use client';

import React from 'react';
import { SupportTicket, TicketStatus } from '@/types';
import { PriorityBadge, TicketStatusBadge } from '@/components/common/Badges';
import { formatDate } from '@/lib/utils';
import { Clock, User, CheckCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: SupportTicket;
  onUpdateStatus?: (id: string, status: TicketStatus) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onUpdateStatus,
}) => {
  return (
    <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-earth-border-strong transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
              {ticket.id.toUpperCase()}
            </span>
            <PriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
          <h3 className="font-bold text-earth-text text-base mt-1 tracking-tight">{ticket.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-earth-muted leading-relaxed bg-earth-card-soft p-3 rounded-xl border border-earth-border">
        {ticket.description}
      </p>

      {/* Meta Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-earth-border text-xs text-earth-muted">
        <div className="flex items-center gap-4">
          {ticket.customerName && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-earth-muted" />
              <span>{ticket.customerName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-earth-muted" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Action button if status update handler provided */}
        {onUpdateStatus && ticket.status !== 'RESOLVED' && (
          <div className="flex items-center gap-2">
            {ticket.status === 'OPEN' && (
              <button
                onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Mark In Progress
              </button>
            )}
            <button
              onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')}
              className="px-3 py-1 bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-sage-600" />
              <span>Resolve Ticket</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
