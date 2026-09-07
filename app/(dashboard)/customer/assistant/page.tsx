'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { Product } from '@/types';
import { Sparkles, MapPin, Boxes, RotateCcw, LifeBuoy, Zap } from 'lucide-react';

export default function CustomerAssistantPage() {
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const handleInitiateReturn = (product: Product) => {
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
              <h1 className="text-2xl font-bold text-[#1F1F1F] tracking-tight">RIVA AI In-Store Assistant</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-500/15 text-sage-800 border border-sage-500/30">
                VOICE & TEXT RAG
              </span>
            </div>
            <p className="text-xs text-earth-muted mt-1">
              Natural language retrieval over store catalog, real-time inventory, and category return policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedProduct(undefined);
                setReturnModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Direct Return Wizard</span>
            </button>
          </div>
        </div>

        {/* Main Assistant Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <ChatWindow onInitiateReturn={handleInitiateReturn} />
          </div>

          {/* Side Info & Tips */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Example Voice Inquiries</span>
              </div>
              <p className="text-xs text-slate-400">
                Click the microphone icon or type naturally:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  📍 <em>&quot;Where is Tata Tea Gold located?&quot;</em>
                  <div className="text-[10px] text-emerald-400 mt-0.5">&rarr; Returns Aisle 2, Shelf C1</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  📦 <em>&quot;Is Amul Milk available in stock right now?&quot;</em>
                  <div className="text-[10px] text-emerald-400 mt-0.5">&rarr; Checks live inventory count</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  🔄 <em>&quot;Can I return opened shampoo?&quot;</em>
                  <div className="text-[10px] text-emerald-400 mt-0.5">&rarr; Evaluates hygiene policy & routes</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  🧀 <em>&quot;I bought spoiled paneer, what can I do?&quot;</em>
                  <div className="text-[10px] text-emerald-400 mt-0.5">&rarr; Triggers 24h Dairy exchange token</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>RIVA Autonomous Operations</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlike static chat widgets, RIVA connects directly to store shelf inventory and return decision rules. Simple valid returns receive instant auto-approval, while disputes trigger automatic support tickets for floor supervisors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReturnWizardModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        initialProduct={selectedProduct}
      />
    </DashboardLayout>
  );
}
