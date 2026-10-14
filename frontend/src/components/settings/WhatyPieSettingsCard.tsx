'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Key,
  Globe,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePosSettingsStore } from '@/store/pos-settings';

export interface WhatyPieConfig {
  enabled: boolean;
  provider: 'whatypie' | 'baileys';
  apiUrl: string;
  apiKey: string;
  senderPhone: string;
  sendOnBill: boolean;
  sendOnOrderStatus: boolean;
  templateOrderStatus: string;
  templateBill: string;
}

export function WhatyPieSettingsCard() {
  const [provider, setProvider] = useState<'whatypie' | 'baileys'>('whatypie');
  const [enabled, setEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://api.whatypie.in');
  const [apiKey, setApiKey] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [sendOnBill, setSendOnBill] = useState(true);
  const [sendOnOrderStatus, setSendOnOrderStatus] = useState(true);
  const [templateOrderStatus, setTemplateOrderStatus] = useState('');
  const [templateBill, setTemplateBill] = useState('');

  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<{ id: string; display_phone_number: string; is_primary?: boolean }[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<{ name: string; language: string; category: string; status: string }[]>([]);

  const fetchAvailableNumbers = async () => {
    try {
      const { data } = await api.get('/whatsapp/whatypie/phone-numbers');
      if (data?.numbers && Array.isArray(data.numbers)) {
        setPhoneNumbers(data.numbers);
      }
    } catch {
      // ignore
    }
  };

  const fetchAvailableTemplates = async () => {
    try {
      const { data } = await api.get('/whatsapp/whatypie/templates');
      if (data?.templates && Array.isArray(data.templates)) {
        setAvailableTemplates(data.templates.filter((t: { status: string }) => t.status === 'approved'));
      }
    } catch {
      // ignore
    }
  };

  // Fetch initial configuration
  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      try {
        const { data } = await api.get('/whatsapp/whatypie/config');
        if (mounted && data?.config) {
          const cfg: WhatyPieConfig = data.config;
          setProvider(cfg.provider || 'whatypie');
          setEnabled(Boolean(cfg.enabled));
          setApiUrl(cfg.apiUrl || 'https://api.whatypie.in');
          setApiKey(cfg.apiKey || '');
          setSenderPhone(cfg.senderPhone || '');
          setSendOnBill(cfg.sendOnBill !== false);
          setSendOnOrderStatus(cfg.sendOnOrderStatus !== false);
          setTemplateOrderStatus(cfg.templateOrderStatus || '');
          setTemplateBill(cfg.templateBill || '');
        }
        await fetchAvailableNumbers();
        await fetchAvailableTemplates();
      } catch (err) {
        console.warn('[WhatyPieSettings] Failed to load config:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your WhatyPie API Key first');
      return;
    }
    setTesting(true);
    setTestStatus(null);
    try {
      const { data } = await api.post('/whatsapp/whatypie/test', {
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
      });
      if (data?.ok) {
        setTestStatus({ ok: true, message: data.message || 'Connected to WhatyPie successfully!' });
        toast.success('Connection verified!');
        await fetchAvailableNumbers();
        await fetchAvailableTemplates();
      } else {
        setTestStatus({ ok: false, message: data?.error || 'Connection failed' });
        toast.error(data?.error || 'Connection failed');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr.response?.data?.error || axiosErr.message || 'Failed to reach WhatyPie endpoint';
      setTestStatus({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/whatsapp/whatypie/config', {
        provider,
        enabled,
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        senderPhone: senderPhone.trim(),
        sendOnBill,
        sendOnOrderStatus,
        templateOrderStatus: templateOrderStatus.trim(),
        templateBill: templateBill.trim(),
      });
      if (enabled) {
        usePosSettingsStore.getState().setWhatsappEnabled(true);
      }
      toast.success('WhatyPie settings saved successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(axiosErr.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          <span>Loading WhatsApp settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Selector */}
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="size-5 text-emerald-500" />
              WhatsApp Integration Provider
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how DinZin POS sends WhatsApp receipts, invoices, and real-time order updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* WhatyPie Card */}
            <div
              onClick={() => setProvider('whatypie')}
              className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                provider === 'whatypie'
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      WhatyPie (Official Meta API)
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Recommended
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      DinZin Official WhatsApp Cloud CRM
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="provider"
                  checked={provider === 'whatypie'}
                  onChange={() => setProvider('whatypie')}
                  className="size-4 accent-emerald-500 mt-1"
                />
              </div>
              <ul className="mt-3.5 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Zero ban risk (Official Meta WhatsApp Business API)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>No phone pairing or battery drain; 99.9% cloud uptime</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Automated order status tracking & PDF receipts</span>
                </li>
              </ul>
            </div>

            {/* Baileys QR Card */}
            <div
              onClick={() => setProvider('baileys')}
              className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                provider === 'baileys'
                  ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <QrCode className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      QR Code (WhatsApp Web Session)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pair with physical phone
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="provider"
                  checked={provider === 'baileys'}
                  onChange={() => setProvider('baileys')}
                  className="size-4 accent-brand mt-1"
                />
              </div>
              <ul className="mt-3.5 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-brand shrink-0" />
                  <span>Connects via QR scan on your WhatsApp mobile app</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                  <span>Requires phone to maintain active internet session</span>
                </li>
              </ul>
              {provider === 'baileys' && (
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/whatsapp">Open QR Pairing Screen →</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatyPie Configuration Panel */}
      {provider === 'whatypie' && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-500" />
                  WhatyPie Connection & API Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Connect your WhatyPie account endpoint to send automated messages.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-medium text-foreground">Enable WhatyPie</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="size-4.5 accent-emerald-500"
                />
              </label>
            </div>

            {/* API Endpoint Input */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                <Globe className="size-3.5 text-muted-foreground" />
                WhatyPie API Base URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.whatypie.in"
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                <span>Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setApiUrl('https://api.whatypie.in')}
                  className="underline hover:text-foreground"
                >
                  WhatyPie Cloud
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setApiUrl('http://localhost:5000')}
                  className="underline hover:text-foreground"
                >
                  Local API (:5000)
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                <Key className="size-3.5 text-muted-foreground" />
                WhatyPie API Key
              </Label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your WhatyPie API Key (from Settings → API Keys)"
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                You can generate or copy your API key from the WhatyPie dashboard under <em>Settings → API Keys</em>.
              </p>
            </div>

            {/* Sender Phone (Optional) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                <Phone className="size-3.5 text-muted-foreground" />
                Sender WhatsApp Business Number (Optional)
              </Label>
              <Input
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="e.g. 919876543210 (Leave blank to use primary number configured in WhatyPie)"
                className="font-mono text-xs"
              />
              {phoneNumbers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground mr-1">Connected in WhatyPie:</span>
                  {phoneNumbers.map((p) => {
                    const cleanP = p.display_phone_number.replace(/\D/g, '');
                    const isSelected = senderPhone.replace(/\D/g, '') === cleanP || (!senderPhone && Boolean(p.is_primary));
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSenderPhone(cleanP)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                            : 'border-border bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        }`}
                      >
                        {p.display_phone_number}
                        {p.is_primary && <span className="text-[10px] opacity-75">(Primary)</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Automation Triggers */}
            <div className="pt-2 space-y-3">
              <Label className="text-xs font-medium text-foreground">Automated Notification Triggers</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendOnBill}
                    onChange={(e) => setSendOnBill(e.target.checked)}
                    className="mt-0.5 size-4 accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Receipt className="size-3.5 text-emerald-500" />
                      Auto-send Bill Receipts
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Instantly sends a formatted invoice receipt to the customer on POS checkout/payment.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendOnOrderStatus}
                    onChange={(e) => setSendOnOrderStatus(e.target.checked)}
                    className="mt-0.5 size-4 accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <UtensilsCrossed className="size-3.5 text-amber-500" />
                      Order Status Updates
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sends real-time updates when an order is Placed, Preparing in Kitchen, and Ready for Pickup.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Optional WABA Template Names */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">
                  Custom Meta Templates (Optional)
                </Label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Recommended: Leave blank for rich formatted text
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Leave these empty to automatically send complete messages with emojis, itemized order details, and totals. Only specify a template name if you have created and approved a custom template in Meta WhatsApp Manager.
              </p>

              {/* Meta 24-Hour Policy Notice */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Meta Official WhatsApp 24-Hour Policy
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  • <strong>Within 24 Hours:</strong> If a customer previously messaged your business number, full rich text messages (items, totals, emojis) deliver instantly without requiring any template.
                  <br />
                  • <strong>Outside 24 Hours:</strong> Meta requires an approved Template to initiate contact. If sending to new customers outside 24h, select an approved template below or have them text your number.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Order Status Template</span>
                    {templateOrderStatus && (
                      <button
                        type="button"
                        onClick={() => setTemplateOrderStatus('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                      >
                        Clear (Use Rich Text)
                      </button>
                    )}
                  </div>
                  {availableTemplates.length > 0 ? (
                    <select
                      value={templateOrderStatus}
                      onChange={(e) => setTemplateOrderStatus(e.target.value)}
                      className="w-full text-xs font-mono h-9 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">None (Rich Formatted Text Message)</option>
                      {availableTemplates.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} ({t.language}) [{t.category}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={templateOrderStatus}
                      onChange={(e) => setTemplateOrderStatus(e.target.value)}
                      placeholder="Leave empty for instant rich text"
                      className="text-xs font-mono"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Bill Receipt Template</span>
                    {templateBill && (
                      <button
                        type="button"
                        onClick={() => setTemplateBill('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                      >
                        Clear (Use Rich Text)
                      </button>
                    )}
                  </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetchAvailableTemplates();
                        toast.success('Templates refreshed');
                      }}
                      className="ml-2 text-[10px] text-emerald-600 hover:underline cursor-pointer"
                    >
                      Refresh
                    </button>
                  {availableTemplates.length > 0 ? (
                    <select
                      value={templateBill}
                      onChange={(e) => setTemplateBill(e.target.value)}
                      className="w-full text-xs font-mono h-9 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">None (Rich Formatted Text Message)</option>
                      {availableTemplates.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} ({t.language}) [{t.category}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={templateBill}
                      onChange={(e) => setTemplateBill(e.target.value)}
                      placeholder="Leave empty for instant rich text"
                      className="text-xs font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Test Connection Result Box */}
            {testStatus && (
              <div
                className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                  testStatus.ok
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}
              >
                {testStatus.ok ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-destructive" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || !apiKey}
                className="gap-2 text-xs"
              >
                {testing ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
              >
                {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                {saving ? 'Saving...' : 'Save WhatyPie Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
