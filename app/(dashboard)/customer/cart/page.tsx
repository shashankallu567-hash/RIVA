'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Tag, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function CustomerCartPage() {
  const router = useRouter();
  const { cart, cartCount, cartTotal, cartDiscount, updateCartQty, removeFromCart, clearCart } = useStoreData();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const freeDeliveryThreshold = 500;
  const deliveryFee = cartTotal >= freeDeliveryThreshold || cartTotal === 0 ? 0 : 29;
  const finalTotal = Math.max(0, cartTotal - couponDiscount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === 'RIVA10' || couponCode.trim().toUpperCase() === 'SAVE10') {
      const discount = Math.round(cartTotal * 0.1);
      setCouponDiscount(discount);
      setCouponApplied(true);
    } else if (couponCode.trim().toUpperCase() === 'FREESHIP') {
      setCouponDiscount(29);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try "RIVA10"');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-earth-muted mb-1">
            <Link href="/customer" className="hover:text-earth-text">Customer Hub</Link>
            <span>/</span>
            <span className="text-sage-700 font-bold">Shopping Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-text tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-sage-600" />
            <span>Shopping Cart</span>
            {cartCount > 0 && (
              <span className="text-sm font-bold bg-sage-100 text-sage-800 px-3 py-0.5 rounded-full border border-sage-200">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-earth-muted mt-1 font-medium">
            Review your selected FMCG essentials before proceeding to checkout
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-earth-muted hover:text-terracotta-600 font-semibold self-start sm:self-auto flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="bg-earth-card border border-earth-border rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-20 h-20 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mx-auto mb-5 text-sage-600">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-earth-text mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-earth-muted mb-6 max-w-sm mx-auto leading-relaxed">
            Looks like you haven&apos;t added any daily groceries or household essentials yet. Explore our fresh inventory!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/customer/products"
              className="w-full sm:w-auto px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2"
            >
              <span>Browse FMCG Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/customer/assistant"
              className="w-full sm:w-auto px-5 py-3 bg-earth-card-soft hover:bg-earth-border/40 text-earth-text font-bold rounded-xl text-xs sm:text-sm border border-earth-border transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sage-600" />
              <span>Ask RIVA Assistant</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Delivery Bar */}
            <div className="bg-earth-card border border-earth-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-2 text-earth-text">
                  <Truck className="w-4 h-4 text-sage-600" />
                  {cartTotal >= freeDeliveryThreshold ? (
                    <span className="text-sage-700 font-bold">🎉 You have unlocked FREE Express Delivery!</span>
                  ) : (
                    <span>
                      Add <strong className="text-sage-700">{formatCurrency(freeDeliveryThreshold - cartTotal)}</strong> more for FREE delivery
                    </span>
                  )}
                </div>
                <span className="text-earth-muted font-bold text-[11px]">
                  {Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100))}%
                </span>
              </div>
              <div className="w-full h-2 bg-earth-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartTotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {cart.map((item) => {
                const product = item.product;
                const itemTotal = product.price * item.quantity;
                const mrpTotal = (product.mrp || product.price) * item.quantity;

                return (
                  <div
                    key={product.id}
                    className="bg-earth-card border border-earth-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm hover:border-sage-500/40 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-earth-card-soft overflow-hidden border border-earth-border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
                          {product.category}
                        </span>
                        <span className="text-xs text-earth-muted font-medium">{product.brand}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-earth-text mt-1 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-earth-muted">
                        <span>Unit: {product.unit}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[11px] text-sage-700">
                          <MapPin className="w-3 h-3" />
                          <span>{product.location.aisle}, {product.location.shelf}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Stepper */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-earth-border">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-earth-text">
                          {formatCurrency(itemTotal)}
                        </div>
                        {mrpTotal > itemTotal && (
                          <div className="text-xs text-earth-muted line-through">
                            {formatCurrency(mrpTotal)}
                          </div>
                        )}
                        <div className="text-[10px] text-earth-muted">
                          {formatCurrency(product.price)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Stepper */}
                        <div className="flex items-center border border-earth-border rounded-xl bg-earth-card-soft overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, item.quantity - 1)}
                            className="p-1.5 sm:p-2 text-earth-muted hover:text-earth-text hover:bg-earth-border/40 transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-earth-text">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, item.quantity + 1)}
                            className="p-1.5 sm:p-2 text-earth-muted hover:text-earth-text hover:bg-earth-border/40 transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-2 text-earth-muted hover:text-terracotta-600 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Shopping Button */}
            <div className="pt-2">
              <Link
                href="/customer/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-sage-700 hover:text-sage-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping FMCG Essentials</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-earth-card border border-earth-border rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-base font-bold text-earth-text pb-3 border-b border-earth-border">
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-earth-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon: RIVA10"
                      disabled={couponApplied}
                      className="w-full uppercase bg-white border border-earth-border rounded-xl pl-8 pr-3 py-2 text-xs text-earth-text placeholder-earth-muted/60 focus:border-sage-600 outline-none"
                    />
                  </div>
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-3 py-2 bg-earth-text text-white rounded-xl text-xs font-bold hover:bg-espresso-900 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </form>
                {couponError && (
                  <p className="text-[11px] text-terracotta-600 mt-1 font-medium">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[11px] text-sage-700 mt-1 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coupon &ldquo;{couponCode}&rdquo; applied successfully!
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-earth-muted">
                  <span>Items Subtotal ({cartCount} units)</span>
                  <span className="font-semibold text-earth-text">{formatCurrency(cartTotal)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-sage-700 font-medium">
                    <span>Retail Catalog Discount</span>
                    <span>-{formatCurrency(cartDiscount)}</span>
                  </div>
                )}

                {couponApplied && (
                  <div className="flex justify-between text-sage-700 font-medium">
                    <span>Coupon Savings</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-earth-muted">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-semibold text-earth-text">
                    {deliveryFee === 0 ? (
                      <span className="text-sage-700 font-bold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-earth-border flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-earth-text block">Total Amount</span>
                    <span className="text-[10px] text-earth-muted">Inclusive of all GST taxes</span>
                  </div>
                  <span className="text-xl font-extrabold text-earth-text">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => router.push('/customer/checkout')}
                className="w-full py-3.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sage-900/10 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-earth-border/60 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-earth-muted">
                  <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>100% Genuine FMCG Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-earth-muted">
                  <Truck className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>Doorstep Delivery & Store Pickup Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
