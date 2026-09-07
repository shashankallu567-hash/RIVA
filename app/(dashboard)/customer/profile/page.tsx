'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  RotateCcw, 
  ShieldCheck,
  Store,
  Heart,
  CreditCard,
  UserCheck,
  ArrowRight
} from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, switchPersona } = useAuth();
  const { returns, orders, activeStore, products } = useStoreData();
  const myReturns = returns.filter((r) => r.customerId === user?.id || r.customerId === 'usr-cust-101');
  const myOrders = orders.filter((o) => o.customerId === user?.id || o.customerId === 'usr-cust-101');

  // Demo wishlist items
  const wishlistItems = products.slice(0, 3);

  return (
    <DashboardLayout allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
      <div className="space-y-6 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-earth-card border border-earth-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-sage-600 border-2 border-sage-700 flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden shrink-0 shadow-md">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-[#4A2C1D] tracking-tight">{user?.name || 'Aarav Sharma'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage-500/15 text-sage-800 border border-sage-500/30">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-xs text-earth-muted">Registered In-Store Shopper • RIVA Smart Assistant Member</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-earth-text">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>{user?.email || 'aarav.sharma@example.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>{user?.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>Home Store: {activeStore?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>Verified Retail Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-earth-muted uppercase font-bold tracking-wider">Store Credit Balance</span>
            <h3 className="text-2xl font-extrabold text-sage-700">₹450</h3>
            <p className="text-[11px] text-earth-muted">Auto-credited from approved returns</p>
          </div>
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-earth-muted uppercase font-bold tracking-wider">Total Orders</span>
            <h3 className="text-2xl font-extrabold text-[#4A2C1D]">{myOrders.length || 3}</h3>
            <p className="text-[11px] text-earth-muted">In-store & quick commerce orders</p>
          </div>
          <div className="bg-earth-card border border-earth-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs text-earth-muted uppercase font-bold tracking-wider">Verified Returns</span>
            <h3 className="text-2xl font-extrabold text-[#4A2C1D]">{myReturns.length}</h3>
            <p className="text-[11px] text-earth-muted">Policy verified & logged</p>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-base font-extrabold text-[#4A2C1D]">My Saved Wishlist</h2>
            </div>
            <Link href="/customer/products" className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1">
              Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-earth-bg border border-earth-border rounded-xl p-3 flex items-center gap-3">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-sage-700 uppercase">{item.brand}</span>
                  <h4 className="text-xs font-bold text-earth-text truncate">{item.name}</h4>
                  <span className="text-xs font-extrabold text-[#4A2C1D]">{formatCurrency(item.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Role Switcher Panel for Hackathon Demo */}
        <div className="bg-sage-600/10 border border-sage-600/20 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sage-700" />
            <h2 className="text-sm font-extrabold text-[#4A2C1D]">Hackathon Persona Switcher</h2>
          </div>
          <p className="text-xs text-earth-muted">
            Quickly test different role views across Customer, Store Staff, and Retail Operations Admin:
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => switchPersona('CUSTOMER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user?.role === 'CUSTOMER'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-earth-card text-earth-text border border-earth-border hover:bg-earth-border/40'
              }`}
            >
              Customer (Aarav Sharma)
            </button>
            <button
              onClick={() => switchPersona('STAFF')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user?.role === 'STAFF'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-earth-card text-earth-text border border-earth-border hover:bg-earth-border/40'
              }`}
            >
              Store Staff (Priya Sundaram)
            </button>
            <button
              onClick={() => switchPersona('ADMIN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-earth-card text-earth-text border border-earth-border hover:bg-earth-border/40'
              }`}
            >
              Store Admin (Vikram Rao)
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
