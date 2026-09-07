'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { ProductCard } from '@/components/products/ProductCard';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { Product } from '@/types';
import { Search, MapPin, Filter, Package, Sparkles, ArrowUpDown } from 'lucide-react';

export default function CustomerProductsPage() {
  const { products, activeStore } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'stock-high'>('featured');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const categories = [
    'ALL',
    'Dairy',
    'Beverages',
    'Snacks',
    'Grocery & Staples',
    'Personal Care',
    'Household',
  ];

  const filteredAndSorted = useMemo(() => {
    let result = products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.location.aisle.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock-high') {
      result.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

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
              <h1 className="text-2xl font-extrabold text-[#4A2C1D] tracking-tight">Product Master Catalog</h1>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sage-500/15 text-sage-800 border border-sage-500/30">
                {activeStore?.code || 'IND-01'}
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Browse 100+ FMCG catalog items, check aisle/shelf allocations, and check live demo stock levels.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-earth-card border border-earth-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-earth-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories, SKU or aisle..."
                className="w-full bg-earth-bg border border-earth-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-earth-text placeholder-earth-muted focus:border-sage-600 outline-none transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-earth-muted shrink-0" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-earth-bg border border-earth-border rounded-xl px-3 py-2 text-xs font-semibold text-earth-text focus:border-sage-600 outline-none"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="stock-high">Highest Stock</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-earth-bg text-earth-muted hover:text-earth-text hover:bg-earth-border/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-earth-muted">
              Showing <strong className="text-earth-text">{filteredAndSorted.length}</strong> products
            </span>
          </div>

          {filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSorted.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onInitiateReturn={() => handleStartReturn(product)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-earth-card border border-earth-border rounded-2xl p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-earth-muted mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-earth-text">No matching products found</h3>
              <p className="text-xs text-earth-muted max-w-sm mx-auto">
                Try searching for another brand (e.g., Amul, Tata, Maggi) or clear your category filter.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 text-xs font-bold px-4 py-2 bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Return Wizard Modal */}
      {selectedProduct && (
        <ReturnWizardModal
          isOpen={returnModalOpen}
          onClose={() => {
            setReturnModalOpen(false);
            setSelectedProduct(undefined);
          }}
          initialProduct={selectedProduct}
        />
      )}
    </DashboardLayout>
  );
}
