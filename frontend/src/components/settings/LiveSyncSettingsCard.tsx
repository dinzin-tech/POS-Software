'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface LiveSyncConfig {
  enabled: boolean;
  syncUrl: string;
  apiKey: string;
  intervalSeconds: number;
  lastSyncedAt: string | null;
  lastStatus: 'idle' | 'success' | 'error';
  lastError: string | null;
}

export function LiveSyncSettingsCard() {
  const [enabled, setEnabled] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Load initial configuration
  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      try {
        const { data } = await api.get('/live-sync/config');
        if (mounted && data?.config) {
          const cfg: LiveSyncConfig = data.config;
          setEnabled(Boolean(cfg.enabled));
          setSyncUrl(cfg.syncUrl || '');
          setApiKey(cfg.apiKey || '');
          setIntervalSeconds(cfg.intervalSeconds || 30);
          setLastSyncedAt(cfg.lastSyncedAt || null);
          setLastStatus(cfg.lastStatus || 'idle');
          setLastError(cfg.lastError || null);
        }
      } catch (err) {
        console.warn('[LiveSyncSettings] Failed to load config:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const generateRandomKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'dinzin_live_';
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(key);
    toast.success('Generated new secret API Key. Make sure to save and update config.php!');
  };

  const handleTestConnection = async () => {
    if (!syncUrl.trim()) {
      toast.error('Please enter the Sync URL first');
      return;
    }
    if (!apiKey.trim()) {
      toast.error('Please enter the API Key first');
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await api.post('/live-sync/test', {
        syncUrl: syncUrl.trim(),
        apiKey: apiKey.trim(),
      });
      if (data?.ok) {
        setTestResult({ ok: true, message: data.message || 'Connected to shared host successfully!' });
        toast.success('Connection verified!');
      } else {
        setTestResult({ ok: false, message: data?.message || data?.error || 'Connection failed' });
        toast.error(data?.message || data?.error || 'Connection failed');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr.response?.data?.error || axiosErr.message || 'Failed to reach shared host endpoint';
      setTestResult({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/live-sync/config', {
        enabled,
        syncUrl: syncUrl.trim(),
        apiKey: apiKey.trim(),
        intervalSeconds: Number(intervalSeconds),
      });

      if (data?.ok) {
        toast.success('Live sync settings saved');
        if (data.config) {
          setLastSyncedAt(data.config.lastSyncedAt);
          setLastStatus(data.config.lastStatus);
          setLastError(data.config.lastError);
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(axiosErr.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    if (!syncUrl.trim() || !apiKey.trim()) {
      toast.error('Please configure and save Sync URL and API Key first');
      return;
    }

    setSyncingNow(true);
    try {
      const { data } = await api.post('/live-sync/sync-now', {});
      if (data?.ok) {
        toast.success('Live data pushed successfully!');
        if (data.config) {
          setLastSyncedAt(data.config.lastSyncedAt);
          setLastStatus(data.config.lastStatus);
          setLastError(data.config.lastError);
        }
      } else {
        toast.error(data?.message || 'Sync failed');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(axiosErr.response?.data?.error || 'Sync request failed');
    } finally {
      setSyncingNow(false);
    }
  };

  const formatLastSyncTime = (iso: string | null) => {
    if (!iso) return 'Never';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Loading Live Sync settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground text-base">
                Live Mobile Sync (Shared Hosting)
              </h2>
              {enabled && (
                <Badge
                  variant={lastStatus === 'success' ? 'default' : lastStatus === 'error' ? 'destructive' : 'secondary'}
                  className="text-[11px]"
                >
                  {lastStatus === 'success' ? 'Online' : lastStatus === 'error' ? 'Sync Error' : 'Idle'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Push real-time sales, active kitchen orders, and delivery statuses to your cPanel / PHP mobile dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs h-8 gap-1.5"
          >
            <HelpCircle size={14} />
            {showGuide ? 'Hide Setup Guide' : 'Setup Guide'}
          </Button>
        </div>
      </div>

      {/* Setup Guide Accordion */}
      {showGuide && (
        <div className="bg-muted/70 rounded-xl p-4 border border-border text-xs space-y-3">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>🚀 Quick 3-Step Setup for Shared Hosting (cPanel / Hostinger / GoDaddy)</span>
          </div>
          <ol className="list-decimal pl-4 space-y-2 text-muted-foreground">
            <li>
              <strong>Upload the Folder:</strong> Locate the <code className="text-foreground bg-background px-1.5 py-0.5 rounded border border-border">sharedhost-mobile</code> folder in your DinZin repository and upload its contents to your shared host (e.g. <code className="text-foreground bg-background px-1.5 py-0.5 rounded border border-border">public_html/dashboard</code>).
            </li>
            <li>
              <strong>Set Folder Permissions:</strong> Make sure the <code className="text-foreground bg-background px-1.5 py-0.5 rounded border border-border">data/</code> directory on your host is writable (<code className="text-foreground">chmod 755</code> or <code className="text-foreground">777</code>).
            </li>
            <li>
              <strong>Configure API Key:</strong> In <code className="text-foreground bg-background px-1.5 py-0.5 rounded border border-border">config.php</code> on your host, set <code className="text-foreground">api_key</code> to match the API Key configured below.
            </li>
            <li>
              <strong>Open on Mobile:</strong> Visit <code className="text-brand">https://yourdomain.com/dashboard/</code> on your mobile browser and add it to your home screen!
            </li>
          </ol>
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Enable Live Mobile Sync</p>
          <p className="text-xs text-muted-foreground">
            Automatically sends live data updates upon order creation, status change, and bill settlement.
          </p>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5 accent-brand rounded cursor-pointer"
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Sync URL */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Globe size={14} className="text-muted-foreground" />
            Shared Host Sync URL
          </Label>
          <Input
            value={syncUrl}
            onChange={(e) => setSyncUrl(e.target.value)}
            placeholder="https://yourdomain.com/dashboard/sync.php"
            className="text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            The full HTTPS URL pointing to <code className="text-foreground">sync.php</code> on your live server.
          </p>
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Key size={14} className="text-muted-foreground" />
              API Secret Key
            </Label>
            <button
              type="button"
              onClick={generateRandomKey}
              className="text-[11px] text-brand hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} />
              Generate Random Key
            </button>
          </div>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. dinzin_live_secret_key_8839"
              className="pr-10 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Must match the <code className="text-foreground">api_key</code> in <code className="text-foreground">config.php</code> on your shared host.
          </p>
        </div>

        {/* Sync Heartbeat Interval */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Background Refresh Interval
          </Label>
          <div className="flex gap-2">
            {[15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setIntervalSeconds(sec)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  intervalSeconds === sec
                    ? 'bg-brand text-white border-brand font-semibold shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Periodic heartbeat frequency to refresh clock, table occupancy, and time counters. Real-time order events push immediately.
          </p>
        </div>
      </div>

      {/* Test Connection Banner */}
      {testResult && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            testResult.ok
              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-destructive" />
          )}
          <div>
            <p className="font-semibold">{testResult.ok ? 'Connection Verified' : 'Connection Failed'}</p>
            <p className="mt-0.5 opacity-90">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="bg-muted/40 rounded-xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Last Successful Sync: </span>
          <strong className="text-foreground">{formatLastSyncTime(lastSyncedAt)}</strong>
          {lastError && (
            <p className="text-destructive mt-1">Error: {lastError}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={syncingNow || !syncUrl.trim() || !apiKey.trim()}
            className="text-xs h-8 gap-1.5"
          >
            <Send size={13} className={syncingNow ? 'animate-pulse' : ''} />
            {syncingNow ? 'Pushing...' : 'Sync Now'}
          </Button>

          {syncUrl && (
            <a
              href={syncUrl.replace(/\/sync\.php.*$/, '')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background"
            >
              <ExternalLink size={13} />
              Open Dashboard
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={testing || !syncUrl.trim() || !apiKey.trim()}
          className="text-xs"
        >
          <RefreshCw size={14} className={`mr-1.5 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white hover:opacity-90 text-xs"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
