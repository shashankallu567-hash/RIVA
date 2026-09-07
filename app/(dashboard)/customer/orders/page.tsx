'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Store as StoreIcon, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Bot, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Receipt,
  ShoppingCart
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { orders, addToCart } = useStoreData();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ACTIVE') return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
    if (activeTab === 'DELIVERED') return order.status === 'DELIVERED';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
            <CheckCircle2 className="w-3 h-3 text-sage-600" />
            <span>Delivered</span>
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-warm-yellow-50 text-warm-yellow-900 border border-warm-yellow-200">
            <StoreIcon className="w-3 h-3 text-warm-yellow-700" />
            <span>Ready for Pickup</span>
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-soft-blue-50 text-soft-blue-900 border border-soft-blue-200">
            <Truck className="w-3 h-3 text-soft-blue-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'CONFIRMED':
      case 'PLACED':
      case 'PACKING':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
            <Clock className="w-3 h-3 text-sage-600" />
            <span>{status.replace('_', ' ')}</span>
          </span>
        );
    }
  };

  const handleReorder = (order: Order) => {
    for (const item of order.items) {
      addToCart(item.productId, item.quantity);
    }
    router.push('/customer/cart');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-earth-muted mb-1">
            <Link href="/customer" className="hover:text-earth-text">Customer Hub</Link>
            <span>/</span>
            <span className="text-sage-700 font-bold">Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-sage-600" />
            <span>My Orders & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-earth-muted mt-1 font-medium">
            Track order delivery status, view invoices, or initiate returns
          </p>
        </div>

        <Link
          href="/customer/products"
          className="px-4 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Shop More Items</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-earth-card border border-earth-border rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ALL'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'text-earth-muted hover:text-earth-text'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ACTIVE'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'text-earth-muted hover:text-earth-text'
          }`}
        >
          Active / Processing ({orders.filter(o => o.status !== 'DELIVERED').length})
        </button>
        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'DELIVERED'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'text-earth-muted hover:text-earth-text'
          }`}
        >
          Delivered ({orders.filter(o => o.status === 'DELIVERED').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-earth-card border border-earth-border rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <Package className="w-12 h-12 text-earth-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-earth-text mb-1">No Orders Found</h3>
          <p className="text-xs text-earth-muted mb-4">You have no orders matching this filter.</p>
          <Link
            href="/customer/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sage-600 text-white text-xs font-bold rounded-xl"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-earth-card border border-earth-border rounded-3xl overflow-hidden shadow-sm hover:border-sage-500/40 transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-earth-bg/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-sage-50 border border-sage-200 text-sage-700 flex items-center justify-center shrink-0">
                      {order.deliveryType === 'STORE_PICKUP' ? (
                        <StoreIcon className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-earth-text font-mono">
                          {order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-xs text-earth-muted mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-earth-border">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-extrabold text-earth-text">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-[10px] text-earth-muted uppercase font-semibold">
                        {order.paymentMethod.replace('MOCK_', '')} • {order.paymentStatus}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 text-earth-muted hover:text-earth-text rounded-xl bg-earth-card-soft border border-earth-border"
                      title={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-earth-border/80 space-y-5 bg-earth-bg/20">
                    {/* Fulfillment Info Banner */}
                    <div className="p-3.5 rounded-2xl bg-white border border-earth-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-earth-muted font-medium">Status & ETA: </span>
                        <strong className="text-sage-700">{order.estimatedDelivery || 'In Progress'}</strong>
                      </div>
                      {order.deliveryAddress ? (
                        <div className="flex items-center gap-1 text-earth-muted">
                          <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                          <span>{order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-earth-muted">
                          <StoreIcon className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                          <span>Pickup Store: {order.pickupStore || 'Koramangala Main Store'}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-earth-text uppercase tracking-wider">
                        Ordered Items
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-earth-border rounded-2xl p-3 flex items-center gap-3"
                          >
                            <div className="w-14 h-14 rounded-xl bg-earth-card-soft overflow-hidden border border-earth-border shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-earth-text truncate">{item.productName}</p>
                              <p className="text-[11px] text-earth-muted font-medium">{item.brand} • {item.unit}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-earth-text font-bold">Qty: {item.quantity}</span>
                                <span className="text-xs font-extrabold text-earth-text">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-earth-border">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Re-Order Items</span>
                        </button>

                        <Link
                          href="/customer/returns"
                          className="px-3.5 py-2 bg-white hover:bg-earth-bg text-earth-text font-bold rounded-xl text-xs border border-earth-border transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-sage-600" />
                          <span>Return / Exchange</span>
                        </Link>
                      </div>

                      <Link
                        href={`/customer/assistant`}
                        className="text-xs text-sage-700 hover:text-sage-800 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask RIVA about this order</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
