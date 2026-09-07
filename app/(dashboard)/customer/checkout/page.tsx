'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { DeliveryType, PaymentMethod, Order } from '@/types';
import { 
  CheckCircle2, 
  Truck, 
  Store as StoreIcon, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Package, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, cartTotal, cartDiscount, placeOrder, activeStore } = useStoreData();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOCK_UPI');
  
  // Customer details state
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('rahul.sharma@example.com');
  
  // Delivery address state
  const [street, setStreet] = useState('Flat 402, Green Glen Layout, Bellandur');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560103');
  
  // UPI / Card mock inputs
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');
  
  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const deliveryFee = deliveryType === 'HOME_DELIVERY' && cartTotal < 500 ? 29 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 && !completedOrder) {
      router.push('/customer/cart');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing delay for realistic UX
      await new Promise((r) => setTimeout(r, 800));

      const newOrder = await placeOrder({
        paymentMethod,
        deliveryType,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        deliveryAddress: deliveryType === 'HOME_DELIVERY' ? { street, city, pincode } : undefined,
        pickupStore: deliveryType === 'STORE_PICKUP' ? activeStore?.name || 'Indiranagar Main Store' : undefined,
      });

      setCompletedOrder(newOrder);
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // If order was just placed, display the celebration confirmation screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-earth-card border border-earth-border rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-earth-text/5 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mx-auto mb-5 text-sage-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-bold mb-3 border border-sage-200">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span>Order Placed Successfully</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight">
            Thank You, {completedOrder.customerName}!
          </h1>

          <p className="text-xs sm:text-sm text-earth-muted mt-2 max-w-md mx-auto">
            Your FMCG essentials order has been confirmed. A receipt and real-time tracking update have been dispatched.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-earth-bg/70 border border-earth-border text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-earth-border">
              <span className="text-xs font-semibold text-earth-muted">Order Reference:</span>
              <span className="text-sm font-extrabold text-earth-text font-mono">{completedOrder.id}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-earth-muted">Fulfillment Mode:</span>
              <span className="font-bold text-earth-text">
                {completedOrder.deliveryType === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Store Pickup'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-earth-muted">Estimated Delivery/Pickup:</span>
              <span className="font-bold text-sage-700">{completedOrder.estimatedDelivery}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-earth-muted">Total Paid:</span>
              <span className="font-extrabold text-earth-text text-sm">{formatCurrency(completedOrder.total)}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-earth-border text-earth-muted">
              <span>Items in Order:</span>
              <span>{completedOrder.items.reduce((sum, i) => sum + i.quantity, 0)} units</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/customer/orders"
              className="w-full sm:w-auto px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Track in My Orders</span>
            </Link>

            <Link
              href="/customer/products"
              className="w-full sm:w-auto px-5 py-3 bg-earth-card-soft hover:bg-earth-border/40 text-earth-text font-bold rounded-xl text-xs sm:text-sm border border-earth-border transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and no order yet
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-earth-card border border-earth-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-earth-text mb-2">No Items in Cart</h2>
        <p className="text-xs text-earth-muted mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/customer/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs"
        >
          <span>Browse FMCG Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-earth-muted mb-1">
          <Link href="/customer/cart" className="hover:text-earth-text flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cart
          </Link>
          <span>/</span>
          <span className="text-sage-700 font-bold">Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted mt-1 font-medium">
          Choose fulfillment method and complete your mock payment
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Delivery & Payment Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Fulfillment Mode */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-earth-border">
              <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-base font-bold text-earth-text">Fulfillment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('HOME_DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  deliveryType === 'HOME_DELIVERY'
                    ? 'border-sage-600 bg-sage-50/50 shadow-sm'
                    : 'border-earth-border bg-white hover:border-sage-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-earth-text">
                    <Truck className="w-4 h-4 text-sage-600" />
                    <span>Home Delivery</span>
                  </div>
                  {deliveryType === 'HOME_DELIVERY' && (
                    <span className="w-4 h-4 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-earth-muted">
                  Delivered to your doorstep by tomorrow 11:00 AM.
                </p>
                <div className="mt-2 text-xs font-bold text-sage-700">
                  {cartTotal >= 500 ? 'FREE Delivery' : '₹29 Delivery Fee'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('STORE_PICKUP')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  deliveryType === 'STORE_PICKUP'
                    ? 'border-sage-600 bg-sage-50/50 shadow-sm'
                    : 'border-earth-border bg-white hover:border-sage-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-earth-text">
                    <StoreIcon className="w-4 h-4 text-sage-600" />
                    <span>Store Pickup</span>
                  </div>
                  {deliveryType === 'STORE_PICKUP' && (
                    <span className="w-4 h-4 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-earth-muted">
                  Ready in 2 hours at {activeStore?.name || 'Indiranagar Store'}.
                </p>
                <div className="mt-2 text-xs font-bold text-sage-700">
                  FREE Pickup • No Minimum
                </div>
              </button>
            </div>

            {/* Address fields if Home Delivery */}
            {deliveryType === 'HOME_DELIVERY' ? (
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-earth-text mb-1">
                    Street Address & Flat / House No.
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-earth-text mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-earth-text mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 p-3.5 bg-earth-bg/70 border border-earth-border rounded-2xl text-xs space-y-1">
                <div className="font-bold text-earth-text flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sage-600" />
                  <span>Pickup Location: {activeStore?.name || 'Indiranagar Store #101'}</span>
                </div>
                <p className="text-earth-muted pl-5">
                  {activeStore?.address || '100ft Road, Indiranagar, Bengaluru'} • Open 8 AM - 10 PM
                </p>
              </div>
            )}
          </div>

          {/* 2. Customer Contact */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-earth-border">
              <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-base font-bold text-earth-text">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-earth-text mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-earth-text mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-earth-text mb-1">Email (for receipt)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2.5 text-xs text-earth-text focus:border-sage-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-earth-border">
              <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-earth-text">Mock Payment Method</h2>
                <span className="text-[10px] font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded border border-sage-200">
                  Demo Mode
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('MOCK_UPI')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'MOCK_UPI'
                    ? 'border-sage-600 bg-sage-50/50 shadow-sm'
                    : 'border-earth-border bg-white hover:border-sage-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-earth-text mb-1">
                  <Smartphone className="w-4 h-4 text-sage-600" />
                  <span>Instant UPI</span>
                </div>
                <p className="text-[11px] text-earth-muted">GPay / PhonePe / Paytm</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MOCK_CARD')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'MOCK_CARD'
                    ? 'border-sage-600 bg-sage-50/50 shadow-sm'
                    : 'border-earth-border bg-white hover:border-sage-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-earth-text mb-1">
                  <CreditCard className="w-4 h-4 text-sage-600" />
                  <span>Credit / Debit Card</span>
                </div>
                <p className="text-[11px] text-earth-muted">Visa, Mastercard, RuPay</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MOCK_COD')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'MOCK_COD'
                    ? 'border-sage-600 bg-sage-50/50 shadow-sm'
                    : 'border-earth-border bg-white hover:border-sage-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-earth-text mb-1">
                  <Banknote className="w-4 h-4 text-sage-600" />
                  <span>Cash / Store Pay</span>
                </div>
                <p className="text-[11px] text-earth-muted">Pay at delivery or counter</p>
              </button>
            </div>

            {paymentMethod === 'MOCK_UPI' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-earth-text mb-1">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okhdfcbank"
                  className="w-full bg-white border border-earth-border rounded-xl px-3.5 py-2 text-xs text-earth-text focus:border-sage-600 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base font-bold text-earth-text pb-3 border-b border-earth-border">
              Order Items ({cartCount})
            </h2>

            {/* Item list mini */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-lg bg-earth-card-soft overflow-hidden border border-earth-border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-earth-text truncate">{item.product.name}</p>
                    <p className="text-[10px] text-earth-muted">Qty: {item.quantity} × {formatCurrency(item.product.price)}</p>
                  </div>
                  <span className="font-bold text-earth-text">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price calculation */}
            <div className="space-y-2 pt-3 border-t border-earth-border text-xs">
              <div className="flex justify-between text-earth-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-earth-text">{formatCurrency(cartTotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-sage-700 font-medium">
                  <span>Product Savings</span>
                  <span>-{formatCurrency(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-earth-muted">
                <span>Fulfillment Fee</span>
                <span className="font-semibold text-earth-text">
                  {deliveryFee === 0 ? <span className="text-sage-700 font-bold uppercase">FREE</span> : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-earth-border flex justify-between items-baseline">
                <span className="text-sm font-bold text-earth-text">Total Payable</span>
                <span className="text-xl font-extrabold text-earth-text">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place & Pay {formatCurrency(finalTotal)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-earth-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>Simulated Instant Checkout (Hackathon Demo)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
