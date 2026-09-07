import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateId(prefix: string = 'id'): string {
  const p = prefix.toLowerCase();
  const year = 2026;
  const num6 = Math.floor(100000 + Math.random() * 900000);
  const num5 = Math.floor(10000 + Math.random() * 90000);

  if (p === 'ret') return `RET-${year}-${num6}`;
  if (p === 'exc') return `EXC-${year}-${num6}`;
  if (p === 'tkt') return `TKT-${year}-${num6}`;
  if (p === 'ord') return `ORD-${num5}`;
  if (p === 'notif') return `NOTIF-${year}-${num5}`;
  if (p === 'disp') return `DISP-${year}-${num5}`;
  if (p === 'aud') return `AUD-${year}-${num5}`;
  if (p === 'act') return `ACT-${year}-${num5}`;
  if (p === 'prod') return `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

