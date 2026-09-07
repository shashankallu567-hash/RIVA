'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Bot, 
  Package, 
  RotateCcw, 
  User, 
  LayoutDashboard, 
  Boxes, 
  TicketCheck, 
  FileText, 
  Users, 
  BarChart3, 
  ShieldAlert,
  Search,
  Sparkles,
  ShoppingCart,
  ShoppingBag
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  const customerNav = [
    { name: 'Customer Hub', href: '/customer', icon: LayoutDashboard },
    { name: 'RIVA AI Assistant', href: '/customer/assistant', icon: Bot, badge: 'Voice/Text' },
    { name: 'FMCG Catalog', href: '/customer/products', icon: Search },
    { name: 'My Shopping Cart', href: '/customer/cart', icon: ShoppingCart },
    { name: 'My Orders', href: '/customer/orders', icon: ShoppingBag },
    { name: 'Returns & Exchanges', href: '/customer/returns', icon: RotateCcw },
    { name: 'Customer Profile', href: '/customer/profile', icon: User },
  ];

  const staffNav = [
    { name: 'Staff Operations', href: '/staff', icon: LayoutDashboard },
    { name: 'Orders & Dispatch', href: '/staff/orders', icon: ShoppingBag },
    { name: 'Store Inventory', href: '/staff/inventory', icon: Boxes },
    { name: 'Return Reviews', href: '/staff/returns', icon: RotateCcw },
    { name: 'Support Tickets', href: '/staff/tickets', icon: TicketCheck },
    { name: 'Staff Profile', href: '/staff/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Product Catalog', href: '/admin/products', icon: Package },
    { name: 'Live Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Return Policies', href: '/admin/policies', icon: FileText },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Tickets Command', href: '/admin/tickets', icon: TicketCheck },
    { name: 'Retail Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  let currentNav = customerNav;
  let roleTitle = 'Customer Portal';
  let badgeColor = 'bg-sage-500/15 text-sage-700 border-sage-500/30';

  if (role === 'STAFF') {
    currentNav = staffNav;
    roleTitle = 'Store Staff';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (role === 'ADMIN') {
    currentNav = adminNav;
    roleTitle = 'Admin Console';
    badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-espresso-950/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-[73px] bottom-0 left-0 w-64 bg-earth-card border-r border-earth-border z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: 'calc(100vh - 73px)' }}
      >
        {/* Role Header Banner */}
        <div className="p-4 border-b border-earth-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-earth-muted">Navigation</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeColor}`}>
              {roleTitle}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-md shadow-sage-900/15'
                    : 'text-earth-muted hover:text-earth-text hover:bg-earth-card-soft'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-earth-card border border-earth-border/80 text-sage-700'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-warm-yellow-50 text-warm-yellow-900 border border-warm-yellow-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* In-Store Assistant Floating Promo in sidebar */}
        <div className="p-3 border-t border-earth-border">
          <div className="bg-earth-card-soft border border-earth-border rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 text-sage-700 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RIVA Agent Active</span>
            </div>
            <p className="text-[11px] text-earth-muted leading-relaxed">
              Real-time RAG & Policy Engine running for Indiranagar Store.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
