'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { ProductTable } from '@/components/products/ProductTable';
import { Modal } from '@/components/common/Modal';
import { ProductCategory, Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Package, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const { products, addProduct } = useStoreData();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Snacks');
  const [price, setPrice] = useState(100);
  const [unit, setUnit] = useState('200 g');
  const [description, setDescription] = useState('');
  const [aisle, setAisle] = useState('Aisle 3');
  const [section, setSection] = useState('Snacks & Biscuits');
  const [shelf, setShelf] = useState('Shelf B2');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct({
      name,
      sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      brand,
      category,
      price: Number(price),
      unit,
      description,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&auto=format&fit=crop&q=80',
      storeId: 'store-blr-01',
      aisle,
      shelf,
      stockQuantity: 15,
      reorderLevel: 5,
      returnWindowDays: 7,
      lastUpdated: new Date().toISOString(),
      location: {
        aisle,
        section,
        shelf,
      },
      tags: [name.toLowerCase(), brand.toLowerCase(), category.toLowerCase()],
      isVeg: true,
    });
    setModalOpen(false);
    setName('');
    setBrand('');
    setDescription('');
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Product Master Catalog</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                MASTER REPOSITORY
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Maintain product definitions, aisle wayfinding coordinates, and pricing across retail categories.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        </div>

        <ProductTable showInventoryControls={false} />

        {/* Add Product Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add New Catalog SKU"
          subtitle="Configure product details, category, and shelf coordinates"
          maxWidth="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parle-G Gold Biscuits"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Parle"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Household">Household</option>
                  <option value="Grocery & Staples">Grocery & Staples</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Weight/Vol</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. 500 g"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Product summary for AI assistant..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
              />
            </div>

            {/* Location coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Store Aisle</label>
                <input
                  type="text"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  placeholder="e.g. Aisle 3"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. Namkeen"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shelf Tier</label>
                <input
                  type="text"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  placeholder="e.g. Shelf B1"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-900/30"
              >
                Create Product Master
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
