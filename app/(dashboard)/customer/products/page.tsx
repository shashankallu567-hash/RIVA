'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { ProductCard } from '@/components/products/ProductCard';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { ProductCategory, Product } from '@/types';
import { Search, MapPin, Filter, Package, Sparkles } from 'lucide-react';

export default function CustomerProductsPage() {
  const { products, activeStore } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const categories: (ProductCategory | 'ALL')[] = [
    'ALL',
    'Dairy',
    'Beverages',
    'Snacks',
    'Personal Care',
    'Household',
    'Grocery & Staples',
  ];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.location.aisle.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartReturn = (product: Product) => {
    setSelectedProduct(product);
    setReturnModalOpen(true);
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">In-Store Product Catalog & Wayfinder</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-500/15 text-sage-800 border border-sage-500/30">
                {activeStore?.code}
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Search store items, check aisle/shelf allocations, and verify real-time stock levels.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, brand, or aisle location..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-400">
              Found <strong className="text-white">{filtered.length}</strong> items in stock catalog
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onInitiateReturn={handleStartReturn}
              />
            ))}
          </div>
        )}
      </div>

      <ReturnWizardModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedProduct(undefined);
        }}
        initialProduct={selectedProduct}
      />
    </DashboardLayout>
  );
}
