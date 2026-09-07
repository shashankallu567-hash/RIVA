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
  Globe,
  ShoppingCart,
  Check
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

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'mr' | 'bn' | 'auto';

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; speechCode: string }[] = [
  { code: 'auto', label: '🌐 Auto-Detect', speechCode: 'en-IN' },
  { code: 'en', label: 'English', speechCode: 'en-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', speechCode: 'kn-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', speechCode: 'hi-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', speechCode: 'ta-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', speechCode: 'te-IN' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', speechCode: 'ml-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', speechCode: 'mr-IN' },
  { code: 'bn', label: 'বাংলা (Bengali)', speechCode: 'bn-IN' },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ onInitiateReturn, onLocateProduct }) => {
  const { user } = useAuth();
  const { askAssistant, clearConversationMemory, addToCart } = useStoreData();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('auto');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste ${user?.name ? user.name.split(' ')[0] : 'there'}! 🙏 I am **RIVA**, your intelligent FMCG retail copilot.\n\nI support **English, ಕನ್ನಡ, हिन्दी, தமிழ், తెలుగు, മലയാളം, मराठी, বাংলা** & auto-language detection!\n\nAsk me about:\n• Product stock, prices & aisle locations\n• Store recommendations & cart actions\n• Automated returns & exchanges`,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: [
        'Is Amul milk in stock?',
        'ಅಮುಲ್ ಹಾಲು ಲಭ್ಯವಿದೆಯೇ?',
        'क्या अमूल दूध उपलब्ध है?',
        'அமுல் பால் கிடைக்குமா?',
        'అమూల్ పాలు అందుబాటులో ఉన్నాయా?'
      ],
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech Recognition Setup
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setSpeechStatus('idle');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const currentOpt = LANGUAGE_OPTIONS.find((l) => l.code === selectedLang) || LANGUAGE_OPTIONS[0];
      recognition.lang = currentOpt.speechCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
        setSpeechStatus('idle');
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setSpeechStatus('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechStatus('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Voice activation failed:', err);
      setIsListening(false);
      setSpeechStatus('idle');
    }
  };

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

    try {
      // Send message to server route /api/chat with language preference
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language: selectedLang,
        }),
      });

      let assistantText = '';
      let matchedProducts: Product[] = [];
      let suggestedFollowUps: string[] = [];

      if (res.ok) {
        const data = await res.json();
        assistantText = data.suggestedResponse || 'I have retrieved the latest store data for your request.';
        matchedProducts = data.matchedProducts || [];
        suggestedFollowUps = data.suggestedFollowUps || [];
      } else {
        // Fallback to local store context
        const result = await askAssistant(text, { customerId: user?.id });
        assistantText = result.suggestedResponse;
        matchedProducts = result.matchedProducts || [];
        suggestedFollowUps = result.suggestedFollowUps || [];
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        matchedProducts,
        suggestedFollowUps: suggestedFollowUps.length > 0 ? suggestedFollowUps : [
          'Add to my cart',
          'Where is it located?',
          'Show similar items',
          'Can I return this?'
        ],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error getting assistant response:', error);
      // Client-side fallback
      const result = await askAssistant(text, { customerId: user?.id });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: result.suggestedResponse,
          matchedProducts: result.matchedProducts,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[650px] bg-earth-card border border-earth-border rounded-3xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="bg-earth-bg border-b border-earth-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage-600 border border-sage-700 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#4A2C1D]">RIVA AI Copilot</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Multilingual
              </span>
            </div>
            <p className="text-[11px] text-earth-muted">FMCG Retail Intelligence & Store Wayfinder</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as SupportedLanguage)}
              className="bg-earth-card border border-earth-border rounded-xl px-3 py-1.5 text-xs font-bold text-earth-text focus:border-sage-600 outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-earth-bg/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-sage-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sage-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-earth-card border border-earth-border text-earth-text rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-2 opacity-70 text-right ${
                    msg.role === 'user' ? 'text-white/80' : 'text-earth-muted'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Product Cards in Assistant Message */}
              {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {msg.matchedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-earth-card border border-earth-border rounded-xl p-3 space-y-2 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        {prod.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-sage-700 uppercase">{prod.brand}</span>
                          <h4 className="text-xs font-bold text-earth-text truncate">{prod.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs mt-0.5">
                            <span className="font-extrabold text-[#4A2C1D]">{formatCurrency(prod.price)}</span>
                            {prod.mrp && prod.mrp > prod.price && (
                              <span className="text-[10px] text-earth-muted line-through">
                                {formatCurrency(prod.mrp)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-earth-muted pt-1 border-t border-earth-border">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sage-600" />
                          Aisle {prod.location.aisle} • Shelf {prod.location.shelf}
                        </span>
                        <StockBadge quantity={prod.stockQuantity} status={prod.stockQuantity > 5 ? 'IN_STOCK' : 'LOW_STOCK'} />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="flex-1 py-1.5 px-2 bg-sage-600 text-white rounded-lg text-[11px] font-bold hover:bg-sage-700 flex items-center justify-center gap-1 transition-colors"
                        >
                          {addedItems[prod.id] ? (
                            <>
                              <Check className="w-3 h-3" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3 h-3" /> Add to Cart
                            </>
                          )}
                        </button>
                        <Link
                          href="/customer/checkout"
                          className="py-1.5 px-2 bg-earth-bg text-earth-text border border-earth-border rounded-lg text-[11px] font-bold hover:bg-earth-border/40 text-center"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Suggested Follow-ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {msg.suggestedFollowUps.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="px-3 py-1 rounded-full text-[11px] font-medium bg-earth-card border border-earth-border text-earth-text hover:bg-sage-600 hover:text-white transition-all shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-earth-muted text-xs p-2">
            <Bot className="w-4 h-4 text-sage-600 animate-bounce" />
            <span>RIVA is thinking & retrieving store data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Toolbar */}
      <div className="p-3 sm:p-4 bg-earth-card border-t border-earth-border space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-earth-bg text-earth-text border-earth-border hover:bg-earth-border/50'
            }`}
            title="Toggle Voice Input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask RIVA in English, ಕನ್ನಡ, हिन्दी, தமிழ், తెలుగు..."
            className="flex-1 bg-earth-bg border border-earth-border rounded-xl px-4 py-2.5 text-xs text-earth-text placeholder-earth-muted focus:border-sage-600 outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-sage-600 text-white hover:bg-sage-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
