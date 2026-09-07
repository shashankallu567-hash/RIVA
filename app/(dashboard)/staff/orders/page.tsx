'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  Store as StoreIcon, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Phone, 
  User, 
  ArrowUpDown,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function StaffOrdersPage() {
  const { orders, updateOrderStatus } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = {
    total: orders.length,
    placed: orders.filter(o => o.status === 'PLACED' || o.status === 'CONFIRMED').length,
    packing: orders.filter(o => o.status === 'PACKING').length,
    ready: orders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'OUT_FOR_DELIVERY').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone && order.customerPhone.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-earth-muted mb-1">
          <Link href="/staff" className="hover:text-earth-text">Staff Operations</Link>
          <span>/</span>
          <span className="text-sage-700 font-bold">Orders Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-7 h-7 text-sage-600" />
          <span>Store Orders & Fulfillment Dispatch</span>
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted mt-1 font-medium">
          Track in-store packing, pickup counter readiness, and delivery status updates
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-earth-muted font-semibold">Total Orders</div>
          <div className="text-2xl font-extrabold text-earth-text mt-1">{stats.total}</div>
          <div className="text-[11px] text-sage-700 font-medium mt-0.5">All customer orders</div>
        </div>

        <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-earth-muted font-semibold">New / Confirmed</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{stats.placed}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Awaiting packing</div>
        </div>

        <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-earth-muted font-semibold">Ready / In Transit</div>
          <div className="text-2xl font-extrabold text-warm-yellow-700 mt-1">{stats.ready}</div>
          <div className="text-[11px] text-warm-yellow-800 font-medium mt-0.5">Pickup / Delivery</div>
        </div>

        <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-earth-muted font-semibold">Completed</div>
          <div className="text-2xl font-extrabold text-sage-700 mt-1">{stats.delivered}</div>
          <div className="text-[11px] text-sage-600 font-medium mt-0.5">Delivered / Picked up</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-earth-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. ORD-7821), customer name, or phone..."
            className="w-full bg-white border border-earth-border rounded-xl pl-10 pr-4 py-2 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-earth-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-earth-border rounded-xl px-3 py-2 text-xs text-earth-text font-semibold focus:border-sage-600 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKING">PACKING</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-earth-card border border-earth-border rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-earth-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-earth-text mb-1">No Orders Match Your Query</h3>
            <p className="text-xs text-earth-muted">Try clearing your filters or search terms.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-earth-card border border-earth-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-sage-500/40 transition-all"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-earth-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 text-sage-700 flex items-center justify-center font-bold font-mono text-sm">
                    {order.deliveryType === 'STORE_PICKUP' ? <StoreIcon className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-earth-text font-mono">{order.id}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-earth-bg text-earth-text border border-earth-border">
                        {order.deliveryType === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Store Pickup'}
                      </span>
                    </div>
                    <p className="text-[11px] text-earth-muted mt-0.5">
                      Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-extrabold text-earth-text">{formatCurrency(order.total)}</div>
                    <div className="text-[10px] text-earth-muted uppercase font-semibold">
                      {order.paymentMethod.replace('MOCK_', '')} • PAID
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer and Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Customer Details */}
                <div className="md:col-span-4 p-3.5 bg-earth-bg/50 border border-earth-border rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-earth-text">
                    <User className="w-3.5 h-3.5 text-sage-600" />
                    <span>{order.customerName}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center gap-1.5 text-earth-muted">
                      <Phone className="w-3 h-3 text-sage-600" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                  {order.deliveryAddress ? (
                    <div className="flex items-start gap-1.5 text-earth-muted pt-1 border-t border-earth-border/60">
                      <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-earth-muted pt-1 border-t border-earth-border/60">
                      <StoreIcon className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                      <span>Pickup Store: {order.pickupStore || 'Indiranagar Store'}</span>
                    </div>
                  )}
                </div>

                {/* Items preview */}
                <div className="md:col-span-8 p-3.5 bg-earth-bg/50 border border-earth-border rounded-2xl space-y-2">
                  <div className="font-bold text-earth-text flex justify-between">
                    <span>Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)} units)</span>
                    <span className="text-sage-700 font-semibold">{order.estimatedDelivery}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-earth-border rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.productName} className="w-6 h-6 rounded object-cover" />
                        <span className="font-bold text-earth-text truncate max-w-[120px]">{item.productName}</span>
                        <span className="text-earth-muted">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-earth-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-earth-muted">Current Status:</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-sage-100 text-sage-800 border border-sage-200 uppercase">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status !== 'PACKING' && order.status !== 'READY_FOR_PICKUP' && order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'PACKING')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark Packing
                    </button>
                  )}

                  {order.deliveryType === 'STORE_PICKUP' && order.status !== 'READY_FOR_PICKUP' && order.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'READY_FOR_PICKUP')}
                      className="px-3 py-1.5 bg-warm-yellow-50 text-warm-yellow-800 hover:bg-warm-yellow-100 border border-warm-yellow-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Ready for Pickup
                    </button>
                  )}

                  {order.deliveryType === 'HOME_DELIVERY' && order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                      className="px-3 py-1.5 bg-soft-blue-50 text-soft-blue-800 hover:bg-soft-blue-100 border border-soft-blue-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Dispatch for Delivery
                    </button>
                  )}

                  {order.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                      className="px-3.5 py-1.5 bg-sage-600 text-white hover:bg-sage-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
