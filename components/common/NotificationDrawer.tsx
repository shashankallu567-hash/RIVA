'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Mail, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Package, 
  ShieldAlert, 
  ExternalLink,
  Sparkles,
  Check
} from 'lucide-react';
import { useStoreData } from '@/context/StoreContext';
import { AppNotification, DispatchedNotification } from '@/types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, dispatches, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useStoreData();
  const [activeTab, setActiveTab] = useState<'IN_APP' | 'SIMULATED_CHANNELS'>('IN_APP');
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'EMAIL' | 'SMS' | 'WHATSAPP'>('ALL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-espresso-950/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-earth-card border-l border-earth-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-earth-card-soft border-b border-earth-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage-500/15 border border-sage-500/30 flex items-center justify-center text-sage-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-earth-text text-base">Notifications & Dispatch Center</h3>
                <p className="text-xs text-earth-muted">Multi-channel event delivery pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead()}
                  className="text-xs text-sage-600 hover:text-sage-700 font-medium px-2 py-1 rounded bg-sage-50 hover:bg-sage-100 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-earth-muted hover:text-earth-text hover:bg-earth-border/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Demo Mode Notice Banner */}
          <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>DEMO NOTIFICATION MODE ACTIVE</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 border border-amber-300">
              Safe Simulated
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="p-3 bg-earth-card border-b border-earth-border flex gap-2">
            <button
              onClick={() => setActiveTab('IN_APP')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'IN_APP'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-earth-card-soft text-earth-muted hover:text-earth-text border border-earth-border'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>In-App Alerts ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('SIMULATED_CHANNELS')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'SIMULATED_CHANNELS'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-earth-card-soft text-earth-muted hover:text-earth-text border border-earth-border'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Omnichannel Logs ({dispatches.length})</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'IN_APP' ? (
              notifications.length === 0 ? (
                <div className="text-center py-12 text-earth-muted text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No in-app notifications yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-earth-card-soft/60 border-earth-border text-earth-muted opacity-80'
                        : 'bg-earth-card border-sage-500/40 shadow-sm text-earth-text'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notif.type.includes('APPROVED') ? (
                          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                        ) : notif.type.includes('OUT') || notif.type.includes('ESCALATED') ? (
                          <AlertTriangle className="w-4 h-4 text-terracotta-600 shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-sage-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-earth-text">{notif.title}</h4>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-sage-500 shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-earth-muted mt-1.5 leading-relaxed">{notif.message}</p>

                    <div className="mt-2.5 pt-2 border-t border-earth-border/60 flex items-center justify-between text-[10px] text-earth-muted">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.referenceId && (
                        <span className="font-mono font-bold bg-earth-border/50 px-1.5 py-0.5 rounded text-earth-text">
                          {notif.referenceId}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              // Omnichannel Simulated Dispatch Logs
              <div className="space-y-4">
                {/* Channel Filter */}
                <div className="flex gap-1.5 pb-1">
                  {(['ALL', 'EMAIL', 'SMS', 'WHATSAPP'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
                        selectedChannel === ch
                          ? 'bg-earth-text text-white border-earth-text'
                          : 'bg-earth-card-soft text-earth-muted border-earth-border hover:text-earth-text'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                {dispatches.length === 0 ? (
                  <div className="text-center py-12 text-earth-muted text-xs">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No omnichannel dispatches generated yet.</p>
                  </div>
                ) : (
                  dispatches.map((disp) => (
                    <div
                      key={disp.id}
                      className="bg-earth-card border border-earth-border rounded-xl p-3.5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-earth-text">{disp.title}</span>
                        <span className="text-[10px] font-mono bg-sage-50 text-sage-700 border border-sage-200 px-1.5 py-0.5 rounded font-bold">
                          {disp.referenceId || 'LOGGED'}
                        </span>
                      </div>

                      {/* Email preview */}
                      {(selectedChannel === 'ALL' || selectedChannel === 'EMAIL') && (
                        <div className="bg-earth-card-soft border border-earth-border rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-earth-text flex items-center gap-1">
                              <Mail className="w-3 h-3 text-sage-600" /> Email Notification
                            </span>
                            <span className="text-[10px] text-amber-700 font-medium bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                              Simulated / Demo
                            </span>
                          </div>
                          <div className="text-[11px] text-earth-muted">To: {disp.channels.email.recipient}</div>
                          <div className="text-[11px] font-medium text-earth-text">Subj: {disp.channels.email.subject}</div>
                          <p className="text-[10px] text-earth-muted border-t border-earth-border/60 pt-1 mt-1 whitespace-pre-line">
                            {disp.channels.email.body}
                          </p>
                        </div>
                      )}

                      {/* SMS preview */}
                      {(selectedChannel === 'ALL' || selectedChannel === 'SMS') && (
                        <div className="bg-earth-card-soft border border-earth-border rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-earth-text flex items-center gap-1">
                              <Phone className="w-3 h-3 text-terracotta-600" /> SMS Notification
                            </span>
                            <span className="text-[10px] text-amber-700 font-medium bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                              Simulated / Demo
                            </span>
                          </div>
                          <div className="text-[11px] text-earth-muted">Phone: {disp.channels.sms.phoneNumber}</div>
                          <p className="text-[10px] text-earth-text bg-white p-2 rounded border border-earth-border font-mono">
                            {disp.channels.sms.message}
                          </p>
                        </div>
                      )}

                      {/* WhatsApp preview */}
                      {(selectedChannel === 'ALL' || selectedChannel === 'WHATSAPP') && (
                        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-900 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Message
                            </span>
                            <span className="text-[10px] text-emerald-800 font-medium bg-emerald-200/60 px-1.5 py-0.2 rounded border border-emerald-300">
                              Simulated / Demo
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800">To: {disp.channels.whatsapp.recipient}</div>
                          <p className="text-[10px] text-emerald-950 bg-white p-2 rounded border border-emerald-200 whitespace-pre-line">
                            {disp.channels.whatsapp.message}
                          </p>
                        </div>
                      )}

                      <div className="text-[10px] text-earth-muted text-right">
                        Dispatched: {new Date(disp.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-earth-card-soft border-t border-earth-border text-center text-[11px] text-earth-muted">
            Demonstrating unified multi-channel notifications for retail returns, escalations & stock alerts.
          </div>
        </div>
      </div>
    </div>
  );
};
