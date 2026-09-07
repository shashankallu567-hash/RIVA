'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Product, ReturnRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { 
  RotateCcw, 
  Sparkles, 
  LifeBuoy
} from 'lucide-react';

interface ReturnWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
}

export const ReturnWizardModal: React.FC<ReturnWizardModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
}) => {
  const { user } = useAuth();
  const { products, submitReturn } = useStoreData();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [orderId, setOrderId] = useState('ORD-2025-' + Math.floor(1000 + Math.random() * 9000));
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('Product seal was damaged / opened on arrival');
  const [isOpened, setIsOpened] = useState(false);
  const [hasReceipt, setHasReceipt] = useState(true);
  const [resolutionType, setResolutionType] = useState<'REFUND' | 'EXCHANGE' | 'STORE_CREDIT'>('EXCHANGE');
  const [exchangeProductId, setExchangeProductId] = useState<string>(products[0]?.id || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReturnRequest | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const exchangeProduct = products.find(p => p.id === exchangeProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const res = await submitReturn({
        customerId: user?.id || 'usr-cust-101',
        customerName: user?.name || 'Aarav Sharma',
        customerPhone: user?.phone || '+91 98765 43210',
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        orderId,
        purchaseDate: new Date(purchaseDate).toISOString(),
        amount: selectedProduct.price,
        reason,
        resolutionType,
        isOpened,
        hasReceipt,
        exchangeProductId: resolutionType === 'EXCHANGE' ? exchangeProductId : undefined,
        exchangeProductName: resolutionType === 'EXCHANGE' ? exchangeProduct?.name : undefined,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="RIVA Autonomous Return & Exchange Assistant"
      subtitle="Instant AI Policy Evaluation & Dispute Automation"
      maxWidth="xl"
    >
      {result ? (
        <div className="space-y-6 py-2">
          {/* Outcome banner */}
          {result.status === 'AUTO_APPROVED' || result.status === 'APPROVED' ? (
            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-sage-500/20 text-sage-700 border border-sage-500/30 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-sage-600 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
                Decision: Auto-Approved
              </span>
              <h3 className="text-xl font-bold text-earth-text mt-3">Return Approved by RIVA Agent!</h3>
              <p className="text-sm text-earth-muted mt-2 max-w-md mx-auto leading-relaxed">
                {result.notes}
              </p>
              <div className="mt-4 inline-block bg-earth-card border border-earth-border px-4 py-2 rounded-xl text-xs font-mono text-sage-800 font-bold">
                Voucher / Return Token: <strong>{result.id.toUpperCase()}</strong>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center mx-auto mb-3">
                <LifeBuoy className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Staff Escalation Created
              </span>
              <h3 className="text-xl font-bold text-earth-text mt-3">Routed to Store Support Staff</h3>
              <p className="text-sm text-earth-muted mt-2 max-w-md mx-auto leading-relaxed">
                {result.notes}
              </p>
              {result.ticketId && (
                <div className="mt-4 inline-block bg-earth-card border border-earth-border px-4 py-2 rounded-xl text-xs font-mono text-amber-800 font-bold">
                  Auto-Created Support Ticket: <strong>{result.ticketId.toUpperCase()}</strong>
                </div>
              )}
            </div>
          )}

          {/* Details summary */}
          <div className="bg-earth-card-soft border border-earth-border rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-earth-muted">
              <span>Item:</span>
              <span className="text-earth-text font-semibold">{result.productName}</span>
            </div>
            <div className="flex justify-between text-earth-muted">
              <span>Order Reference:</span>
              <span className="text-earth-text font-mono">{result.orderId}</span>
            </div>
            <div className="flex justify-between text-earth-muted">
              <span>Resolution Type:</span>
              <span className="text-sage-700 font-semibold">{result.resolutionType}</span>
            </div>
            <div className="flex justify-between text-earth-muted">
              <span>Refund/Value:</span>
              <span className="text-earth-text font-bold">{formatCurrency(result.amount || result.price || 0)}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
          >
            Done & Return to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product selector */}
          <div>
            <label className="block text-xs font-semibold text-earth-text mb-1">Select Product to Return/Exchange</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-earth-card-soft border border-earth-border rounded-xl p-3 text-sm text-earth-text focus:border-sage-500 outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Order info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-earth-text mb-1">Order / Bill ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full bg-earth-card-soft border border-earth-border rounded-xl p-2.5 text-sm text-earth-text focus:border-sage-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-earth-text mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                className="w-full bg-earth-card-soft border border-earth-border rounded-xl p-2.5 text-sm text-earth-text focus:border-sage-500 outline-none"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-earth-text mb-1">Reason for Return</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-earth-card-soft border border-earth-border rounded-xl p-2.5 text-sm text-earth-text focus:border-sage-500 outline-none mb-2"
            >
              <option value="Product seal was damaged / opened on arrival">Product seal was damaged / opened on arrival</option>
              <option value="Spoiled / bad odor / quality defect within 24 hours">Spoiled / bad odor / quality defect within 24 hours</option>
              <option value="Wrong variant or flavor picked up (Unopened)">Wrong variant or flavor picked up (Unopened)</option>
              <option value="Expired item found in packaging">Expired item found in packaging</option>
              <option value="Customer dissatisfaction after opening / using">Customer dissatisfaction after opening / using</option>
            </select>
          </div>

          {/* Condition toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-earth-card-soft border border-earth-border cursor-pointer">
              <input
                type="checkbox"
                checked={isOpened}
                onChange={(e) => setIsOpened(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded"
              />
              <span className="text-xs text-earth-text font-medium">Package is Opened / Unsealed</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-earth-card-soft border border-earth-border cursor-pointer">
              <input
                type="checkbox"
                checked={hasReceipt}
                onChange={(e) => setHasReceipt(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded"
              />
              <span className="text-xs text-earth-text font-medium">I have the Original Receipt</span>
            </label>
          </div>

          {/* Resolution Selector */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-earth-text">Preferred Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {(['REFUND', 'EXCHANGE', 'STORE_CREDIT'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setResolutionType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    resolutionType === type
                      ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                      : 'bg-earth-card-soft text-earth-muted border-earth-border hover:text-earth-text'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Replacement item selector if Exchange */}
          {resolutionType === 'EXCHANGE' && (
            <div className="pt-1">
              <label className="block text-xs font-semibold text-earth-text mb-1">Select Replacement FMCG Product</label>
              <select
                value={exchangeProductId}
                onChange={(e) => setExchangeProductId(e.target.value)}
                className="w-full bg-earth-card-soft border border-earth-border rounded-xl p-2.5 text-sm text-earth-text focus:border-sage-500 outline-none"
              >
                {products.filter(p => p.id !== selectedProductId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-earth-muted hover:text-earth-text rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Evaluating Policy Rules...</span>
              ) : (
                <>
                  <span>Evaluate & Process Return</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
