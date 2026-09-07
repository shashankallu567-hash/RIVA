'use client';

import React, { useState } from 'react';
import { Product, ProductCategory } from '@/types';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StockBadge } from '@/components/common/Badges';
import { Search, MapPin, Plus, Minus, Edit2, AlertTriangle, ArrowUpDown, RefreshCw, Ban } from 'lucide-react';

interface ProductTableProps {
  showInventoryControls?: boolean;
  onEditProduct?: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  showInventoryControls = false,
  onEditProduct,
}) => {
  const { 
    products, 
    inventory, 
    updateInventoryQuantity, 
    setStockToZero, 
    restoreStock 
  } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.aisle.toLowerCase().includes(q) ||
      p.location.aisle.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, product name, brand, or aisle location..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing <strong className="text-white">{filtered.length}</strong> of {products.length} catalog items</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Product / SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Stock Level</th>
              <th className="py-3.5 px-4">Reorder Level</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Last Updated</th>
              {showInventoryControls && <th className="py-3.5 px-4 text-right">Demo Controls</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showInventoryControls ? 8 : 7} className="py-12 text-center text-slate-500">
                  No matching products found in inventory.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const inv = inventory.find((i) => i.productId === prod.id);
                const currentQty = inv?.quantity ?? prod.stockQuantity;
                const reorder = inv?.reorderLevel ?? prod.reorderLevel;
                const status = inv?.status;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{prod.brand}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400">{prod.sku}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-300">{formatCurrency(prod.price)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-white text-sm">
                        {currentQty} <span className="text-xs text-slate-500 font-normal">units</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-400">
                        {reorder} <span className="text-[10px] text-slate-500">min</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{prod.aisle}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 pl-4">{prod.shelf}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StockBadge 
                        quantity={currentQty} 
                        reorderLevel={reorder} 
                        status={status} 
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(inv?.lastUpdated || prod.lastUpdated)}
                      </div>
                    </td>

                    {showInventoryControls && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Decrease */}
                          <button
                            onClick={() => updateInventoryQuantity(prod.id, Math.max(0, currentQty - 1), 'Manual update')}
                            disabled={currentQty === 0}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Decrease Stock (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Increase */}
                          <button
                            onClick={() => updateInventoryQuantity(prod.id, currentQty + 1, 'Manual update')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Increase Stock (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Set to Zero (Hackathon test requirement) */}
                          <button
                            onClick={() => setStockToZero(prod.id)}
                            disabled={currentQty === 0}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-30 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors ml-1"
                            title="Set Stock to 0 (Out of Stock)"
                          >
                            Set 0
                          </button>

                          {/* Restore Stock */}
                          <button
                            onClick={() => restoreStock(prod.id, 10)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors flex items-center gap-0.5"
                            title="Restore Stock to 10"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>10</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
