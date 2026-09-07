'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useStoreData } from '@/context/StoreContext';
import { ProductTable } from '@/components/products/ProductTable';
import { StatCard } from '@/components/common/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Boxes, 
  AlertTriangle, 
  TrendingDown, 
  Package, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Clock, 
  Zap,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function StaffInventoryPage() {
  const { 
    inventory, 
    products, 
    activeStore, 
    inventoryStats, 
    activityLogs,
    updateInventoryQuantity,
    setStockToZero,
    restoreStock 
  } = useStoreData();

  // Find Tata Tea Gold for quick demo testing
  const tataTea = products.find(p => p.name.toLowerCase().includes('tata tea'));
  const tataTeaInv = tataTea ? inventory.find(i => i.productId === tataTea.id) : undefined;
  const currentTataTeaQty = tataTeaInv ? tataTeaInv.quantity : (tataTea?.stockQuantity ?? 8);

  return (
    <DashboardLayout allowedRoles={['STAFF', 'ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <Boxes className="w-3.5 h-3.5" />
                <span>Live Shelf & Warehouse Telemetry • {activeStore?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Store Inventory Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Real-time stock verification, automated reorder thresholds, and dynamic assistant synchronisation.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Required KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={inventoryStats.totalProducts || products.length}
            subtitle="Registered FMCG & Kirana SKUs"
            icon={Package}
            variant="blue"
          />
          <StatCard
            title="Total Units"
            value={inventoryStats.totalUnits}
            subtitle="Physical units on store shelves"
            icon={Boxes}
            variant="purple"
          />
          <StatCard
            title="Low-Stock Products"
            value={inventoryStats.lowStockCount}
            subtitle="Below safety replenishment level"
            icon={AlertTriangle}
            variant="amber"
          />
          <StatCard
            title="Out-of-Stock Products"
            value={inventoryStats.outOfStockCount}
            subtitle="Unavailable for shoppers"
            icon={TrendingDown}
            variant="rose"
          />
        </div>

        {/* Quick Hackathon Demo Control Panel Banner */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Hackathon Live Demo Control Panel</span>
              </div>
              <h3 className="text-sm font-bold text-white">Test Real-Time Assistant Inventory Sync</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle stock here and immediately ask RIVA assistant in another tab to observe instantaneous status updates.
              </p>
            </div>

            {tataTea && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300 font-semibold">{tataTea.name}:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {currentTataTeaQty} units
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => setStockToZero(tataTea.id)}
                    disabled={currentTataTeaQty === 0}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Set to 0 (Out of Stock)
                  </button>
                  <button
                    onClick={() => restoreStock(tataTea.id, 8)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Restore to 8
                  </button>
                  <button
                    onClick={() => updateInventoryQuantity(tataTea.id, currentTataTeaQty + 10, 'Restock')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    +10 Restock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Inventory Activity Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Real-Time Inventory Mutation & Activity Log</h3>
            </div>
            <span className="text-xs text-slate-400">{activityLogs.length} Events Logged</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">No inventory updates logged yet.</div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDate(log.timestamp)}
                    </div>
                    <span className="font-bold text-white">{log.productName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs self-end sm:self-center">
                    <div className="font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                      <span className="text-slate-400">{log.previousQuantity}</span>
                      <span className="text-slate-600 mx-1">&rarr;</span>
                      <span className={log.newQuantity === 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {log.newQuantity}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      Reason: <strong className="text-slate-200">{log.reason}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Master Inventory Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Stock Levels & Shelf Waypoints</h2>
            <span className="text-xs text-slate-400">Controls update live counts across all assistant sessions</span>
          </div>
          <ProductTable showInventoryControls={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}
