'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { ReturnStatusBadge } from '@/components/common/Badges';
import { ProductCard } from '@/components/products/ProductCard';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Bot, 
  Search, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Package, 
  ShoppingCart,
  ShoppingBag,
  Zap,
  Tag,
  Clock,
  CheckCircle2,
  Milk,
  Coffee,
  Cookie,
  Flame,
  Sparkle,
  Baby
} from 'lucide-react';
import { Product, ProductCategory } from '@/types';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { products, returns, orders, cartCount, activeStore } = useStoreData();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProductForReturn, setSelectedProductForReturn] = useState<Product | undefined>(undefined);

  // Customer specific returns and orders
  const myReturns = returns.filter((r) => r.customerId === user?.id || r.customerId === 'usr-cust-101');
  const myOrders = orders.filter((o) => o.customerId === user?.id || o.customerId === 'cust-1');

  // Smart Picks: Top 8 products
  const smartPicks = products.slice(0, 8);
  
  // Today's Deals: Products with discount (mrp > price)
  const todaysDeals = products.filter(p => p.mrp && p.mrp > p.price).slice(0, 4);

  const categories = [
    { name: 'Dairy & Eggs', icon: Milk, category: 'Dairy' },
    { name: 'Tea & Coffee', icon: Coffee, category: 'Tea & Coffee' },
    { name: 'Snacks & Biscuits', icon: Cookie, category: 'Snacks' },
    { name: 'Instant Food', icon: Flame, category: 'Instant Food' },
    { name: 'Personal Care', icon: Sparkle, category: 'Personal Care' },
    { name: 'Baby Care', icon: Baby, category: 'Baby Care' },
  ];

  const handleStartReturn = (product?: Product) => {
    setSelectedProductForReturn(product);
    setReturnModalOpen(true);
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
      <div className="space-y-8 pb-12">
        {/* Hero Banner with RIVA tagline */}
        <div className="bg-earth-card border border-earth-border rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 border border-sage-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Good Choices. Brighter Lives. • {activeStore?.name || 'Indiranagar Store'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-earth-text tracking-tight leading-tight">
              Welcome back, {user?.name || 'Rahul'}! 👋
            </h1>

            <p className="text-sm sm:text-base text-earth-muted leading-relaxed">
              Explore 100+ fresh daily groceries and FMCG essentials with real-time aisle locations, instant 1-click cart, and AI voice assistance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/customer/assistant"
                className="px-5 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-sage-900/10"
              >
                <Bot className="w-4 h-4" />
                <span>Ask RIVA Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/customer/cart"
                className="px-5 py-3 bg-earth-text hover:bg-espresso-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-warm-yellow-400" />
                <span>View Cart ({cartCount})</span>
              </Link>
              <button
                onClick={() => handleStartReturn()}
                className="px-4 py-3 bg-white hover:bg-earth-bg text-earth-text font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-earth-border transition-colors shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-sage-600" />
                <span>Return / Exchange</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Quick Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-earth-text tracking-tight">
              Explore by Category
            </h2>
            <Link
              href="/customer/products"
              className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/customer/products?category=${encodeURIComponent(cat.category)}`}
                  className="p-4 rounded-2xl bg-earth-card border border-earth-border hover:border-sage-500/50 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 text-sage-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-earth-text group-hover:text-sage-700">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Key Retail Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Items in Cart"
            value={`${cartCount} Items`}
            subtitle="Ready for Checkout"
            icon={ShoppingCart}
            variant="olive"
          />
          <StatCard
            title="My Orders"
            value={`${myOrders.length} Orders`}
            subtitle="Active & Past Receipts"
            icon={ShoppingBag}
            variant="warm-yellow"
          />
          <StatCard
            title="FMCG Catalog"
            value={products.length}
            subtitle="Across 6 Store Aisles"
            icon={Package}
            variant="soft-blue"
          />
          <StatCard
            title="Active Returns"
            value={myReturns.length}
            subtitle="Autonomous AI Rules"
            icon={RotateCcw}
            variant="terracotta"
          />
        </div>

        {/* Today's Special Deals (Discounts) */}
        {todaysDeals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-terracotta-600" />
                <h2 className="text-lg font-bold text-earth-text tracking-tight">Today&apos;s Featured Deals</h2>
              </div>
              <span className="text-xs font-bold bg-terracotta-50 text-terracotta-700 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                Up to 25% Off
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todaysDeals.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onInitiateReturn={() => handleStartReturn(p)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Smart FMCG Picks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-earth-text tracking-tight">Smart Daily Essentials</h2>
              <p className="text-xs text-earth-muted">Top grocery and household picks in your store</p>
            </div>
            <Link
              href="/customer/products"
              className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              <span>Explore All {products.length} Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {smartPicks.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onInitiateReturn={() => handleStartReturn(p)}
              />
            ))}
          </div>
        </div>

        {/* Recent Orders & Returns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-earth-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-earth-text">Recent Orders</h3>
                <p className="text-xs text-earth-muted">Track delivery & store pickups</p>
              </div>
              <Link href="/customer/orders" className="text-xs font-bold text-sage-700 hover:underline">
                View All &rarr;
              </Link>
            </div>

            {myOrders.length === 0 ? (
              <div className="py-8 text-center text-earth-muted text-xs">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-earth-bg/50 border border-earth-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-earth-text font-mono">{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 font-bold text-[10px]">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-earth-muted mt-0.5">
                        {order.items.length} items • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-earth-text">{formatCurrency(order.total)}</div>
                      <Link
                        href="/customer/orders"
                        className="text-[11px] text-sage-700 hover:underline font-bold"
                      >
                        Track &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Return Requests */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-earth-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-earth-text">Recent Returns & Exchanges</h3>
                <p className="text-xs text-earth-muted">Autonomous AI policy evaluation</p>
              </div>
              <Link href="/customer/returns" className="text-xs font-bold text-sage-700 hover:underline">
                View All &rarr;
              </Link>
            </div>

            {myReturns.length === 0 ? (
              <div className="py-8 text-center text-earth-muted text-xs">
                No return requests on file yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myReturns.slice(0, 3).map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3.5 rounded-2xl bg-earth-bg/50 border border-earth-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-earth-text">{ret.productName}</span>
                        <ReturnStatusBadge status={ret.status} />
                      </div>
                      <p className="text-earth-muted mt-0.5">
                        Order <span className="font-mono text-earth-text font-semibold">{ret.orderId}</span> • {formatCurrency(ret.amount || ret.price || 0)}
                      </p>
                    </div>
                    <Link
                      href="/customer/returns"
                      className="text-[11px] text-sage-700 hover:underline font-bold"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReturnWizardModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedProductForReturn(undefined);
        }}
        initialProduct={selectedProductForReturn}
      />
    </DashboardLayout>
  );
}
