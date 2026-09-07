'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductTable } from '@/components/products/ProductTable';
import { useStoreData } from '@/context/StoreContext';
import { StatCard } from '@/components/common/StatCard';
import { Boxes, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AdminInventoryPage() {
  const { inventory, products, activeStore } = useStoreData();
  const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold);
  const inStock = inventory.filter((i) => i.quantity > i.minThreshold);

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">Enterprise Inventory Matrix</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">
                LIVE SHELF TELEMETRY
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Store inventory sync, minimum threshold configurations, and batch number tracking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Stock Units"
            value={inventory.reduce((acc, curr) => acc + curr.quantity, 0)}
            subtitle="Units physically present on shelves"
            icon={Boxes}
            variant="purple"
          />
          <StatCard
            title="Healthy Stock SKUs"
            value={inStock.length}
            subtitle="Above safety replenish limits"
            icon={CheckCircle2}
            variant="emerald"
          />
          <StatCard
            title="Actionable Low Stock"
            value={lowStock.length}
            subtitle="Triggers assistant backroom warning"
            icon={AlertTriangle}
            variant="amber"
          />
        </div>

        <ProductTable showInventoryControls={true} />
      </div>
    </DashboardLayout>
  );
}
