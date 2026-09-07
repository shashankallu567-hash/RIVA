'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';
import { Navbar } from '@/components/common/Navbar';
import { 
  Bot, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  ArrowRight,
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';
import { ReturnWizardModal } from '@/components/returns/ReturnWizardModal';
import { ChatWindow } from '@/components/assistant/ChatWindow';

export default function HomePage() {
  const { switchPersona } = useAuth();
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-earth-bg text-earth-text flex flex-col font-sans selection:bg-sage-500/20">
      <DemoRoleSwitcher />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-500/15 border border-sage-500/30 text-sage-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-sage-600" />
            <span>Hackathon Project: RAG Voice & In-Store Assistant for FMCG Inventory & Returns</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-earth-text tracking-tight leading-[1.15]">
            RIVA
            <span className="block text-xl sm:text-2xl font-bold text-sage-700 mt-2">
              Retail Intelligence & Virtual Assistant
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-earth-muted font-medium italic">
            &quot;Your intelligent in-store FMCG retail assistant.&quot;
          </p>

          <p className="text-sm text-earth-muted max-w-2xl mx-auto leading-relaxed">
            Eliminate repetitive stock & location inquiries across 15+ Indian FMCG supermarket categories, execute policy-compliant autonomous returns, verify live inventory, and seamlessly escalate disputes with zero customer friction.
          </p>

          {/* Persona Launchers */}
          <div className="pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-earth-muted mb-3">
              Select Demo Persona to Experience RIVA:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {/* Customer */}
              <Link
                href="/customer"
                onClick={() => switchPersona('CUSTOMER')}
                className="p-4 rounded-2xl bg-earth-card hover:bg-earth-card-soft border border-earth-border hover:border-sage-500 text-left transition-all shadow-sm group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sage-500/15 text-sage-700 border border-sage-500/30 flex items-center justify-center mb-2.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-earth-text text-sm group-hover:text-sage-700 flex items-center gap-1.5">
                    <span>Customer Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-earth-muted mt-1">
                    Voice/Text Assistant, Stock & Location Finder, Instant Returns.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-bold text-sage-700">Launch Persona &rarr;</span>
              </Link>

              {/* Staff */}
              <Link
                href="/staff"
                onClick={() => switchPersona('STAFF')}
                className="p-4 rounded-2xl bg-earth-card hover:bg-earth-card-soft border border-earth-border hover:border-blue-500 text-left transition-all shadow-sm group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-2.5">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-earth-text text-sm group-hover:text-blue-600 flex items-center gap-1.5">
                    <span>Staff Operations</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-earth-muted mt-1">
                    Live Stock Adjustments, Return Reviews & Support Ticket SLA.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-bold text-blue-600">Launch Persona &rarr;</span>
              </Link>

              {/* Admin */}
              <Link
                href="/admin"
                onClick={() => switchPersona('ADMIN')}
                className="p-4 rounded-2xl bg-earth-card hover:bg-earth-card-soft border border-earth-border hover:border-purple-500 text-left transition-all shadow-sm group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-earth-text text-sm group-hover:text-purple-600 flex items-center gap-1.5">
                    <span>Admin Control</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-earth-muted mt-1">
                    Policy Studio, Product Master, Analytics & Full Audit Trail.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-bold text-purple-600">Launch Persona &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Assistant Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-16">
        <div className="bg-earth-card border border-earth-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sage-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Cpu className="w-4 h-4" />
                <span>Interactive In-Store Kiosk Simulation</span>
              </div>
              <h2 className="text-2xl font-bold text-earth-text tracking-tight">Try RIVA In Action Right Now</h2>
              <p className="text-xs text-earth-muted mt-0.5">
                Ask about Indian FMCG products (Amul Milk, Tata Tea, Dove, Parle-G, Aashirvaad Atta), location aisles, or return rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReturnModalOpen(true)}
                className="px-4 py-2 bg-earth-card-soft hover:bg-earth-border/40 text-earth-text border border-earth-border rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sage-600" />
                <span>Test Return Wizard</span>
              </button>
              <Link
                href="/customer/assistant"
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Full Screen Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <ChatWindow onInitiateReturn={() => setReturnModalOpen(true)} />
            </div>

            {/* Architecture Overview Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-earth-card-soft border border-earth-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-earth-text font-bold text-sm border-b border-earth-border pb-2.5">
                  <Activity className="w-4 h-4 text-sage-600" />
                  <span>Agent Decision Pipeline</span>
                </div>

                <div className="space-y-2.5 text-xs text-earth-muted">
                  <div className="p-2.5 rounded-xl bg-earth-card border border-earth-border flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sage-500/20 text-sage-700 flex items-center justify-center font-bold text-[10px]">1</span>
                    <div>
                      <div className="font-semibold text-earth-text">Voice / Text Ingestion</div>
                      <div className="text-[11px] text-earth-muted">Speech API & intent parsing</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-earth-card border border-earth-border flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sage-500/20 text-sage-700 flex items-center justify-center font-bold text-[10px]">2</span>
                    <div>
                      <div className="font-semibold text-earth-text">RAG FMCG & Policy Retrieval</div>
                      <div className="text-[11px] text-earth-muted">Fuzzy search & return policies</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-earth-card border border-earth-border flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sage-500/20 text-sage-700 flex items-center justify-center font-bold text-[10px]">3</span>
                    <div>
                      <div className="font-semibold text-earth-text">Live Inventory Verification</div>
                      <div className="text-[11px] text-earth-muted">Real-time shelf & batch checks</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-earth-card border border-earth-border flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sage-500/20 text-sage-700 flex items-center justify-center font-bold text-[10px]">4</span>
                    <div>
                      <div className="font-semibold text-earth-text">Autonomous Decision & Action</div>
                      <div className="text-[11px] text-earth-muted">Auto-approves token or creates ticket</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Statement Highlights */}
              <div className="bg-earth-card-soft border border-earth-border rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-earth-muted">Hackathon Capabilities</h4>
                <ul className="space-y-2 text-xs text-earth-text">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                    <span>Answers stock & location queries instantly with live data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                    <span>RAG over FMCG products & category return rules.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                    <span>Multi-turn conversational memory for follow-up questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                    <span>Auto-creates support ticket for staff on exceptions.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Modal */}
      <ReturnWizardModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-earth-border bg-earth-card-soft py-8 px-4 text-center text-xs text-earth-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-earth-text">RIVA</span>
            <span>—</span>
            <span>Retail Intelligence & Virtual Assistant</span>
          </div>
          <p className="text-earth-muted italic">
            &quot;Your intelligent in-store retail assistant.&quot;
          </p>
          <div className="text-earth-muted text-[11px]">
            Hackathon Edition • Modular Service Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
