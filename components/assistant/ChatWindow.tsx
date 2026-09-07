'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  MapPin, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  LifeBuoy, 
  Volume2,
  RefreshCw,
  TicketCheck,
  ShieldCheck,
  Clock,
  CreditCard,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStoreData } from '@/context/StoreContext';
import { Message, Product } from '@/types';
import { StockBadge } from '@/components/common/Badges';
import { VoiceVisualizer } from './VoiceVisualizer';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface ChatWindowProps {
  onInitiateReturn?: (product: Product) => void;
  onLocateProduct?: (product: Product) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onInitiateReturn, onLocateProduct }) => {
  const { user } = useAuth();
  const { askAssistant, clearConversationMemory, addToCart } = useStoreData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste ${user?.name ? user.name.split(' ')[0] : 'there'}! 🙏 I am **RIVA**, your intelligent in-store FMCG retail assistant.\n\nI can help you:\n• Verify **live product stock & shelf quantities**\n• Locate **exact store aisles, sections & shelves**\n• Check **prices, discounts & FMCG categories**\n• Evaluate **return/exchange policies** & initiate instant automated approvals.`,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: [
        'Is Amul milk in stock?',
        'Where is Tata Tea Gold?',
        'How much is Tata Tea Gold?',
        'Show me snacks',
        'Can I return opened shampoo?'
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setSpeechStatus('processing');

    try {
      const result = await askAssistant(text, {
        customerId: user?.id,
        customerName: user?.name,
      });

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: result.suggestedResponse,
        timestamp: new Date().toISOString(),
        actionPayload: result.actionPayload,
        suggestedFollowUps: result.suggestedFollowUps,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        setSpeechStatus('idle');
      }, 250);
    } catch (err) {
      console.error('Error in assistant call:', err);
      setIsTyping(false);
      setSpeechStatus('idle');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't access inventory right now. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      setSpeechStatus('idle');
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        setIsListening(true);
        setSpeechStatus('listening');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          setSpeechStatus('processing');
          handleSend(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setSpeechStatus('idle');
          simulateVoiceQuery();
        };

        recognition.onend = () => {
          setIsListening(false);
          setSpeechStatus('idle');
        };

        recognition.start();
        return;
      } catch {
        // Fallback simulation
      }
    }

    simulateVoiceQuery();
  };

  const simulateVoiceQuery = () => {
    setIsListening(true);
    setSpeechStatus('listening');
    const sampleQueries = [
      'Is Amul milk in stock?',
      'Where is Tata Tea Gold?',
      'What is the price of Lay\'s Magic Masala?',
      'Show me snacks',
      'Can I return opened shampoo?',
      'Where is Aashirvaad Atta?'
    ];
    const picked = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

    setTimeout(() => {
      setIsListening(false);
      setSpeechStatus('processing');
      handleSend(picked);
    }, 1500);
  };

  const handleResetSession = () => {
    clearConversationMemory();
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        content: `Session refreshed! How can I assist you with FMCG products, shelf stock, or returns today?`,
        timestamp: new Date().toISOString(),
        suggestedFollowUps: [
          'Is Amul milk in stock?',
          'Where is Tata Tea Gold?',
          'Show me products under ₹100',
          'Can I return opened shampoo?'
        ]
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[85vh] bg-earth-card border border-earth-border rounded-2xl shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-earth-card-soft border-b border-earth-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-600 text-white flex items-center justify-center shadow-md shadow-sage-900/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-earth-text text-base">RIVA In-Store Assistant</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                Live Inventory Connected
              </span>
            </div>
            <p className="text-xs text-earth-muted">Real-time Stock, Wayfinding & Autonomous Returns</p>
          </div>
        </div>

        <button
          onClick={handleResetSession}
          title="Reset Conversation Context"
          className="p-2 text-earth-muted hover:text-earth-text hover:bg-earth-border/60 rounded-lg transition-colors text-xs flex items-center gap-1 border border-earth-border/70"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
        </button>
      </div>

      {/* Voice Status Pill */}
      {speechStatus !== 'idle' && (
        <div className="px-4 py-2 bg-terracotta-50 border-b border-terracotta-100 flex items-center justify-between text-xs text-terracotta-800 animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-ping" />
            <span>{speechStatus === 'listening' ? 'Listening to voice...' : 'Processing natural language query...'}</span>
          </div>
          <span className="text-[10px] font-bold text-terracotta-700 uppercase">Voice AI</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-earth-bg/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const payload = msg.actionPayload;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className={`flex gap-3 max-w-[92%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-earth-text text-white'
                      : 'bg-sage-600 text-white shadow-sm'
                  }`}
                >
                  {isUser ? 'You' : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-sage-600 text-white shadow-md rounded-tr-none'
                      : 'bg-earth-card text-earth-text border border-earth-border border-l-4 border-l-sage-600 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm font-medium">
                    {msg.content}
                  </div>

                  {/* 1. PRODUCT / LOCATION / STOCK CARD */}
                  {(payload?.type === 'LOCATION_CARD' || payload?.type === 'STOCK_CARD' || payload?.type === 'PRODUCT_CARD') && payload.data && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-earth-card-soft rounded-xl p-3.5 border border-earth-border shadow-2xs">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={payload.data.image || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80'}
                          alt={payload.data.name}
                          className="w-14 h-14 rounded-lg object-cover border border-earth-border shrink-0 bg-white shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            payload.data.category?.includes('Dairy') ? 'bg-soft-blue-50 text-soft-blue-800 border-soft-blue-200' :
                            payload.data.category?.includes('Beverage') ? 'bg-warm-yellow-50 text-warm-yellow-900 border-warm-yellow-300' :
                            payload.data.category?.includes('Snack') ? 'bg-soft-orange-50 text-soft-orange-800 border-soft-orange-200' :
                            payload.data.category?.includes('Personal') ? 'bg-soft-pink-50 text-soft-pink-800 border-soft-pink-200' :
                            'bg-sage-50 text-sage-800 border-sage-200'
                          }`}>
                            {payload.data.brand || payload.data.category}
                          </span>
                          <h4 className="font-bold text-earth-text text-xs sm:text-sm truncate mt-1">{payload.data.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-earth-text">{formatCurrency(payload.data.price)}</span>
                            <span className="text-[11px] text-earth-muted">({payload.data.unit})</span>
                            <StockBadge 
                              quantity={payload.data.stockQuantity} 
                              reorderLevel={payload.data.reorderLevel || 5}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Chip */}
                      <div className="mt-2.5 pt-2 border-t border-earth-border flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-earth-text">
                          <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                          <span>
                            <strong>{payload.data.location?.aisle || payload.data.aisle}</strong> • {payload.data.location?.shelf || payload.data.shelf}
                            <span className="text-earth-muted text-[11px] ml-1">({payload.data.location?.section || payload.data.category})</span>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => {
                              addToCart(payload.data.id || payload.data.productId, 1);
                              handleSend(`Added ${payload.data.name} to cart!`);
                            }}
                            className="px-2.5 py-1 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onLocateProduct) onLocateProduct(payload.data);
                              else handleSend(`Where is ${payload.data.name}?`);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-earth-card-soft text-earth-text border border-earth-border rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <MapPin className="w-3 h-3 text-sage-600" />
                            <span>Find</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onInitiateReturn) onInitiateReturn(payload.data);
                              else handleSend(`I want to return ${payload.data.name}`);
                            }}
                            className="px-2.5 py-1 bg-earth-card-soft hover:bg-earth-border/40 text-earth-text border border-earth-border rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-sage-600" />
                            <span>Return</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. OUT OF STOCK CARD WITH RELEVANT ALTERNATIVES */}
                  {payload?.type === 'OUT_OF_STOCK_CARD' && payload.data && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-terracotta-50/50 border border-terracotta-200/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-terracotta-600" />
                          <h4 className="text-xs font-bold text-terracotta-900">{payload.data.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-300">
                          Currently Unavailable
                        </span>
                      </div>

                      {payload.meta?.alternatives && payload.meta.alternatives.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-terracotta-100">
                          <p className="text-[11px] font-bold text-earth-text">Available In-Stock Alternatives:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {payload.meta.alternatives.map((alt) => (
                              <div
                                key={alt.id}
                                onClick={() => handleSend(`Where is ${alt.name}?`)}
                                className="bg-white p-2.5 rounded-lg border border-earth-border flex items-center justify-between hover:border-sage-500 cursor-pointer transition-all shadow-xs"
                              >
                                <div>
                                  <div className="font-bold text-xs text-earth-text">{alt.name}</div>
                                  <div className="text-[11px] text-earth-muted">
                                    {alt.aisle} • {alt.shelf} • <span className="text-sage-700 font-bold">{alt.stockQuantity} in stock</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-xs text-earth-text">{formatCurrency(alt.price)}</div>
                                  <div className="text-[10px] text-sage-600 flex items-center gap-0.5 justify-end">
                                    <span>Select</span> <ChevronRight className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. PRODUCT LIST CARD (e.g. Snacks, Low stock, Under ₹100) */}
                  {payload?.type === 'PRODUCT_LIST_CARD' && Array.isArray(payload.data) && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-earth-card-soft border border-earth-border rounded-xl p-3 space-y-2">
                      <div className="text-xs font-bold text-earth-text flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-sage-600" />
                          <span>Matching Supermarket Products ({payload.data.length})</span>
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {payload.data.slice(0, 5).map((p: Product) => (
                          <div
                            key={p.id}
                            onClick={() => handleSend(`Where is ${p.name}?`)}
                            className="bg-white p-2 rounded-lg border border-earth-border flex items-center justify-between hover:border-sage-500 cursor-pointer transition-colors text-xs"
                          >
                            <div className="truncate pr-2">
                              <span className="font-semibold text-earth-text">{p.name}</span>
                              <span className="text-[11px] text-earth-muted block">{p.aisle} • {p.shelf}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-earth-text">{formatCurrency(p.price)}</span>
                              <span className="text-[10px] text-sage-700 block font-medium">{p.stockQuantity} in stock</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. AUTOMATED RETURN APPROVAL CARD */}
                  {payload?.type === 'RETURN_APPROVED_CARD' && payload.data && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-sage-50/70 border border-sage-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sage-800 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-sage-600" />
                          <span>Autonomous Approval Voucher</span>
                        </div>
                        <span className="font-mono text-[11px] bg-white text-sage-800 px-2 py-0.5 rounded border border-sage-300 font-bold">
                          {payload.data.id}
                        </span>
                      </div>
                      <div className="text-xs text-earth-text space-y-1">
                        <div><strong>Item:</strong> {payload.data.productName}</div>
                        <div><strong>Resolution:</strong> Instant Refund / Store Credit ({formatCurrency(payload.data.amount || payload.data.price || 0)})</div>
                        <div className="text-[11px] text-sage-700 pt-1">
                          📍 <strong>Next Steps:</strong> Show voucher code <strong>{payload.data.id}</strong> at Customer Desk Gate 2.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. SUPPORT TICKET CREATION CARD */}
                  {payload?.type === 'TICKET_CREATED_CARD' && payload.data && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                          <TicketCheck className="w-4 h-4 text-amber-600" />
                          <span>Staff Review Ticket Created</span>
                        </div>
                        <span className="font-mono text-[11px] bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold">
                          {payload.data.ticketId || payload.data.id}
                        </span>
                      </div>
                      <div className="text-xs text-earth-text space-y-1">
                        <div><strong>Status:</strong> <span className="text-amber-800 font-semibold">ESCALATED TO STORE MANAGER</span></div>
                        <div className="text-[11px] text-earth-muted pt-1">
                          A store representative will review your request at Customer Service Desk near Gate 1.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. POLICY CARD */}
                  {payload?.type === 'POLICY_CARD' && payload.data && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-earth-card-soft border border-earth-border rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-earth-text">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-sage-600" />
                          <span>{payload.data.category} Policy Rules</span>
                        </div>
                        <span className="text-sage-700 font-mono text-[11px] bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                          Window: {payload.data.windowDays} Day(s)
                        </span>
                      </div>
                      <div className="text-xs text-earth-muted space-y-1">
                        <div className="text-[11px]">
                          • Auto-approval limit: <strong className="text-earth-text">{formatCurrency(payload.data.autoApprovalLimit)}</strong> with store invoice.
                        </div>
                        {payload.data.notes && (
                          <div className="text-[11px] text-earth-text bg-white p-2 rounded border border-earth-border">
                            {payload.data.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 7. CART CARD */}
                  {payload?.type === 'CART_CARD' && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-earth-card-soft border border-earth-border rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-earth-text font-bold text-xs">
                          <ShoppingCart className="w-4 h-4 text-sage-600" />
                          <span>Shopping Cart & Checkout</span>
                        </div>
                      </div>
                      <p className="text-xs text-earth-muted">
                        Review your items, apply discount coupons, or proceed to express checkout.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/customer/cart"
                          className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Open My Cart</span>
                        </Link>
                        <Link
                          href="/customer/checkout"
                          className="px-3 py-1.5 bg-earth-text hover:bg-espresso-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Proceed to Checkout</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* 8. ORDER CARD */}
                  {payload?.type === 'ORDER_CARD' && (
                    <div className="mt-3.5 pt-3 border-t border-earth-border bg-earth-card-soft border border-earth-border rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-earth-text font-bold text-xs">
                          <ShoppingBag className="w-4 h-4 text-sage-600" />
                          <span>Orders & Deliveries</span>
                        </div>
                      </div>
                      <p className="text-xs text-earth-muted">
                        Track live fulfillment, view order receipts, or initiate returns.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/customer/orders"
                          className="px-3.5 py-1.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>View My Orders</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-11 pt-1">
                  {msg.suggestedFollowUps.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="text-xs bg-white hover:bg-earth-card-soft text-earth-text px-3 py-1 rounded-full border border-earth-border transition-all hover:border-sage-500 shadow-2xs text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-earth-card border border-earth-border rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-earth-muted ml-2 font-medium">Checking live FMCG inventory & policy rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Visualizer */}
      <div className="px-4 bg-earth-card">
        <VoiceVisualizer isListening={isListening} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-earth-card-soft border-t border-earth-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all flex items-center justify-center ${
              isListening
                ? 'bg-terracotta-600 text-white animate-pulse shadow-md shadow-terracotta-900/30'
                : 'bg-white text-earth-muted hover:text-sage-700 hover:bg-earth-bg border border-earth-border shadow-xs'
            }`}
            title={isListening ? 'Stop listening' : 'Speak to RIVA Voice Assistant'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stock, aisle locations, prices, or return policies..."
            className="flex-1 bg-white border border-earth-border focus:border-sage-500 focus:ring-1 focus:ring-sage-500 rounded-xl px-4 py-3 text-sm text-earth-text placeholder-earth-muted outline-none transition-all shadow-xs"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-sage-600 hover:bg-sage-700 disabled:opacity-40 disabled:hover:bg-sage-600 text-white rounded-xl shadow-md shadow-sage-900/15 transition-all"
            title="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-earth-muted mt-2 px-1">
          <span>💡 Live FMCG Inventory • Voice & Multi-Turn Memory Active</span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
