'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { NotificationDrawer } from '@/components/common/NotificationDrawer';
import { 
  Bot, 
  Store as StoreIcon, 
  Bell, 
  LogOut, 
  User, 
  ShieldCheck, 
  Wrench, 
  Menu,
  ShoppingCart
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const { activeStore, unreadCount, cartCount } = useStoreData();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="bg-earth-card/95 backdrop-blur border-b border-earth-border sticky top-[33px] z-40 px-4 lg:px-8 py-3 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Store Selector */}
          <div className="flex items-center gap-4">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 text-earth-muted hover:text-earth-text rounded-lg hover:bg-earth-border/40"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sage-600 to-emerald-700 flex items-center justify-center shadow-md shadow-sage-900/10 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-earth-text tracking-wider">RIVA</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sage-500/15 text-sage-700 border border-sage-500/30">
                    RETAIL AI
                  </span>
                </div>
                <p className="text-[10px] text-earth-muted hidden sm:block">Retail Intelligence & Virtual Assistant</p>
              </div>
            </Link>

            {/* Active Store Indicator */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-earth-border text-xs">
              <StoreIcon className="w-4 h-4 text-sage-600" />
              <div>
                <span className="text-earth-muted font-medium">Store: </span>
                <span className="text-earth-text font-semibold">{activeStore?.name || 'Indiranagar Main Store'}</span>
              </div>
            </div>
          </div>

          {/* User profile, notifications, cart & actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Assistant Shortcut Button */}
            {role === 'CUSTOMER' && (
              <Link
                href="/customer/assistant"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sage-500/15 text-sage-700 border border-sage-500/30 hover:bg-sage-500/25 transition-colors"
              >
                <Bot className="w-4 h-4" />
                Ask RIVA AI
              </Link>
            )}

            {/* Cart Button */}
            {(role === 'CUSTOMER' || !role) && (
              <Link
                href="/customer/cart"
                className="relative p-2 text-earth-muted hover:text-earth-text hover:bg-earth-border/40 rounded-xl transition-colors border border-earth-border/60 flex items-center gap-1.5"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-sage-700" />
                <span className="hidden md:inline text-xs font-bold text-earth-text">Cart</span>
                {cartCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-sage-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-earth-muted hover:text-earth-text hover:bg-earth-border/40 rounded-xl transition-colors border border-earth-border/60"
              title="Notifications & Dispatch Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-terracotta-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                {/* User Dropdown / Badge */}
                <div className="flex items-center gap-2.5 bg-earth-card-soft border border-earth-border rounded-xl px-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-sage-500/20 text-sage-700 flex items-center justify-center overflow-hidden text-xs font-bold border border-sage-500/30">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-earth-text leading-tight">{user.name}</div>
                    <div className="text-[10px] text-earth-muted font-medium flex items-center gap-1">
                      {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                      {user.role === 'STAFF' && <Wrench className="w-3 h-3 text-blue-600" />}
                      {user.role === 'CUSTOMER' && <User className="w-3 h-3 text-sage-600" />}
                      <span>{user.role}</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-earth-muted hover:text-terracotta-600 hover:bg-earth-border/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3 py-1.5 text-earth-muted hover:text-earth-text rounded-lg hover:bg-earth-border/40"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-xs font-semibold px-3 py-1.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Notification & Dispatch Drawer */}
      <NotificationDrawer 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </>
  );
};
