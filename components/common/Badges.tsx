import React from 'react';
import { ReturnStatus, EligibilityStatus, TicketPriority, TicketStatus, StockStatus } from '@/types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export const StockBadge: React.FC<{ 
  available?: boolean; 
  quantity: number; 
  minThreshold?: number;
  reorderLevel?: number;
  status?: StockStatus;
}> = ({
  quantity,
  minThreshold = 5,
  reorderLevel = 5,
  status,
}) => {
  const threshold = reorderLevel || minThreshold;

  if (status === 'OUT_STOCK' || quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping shrink-0" />
        OUT OF STOCK
      </span>
    );
  }
  if (status === 'LOW_STOCK' || quantity <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
        LOW STOCK ({quantity})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-sage-50 text-sage-800 border border-sage-200">
      <CheckCircle2 className="w-3 h-3 text-sage-600 shrink-0" />
      IN STOCK ({quantity})
    </span>
  );
};

export const ReturnStatusBadge: React.FC<{ status: ReturnStatus }> = ({ status }) => {
  switch (status) {
    case 'AUTO_APPROVED':
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
          <Sparkles className="w-3 h-3 text-sage-600" />
          RIVA Auto-Approved
        </span>
      );
    case 'MANUAL_REVIEW':
    case 'ESCALATED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Staff Review Needed
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          Completed
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-earth-card-soft text-earth-muted border border-earth-border">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
  }
};

export const EligibilityBadge: React.FC<{ eligibility: EligibilityStatus }> = ({ eligibility }) => {
  switch (eligibility) {
    case 'ELIGIBLE_AUTO':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
          Instant Auto-Approval Eligible
        </span>
      );
    case 'REQUIRES_STAFF_REVIEW':
    case 'REQUIRES_ESCALATION':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Requires Staff Appraisal
        </span>
      );
    case 'INELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Policy Ineligible
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">URGENT</span>;
    case 'HIGH':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">HIGH</span>;
    case 'MEDIUM':
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">MEDIUM</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-earth-card-soft text-earth-muted border border-earth-border">LOW</span>;
  }
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Open</span>;
    case 'IN_PROGRESS':
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Progress</span>;
    case 'RESOLVED':
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">Resolved</span>;
    case 'CLOSED':
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-earth-card-soft text-earth-muted border border-earth-border">Closed</span>;
  }
};
