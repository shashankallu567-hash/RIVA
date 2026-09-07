'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { StockBadge } from '@/components/common/Badges';
import { MapPin, RotateCcw, Eye, ShoppingCart, Zap, Heart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onInitiateReturn?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onInitiateReturn,
  onViewDetails,
}) => {
  const router = useRouter();
  const { inventory, addToCart, cart } = useStoreData();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inv = inventory.find((i) => i.productId === product.id);
  const qty = inv?.quantity ?? 0;
  const available = inv?.available ?? (qty > 0);

  const discountPercent = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isInCart = cart.some(item => item.product.id === product.id || item.product.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    addToCart(product.id, 1);
    router.push('/customer/checkout');
  };

  return (
    <div className="bg-earth-card border border-earth-border rounded-2xl overflow-hidden shadow-sm hover:border-sage-500/50 hover:shadow-md transition-all flex flex-col group relative">
      {/* Image container */}
      <div className="relative h-44 w-full bg-earth-card-soft overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-earth-card/95 text-sage-700 border border-sage-500/30 backdrop-blur-sm shadow-xs">
            {product.category}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-terracotta-600 text-white shadow-xs self-start">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors shadow-xs ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/80 text-earth-muted hover:text-rose-500 border border-white/40'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
          <StockBadge available={available} quantity={qty} minThreshold={inv?.minThreshold || 10} />
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-earth-muted">{product.brand}</div>
          <h3 className="text-sm font-bold text-earth-text mt-0.5 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-earth-muted mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        <div className="mt-3 pt-3 border-t border-earth-border space-y-2.5">
          {/* Price & Unit */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-earth-text">{formatCurrency(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-earth-muted line-through">{formatCurrency(product.mrp)}</span>
              )}
            </div>
            <span className="text-xs text-earth-muted font-medium">{product.unit}</span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1.5 text-xs text-earth-text bg-earth-card-soft px-2.5 py-1.5 rounded-xl border border-earth-border">
            <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0" />
            <span className="truncate">
              <strong className="text-earth-text">{product.location.aisle}</strong> • {product.location.shelf}
            </span>
          </div>

          {/* Primary E-Commerce Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={!available}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                !available
                  ? 'bg-earth-card-soft text-earth-muted border border-earth-border cursor-not-allowed opacity-60'
                  : justAdded
                  ? 'bg-sage-700 text-white shadow-sm'
                  : isInCart
                  ? 'bg-sage-50 text-sage-800 border border-sage-300 hover:bg-sage-100'
                  : 'bg-sage-600 hover:bg-sage-700 text-white shadow-sm'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isInCart ? 'Add More' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!available}
              className="py-2 px-2.5 bg-earth-text hover:bg-espresso-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-warm-yellow-400" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Secondary Actions: Return / Details */}
          <div className="flex items-center gap-2 pt-0.5">
            {onInitiateReturn && (
              <button
                onClick={() => onInitiateReturn(product)}
                className="flex-1 py-1.5 px-2 bg-earth-card-soft hover:bg-earth-border/40 text-earth-text rounded-xl text-[11px] font-semibold border border-earth-border flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-sage-600" />
                <span>Return/Exchange</span>
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product)}
                className="p-1.5 bg-earth-card-soft hover:bg-earth-border/40 text-earth-muted hover:text-earth-text rounded-xl border border-earth-border transition-colors"
                title="View Full Item Specs"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
