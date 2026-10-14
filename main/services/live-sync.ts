import {
  dayBoundsInTimezone,
  getDatabase,
  getSettingValue,
  localDateInTimezone,
  parseDbTimestamp,
  tenantBusinessDayStartTime,
  upsertSettings,
} from '../db';
import { getTenantCurrency } from './refund';
import { getCurrencyMinorUnitFactor, resolveRegionalSnapshot } from '../countries';
import { paymentMethodBreakdown } from '../routes/cash-closures';

export interface LiveSyncConfig {
  enabled: boolean;
  syncUrl: string;
  apiKey: string;
  intervalSeconds: number;
  lastSyncedAt: string | null;
  lastStatus: 'idle' | 'success' | 'error';
  lastError: string | null;
}

let syncTimer: NodeJS.Timeout | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
let isPushing = false;

/** Retrieve current Live Sync configuration from settings */
export function getLiveSyncConfig(): LiveSyncConfig {
  const enabled = getSettingValue('live_sync_enabled') === 'true';
  const syncUrl = (getSettingValue('live_sync_url') || '').trim();
  const apiKey = (getSettingValue('live_sync_key') || '').trim();
  const intervalSeconds = parseInt(getSettingValue('live_sync_interval') || '30', 10) || 30;
  const lastSyncedAt = getSettingValue('live_sync_last_at') || null;
  const lastStatus = (getSettingValue('live_sync_last_status') || 'idle') as 'idle' | 'success' | 'error';
  const lastError = getSettingValue('live_sync_last_error') || null;

  return {
    enabled,
    syncUrl,
    apiKey,
    intervalSeconds,
    lastSyncedAt,
    lastStatus,
    lastError,
  };
}

/** Update Live Sync configuration */
export function updateLiveSyncConfig(patch: Partial<LiveSyncConfig>): LiveSyncConfig {
  const entries: Record<string, string> = {};

  if (patch.enabled !== undefined) {
    entries.live_sync_enabled = patch.enabled ? 'true' : 'false';
  }
  if (patch.syncUrl !== undefined) {
    entries.live_sync_url = patch.syncUrl.trim();
  }
  if (patch.apiKey !== undefined) {
    entries.live_sync_key = patch.apiKey.trim();
  }
  if (patch.intervalSeconds !== undefined) {
    entries.live_sync_interval = String(patch.intervalSeconds);
  }

  if (Object.keys(entries).length > 0) {
    upsertSettings(entries);
  }

  // Restart timer if running
  restartLiveSyncTimer();

  return getLiveSyncConfig();
}

/** Helper: resolve tenant timezone */
function resolveStoreTimezone(): string {
  try {
    return resolveRegionalSnapshot({
      country: getSettingValue('country') ?? undefined,
      currency: getSettingValue('currency') ?? undefined,
      timezone: getSettingValue('timezone') ?? undefined,
    }).timezone;
  } catch {
    return 'Asia/Kolkata';
  }
}

/** Helper: resolve currency symbol */
function resolveStoreCurrencySymbol(): string {
  try {
    return resolveRegionalSnapshot({
      country: getSettingValue('country') ?? undefined,
      currency: getSettingValue('currency') ?? undefined,
      timezone: getSettingValue('timezone') ?? undefined,
    }).currencySymbol || '₹';
  } catch {
    return '₹';
  }
}

/** Build full live snapshot payload to push to shared hosting */
export function buildLiveSyncPayload(): Record<string, unknown> {
  const db = getDatabase();
  const timezone = resolveStoreTimezone();
  const startTime = tenantBusinessDayStartTime();
  const today = localDateInTimezone(new Date(), timezone, startTime);
  const [dayStart, dayEnd] = dayBoundsInTimezone(today, timezone, startTime);

  // Time horizons: Yesterday, Last 7 Days, Month to Date
  const yesterdayDate = new Date(parseDbTimestamp(dayStart).getTime() - 12 * 3600 * 1000);
  const yesterdayStr = localDateInTimezone(yesterdayDate, timezone, startTime);
  const [yesterdayStart, yesterdayEnd] = dayBoundsInTimezone(yesterdayStr, timezone, startTime);

  const weekStartDate = new Date(parseDbTimestamp(dayStart).getTime() - 6 * 86400 * 1000);
  const weekStartStr = localDateInTimezone(weekStartDate, timezone, startTime);
  const [weekStart] = dayBoundsInTimezone(weekStartStr, timezone, startTime);

  const monthStartStr = `${today.slice(0, 7)}-01`;
  const [monthStart] = dayBoundsInTimezone(monthStartStr, timezone, startTime);

  const tenantCurrency = getTenantCurrency(db);
  const minorFactor = getCurrencyMinorUnitFactor(tenantCurrency);
  const currencySymbol = resolveStoreCurrencySymbol();

  function queryRangeSales(start: string, end: string) {
    const row = db.prepare(`
      SELECT
        COALESCE((SELECT SUM(paid_amount) FROM bills WHERE paid_at >= ? AND paid_at < ?), 0) AS gross_sales,
        COALESCE((SELECT SUM(CAST(amount_cents AS REAL)) / ? FROM refunds WHERE created_at >= ? AND created_at < ?), 0) AS refunds,
        COALESCE((SELECT SUM(discount_amount) FROM bills WHERE paid_at >= ? AND paid_at < ?), 0) AS discounts,
        COALESCE((SELECT SUM(tax_amount) FROM bills WHERE paid_at >= ? AND paid_at < ?), 0) AS taxes,
        (SELECT COUNT(*) FROM bills WHERE paid_at >= ? AND paid_at < ?) AS bill_count,
        (SELECT COUNT(*) FROM bills WHERE discount_amount > 0 AND paid_at >= ? AND paid_at < ?) AS discount_bills_count
    `).get(start, end, minorFactor, start, end, start, end, start, end, start, end, start, end) as {
      gross_sales: number; refunds: number; discounts: number; taxes: number;
      bill_count: number; discount_bills_count: number;
    };

    const gross = Number(row?.gross_sales || 0);
    const refunds = Number(row?.refunds || 0);
    const net = Math.max(0, gross - refunds);
    const count = Number(row?.bill_count || 0);
    const discounts = Number(row?.discounts || 0);
    const taxes = Number(row?.taxes || 0);
    const discountBillsCount = Number(row?.discount_bills_count || 0);
    const avg = count > 0 ? Math.round((net / count) * 100) / 100 : 0;

    return {
      gross_sales: Math.round(gross * 100) / 100,
      refunds: Math.round(refunds * 100) / 100,
      net_sales: Math.round(net * 100) / 100,
      discounts: Math.round(discounts * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      bill_count: count,
      avg_bill: avg,
      discount_bills_count: discountBillsCount,
    };
  }

  const todayMetrics = queryRangeSales(dayStart, dayEnd);
  const yesterdayMetrics = queryRangeSales(yesterdayStart, yesterdayEnd);
  const weekMetrics = queryRangeSales(weekStart, dayEnd);
  const monthMetrics = queryRangeSales(monthStart, dayEnd);

  // Growth vs yesterday
  const diffVsYesterday = todayMetrics.net_sales - yesterdayMetrics.net_sales;
  const pctVsYesterday = yesterdayMetrics.net_sales > 0
    ? Math.round((diffVsYesterday / yesterdayMetrics.net_sales) * 1000) / 10
    : null;

  // Items sold & Void items count
  const itemsCountRow = db.prepare(`
    SELECT COALESCE(SUM(oi.quantity), 0) as items_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ? AND o.created_at < ? AND oi.status != 'cancelled'
  `).get(dayStart, dayEnd) as { items_sold: number };

  const voidItemsRow = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(oi.total), 0) as total
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ? AND o.created_at < ? AND oi.status = 'cancelled'
  `).get(dayStart, dayEnd) as { count: number; total: number };

  // Tables Occupancy
  const tablesRow = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM tables WHERE status = 'occupied') as occupied_count,
      (SELECT COUNT(*) FROM tables) as total_count
  `).get() as { occupied_count: number; total_count: number };

  // Active Orders (Only today's business day, or recent active deliveries)
  const activeOrdersRows = db.prepare(`
    SELECT
      o.id,
      o.order_number,
      o.status,
      o.type,
      o.total,
      o.created_at,
      c.name as customer_name,
      c.phone as customer_phone,
      c.address as customer_address,
      t.number as table_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN tables t ON o.table_id = t.id
    WHERE o.status NOT IN ('completed', 'cancelled')
      AND (o.created_at >= ? OR (o.type = 'delivery' AND o.created_at >= datetime('now', '-24 hours')))
    ORDER BY o.created_at DESC
    LIMIT 40
  `).all(dayStart) as {
    id: number; order_number: string; status: string; type: string; total: number;
    created_at: string; customer_name: string | null; customer_phone: string | null;
    customer_address: string | null; table_name: string | null;
  }[];

  const activeOrders = activeOrdersRows.map((o) => {
    const items = db.prepare(`
      SELECT product_name as name, quantity, unit_price as price
      FROM order_items
      WHERE order_id = ? AND status != 'cancelled'
    `).all(o.id) as { name: string; quantity: number; price: number }[];

    return {
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      type: o.type,
      total: o.total,
      created_at: o.created_at,
      customer_name: o.customer_name || 'Walk-in Customer',
      customer_phone: o.customer_phone || '',
      delivery_address: o.customer_address || '',
      table_name: o.table_name || '',
      items,
    };
  });

  // Payment Methods Breakdown
  const paymentMethods = paymentMethodBreakdown(db, { startDate: today }) as {
    name?: string; method?: string; payment_method?: string; count: number; total: number;
  }[];

  // Order Channels Breakdown
  const orderChannelsRows = db.prepare(`
    SELECT type, COUNT(*) as count, COALESCE(SUM(total), 0) as total
    FROM orders
    WHERE created_at >= ? AND created_at < ? AND status != 'cancelled'
    GROUP BY type
  `).all(dayStart, dayEnd) as { type: string; count: number; total: number }[];

  // Top Items Sold Today
  const topItemsRows = db.prepare(`
    SELECT
      oi.product_name as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.total) as total
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ? AND o.created_at < ? AND oi.status != 'cancelled'
    GROUP BY oi.product_name
    ORDER BY quantity DESC
    LIMIT 12
  `).all(dayStart, dayEnd) as { name: string; quantity: number; total: number }[];

  // Categories Breakdown Today
  const categoriesRows = db.prepare(`
    SELECT
      COALESCE(c.name, 'Other') as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.total) as total
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE o.created_at >= ? AND o.created_at < ? AND oi.status != 'cancelled'
    GROUP BY c.id, c.name
    ORDER BY total DESC
    LIMIT 10
  `).all(dayStart, dayEnd) as { name: string; quantity: number; total: number }[];

  const totalCatSales = categoriesRows.reduce((sum, c) => sum + Number(c.total || 0), 0) || 1;

  // Staff Performance Today
  const staffRows = db.prepare(`
    SELECT
      COALESCE(u.name, 'Cashier') as name,
      COALESCE(u.role, 'staff') as role,
      COUNT(b.id) as bill_count,
      COALESCE(SUM(b.paid_amount), 0) as total
    FROM bills b
    LEFT JOIN orders o ON b.order_id = o.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE b.paid_at >= ? AND b.paid_at < ?
    GROUP BY u.id, u.name, u.role
    ORDER BY total DESC
    LIMIT 8
  `).all(dayStart, dayEnd) as { name: string; role: string; bill_count: number; total: number }[];

  // Recent Settled Bills (Last 20) with itemized items
  const recentBillsRows = db.prepare(`
    SELECT
      b.id,
      b.bill_number,
      b.order_id,
      b.subtotal,
      b.tax_amount,
      b.discount_amount,
      b.paid_amount,
      b.payment_details,
      b.paid_at,
      b.created_at,
      c.name as customer_name,
      c.phone as customer_phone
    FROM bills b
    LEFT JOIN customers c ON b.customer_id = c.id
    WHERE b.payment_status = 'paid'
    ORDER BY b.paid_at DESC
    LIMIT 20
  `).all() as {
    id: number; bill_number: string; order_id: number | null; subtotal: number;
    tax_amount: number; discount_amount: number; paid_amount: number;
    payment_details: string | null; paid_at: string; created_at: string;
    customer_name: string | null; customer_phone: string | null;
  }[];

  const getBillItemsStmt = db.prepare(`
    SELECT product_name as name, quantity, unit_price as price, total
    FROM order_items
    WHERE order_id = ? AND status != 'cancelled'
  `);

  const recentBills = recentBillsRows.map((b) => {
    let method = 'Cash';
    try {
      const details = JSON.parse(b.payment_details || '[]');
      if (Array.isArray(details) && details.length > 0) {
        const methods = details
          .map((d: { method?: string; payment_method?: string }) => {
            const raw = (d.method || d.payment_method || 'Cash').trim();
            const lower = raw.toLowerCase();
            if (lower === 'upi') return 'UPI';
            if (lower === 'cash') return 'Cash';
            if (lower === 'card') return 'Card';
            if (lower === 'wallet') return 'Wallet';
            if (lower === 'netbanking') return 'Net Banking';
            return raw.charAt(0).toUpperCase() + raw.slice(1);
          })
          .filter(Boolean);
        if (methods.length > 0) {
          method = Array.from(new Set(methods)).join(', ');
        }
      }
    } catch {
      // ignore
    }
    const items = b.order_id ? getBillItemsStmt.all(b.order_id) as { name: string; quantity: number; price: number; total: number }[] : [];
    const itemsSummary = items.map((it) => `${it.quantity}x ${it.name}`).join(', ');

    return {
      id: b.id,
      bill_number: b.bill_number,
      paid_amount: b.paid_amount,
      subtotal: b.subtotal ?? b.paid_amount,
      tax_amount: b.tax_amount || 0,
      discount_amount: b.discount_amount || 0,
      payment_method: method,
      paid_at: b.paid_at,
      customer_name: b.customer_name || 'Walk-in Customer',
      customer_phone: b.customer_phone || '',
      items_summary: itemsSummary,
      items,
    };
  });

  // Hourly Sales Buckets (00 to 23)
  const hourlySalesMap: { [hour: number]: { total: number; count: number } } = {};
  for (let h = 0; h < 24; h++) hourlySalesMap[h] = { total: 0, count: 0 };

  const billsHourly = db.prepare(`
    SELECT paid_amount, paid_at
    FROM bills
    WHERE paid_at >= ? AND paid_at < ?
  `).all(dayStart, dayEnd) as { paid_amount: number; paid_at: string }[];

  const hourFmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hourCycle: 'h23' });
  for (const b of billsHourly) {
    const d = parseDbTimestamp(b.paid_at);
    if (!isNaN(d.getTime())) {
      const h = parseInt(hourFmt.format(d), 10);
      if (h >= 0 && h <= 23) {
        hourlySalesMap[h].total += (Number(b.paid_amount) || 0);
        hourlySalesMap[h].count += 1;
      }
    }
  }

  let peakHour = 0;
  let peakHourSales = 0;
  let peakHourBills = 0;

  const hourlySales = Object.keys(hourlySalesMap).map((h) => {
    const hr = parseInt(h, 10);
    const data = hourlySalesMap[hr];
    const total = Math.round(data.total * 100) / 100;
    if (total > peakHourSales) {
      peakHourSales = total;
      peakHour = hr;
      peakHourBills = data.count;
    }
    return {
      hour: hr,
      label: `${String(hr).padStart(2, '0')}:00`,
      total,
      count: data.count,
    };
  });

  const peakHourLabel = peakHourSales > 0
    ? `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 1) % 24).padStart(2, '0')}:00`
    : 'None yet';

  // Store metadata
  const storeName = getSettingValue('restaurant_name') || getSettingValue('business_name') || 'FloCafe Restaurant';
  const storeAddress = getSettingValue('address') || '';
  const storePhone = getSettingValue('phone') || '';

  return {
    status: 'active',
    synced_at: new Date().toISOString(),
    store: {
      name: storeName,
      currency: tenantCurrency,
      currency_symbol: currencySymbol,
      timezone,
      address: storeAddress,
      phone: storePhone,
    },
    today: {
      date: today,
      net_sales: todayMetrics.net_sales,
      gross_sales: todayMetrics.gross_sales,
      refunds: todayMetrics.refunds,
      discounts: todayMetrics.discounts,
      taxes: todayMetrics.taxes,
      bill_count: todayMetrics.bill_count,
      avg_bill: todayMetrics.avg_bill,
      items_sold_count: Number(itemsCountRow?.items_sold || 0),
      active_orders_count: activeOrders.length,
      occupied_tables_count: tablesRow?.occupied_count || 0,
      total_tables_count: tablesRow?.total_count || 0,
    },
    comparison: {
      yesterday: yesterdayMetrics,
      this_week: weekMetrics,
      this_month: monthMetrics,
      diff_vs_yesterday: Math.round(diffVsYesterday * 100) / 100,
      growth_pct: pctVsYesterday,
    },
    operations: {
      cancelled_items_count: Number(voidItemsRow?.count || 0),
      cancelled_items_total: Math.round(Number(voidItemsRow?.total || 0) * 100) / 100,
      discount_bills_count: todayMetrics.discount_bills_count,
      peak_hour: {
        hour: peakHour,
        label: peakHourLabel,
        sales: peakHourSales,
        bills: peakHourBills,
      },
    },
    categories: categoriesRows.map((c) => ({
      name: c.name,
      quantity: Number(c.quantity || 0),
      total: Math.round(Number(c.total || 0) * 100) / 100,
      pct: Math.round((Number(c.total || 0) / totalCatSales) * 1000) / 10,
    })),
    staff_sales: staffRows.map((s) => ({
      name: s.name,
      role: s.role,
      bills: Number(s.bill_count || 0),
      total: Math.round(Number(s.total || 0) * 100) / 100,
    })),
    active_orders: activeOrders,
    payment_methods: paymentMethods.map((m) => {
      const raw = (m.name || m.method || m.payment_method || 'Other').trim();
      let displayName = raw;
      const lower = raw.toLowerCase();
      if (lower === 'upi') displayName = 'UPI';
      else if (lower === 'cash') displayName = 'Cash';
      else if (lower === 'card') displayName = 'Card';
      else if (lower === 'wallet') displayName = 'Wallet';
      else if (lower === 'netbanking') displayName = 'Net Banking';
      else if (raw.length > 0) displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
      return {
        name: displayName,
        method: lower,
        count: Number(m.count || 0),
        total: Math.round(Number(m.total || 0) * 100) / 100,
      };
    }),
    order_types: orderChannelsRows.map((r) => ({
      type: r.type,
      count: r.count,
      total: Number(r.total || 0),
    })),
    top_items: topItemsRows.map((r) => ({
      name: r.name,
      quantity: r.quantity,
      total: Number(r.total || 0),
    })),
    recent_bills: recentBills,
    hourly_sales: hourlySales,
  };
}

/** Push live snapshot to shared hosting endpoint */
export async function pushLiveSync(options?: {
  force?: boolean;
  syncUrl?: string;
  apiKey?: string;
}): Promise<{ ok: boolean; message: string }> {
  const config = getLiveSyncConfig();
  const url = options?.syncUrl || config.syncUrl;
  const key = options?.apiKey || config.apiKey;

  if (!options?.force && (!config.enabled || !url || !key)) {
    return { ok: false, message: 'Live sync is not enabled or credentials missing' };
  }

  if (!url || !key) {
    return { ok: false, message: 'Sync URL and API Key are required' };
  }

  if (isPushing) {
    return { ok: true, message: 'Sync already in progress' };
  }

  isPushing = true;
  try {
    const payload = buildLiveSyncPayload();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      let errMsg = `Server returned HTTP ${res.status}`;
      try {
        const errJson = (await res.json()) as { error?: string };
        if (errJson?.error) errMsg = String(errJson.error);
      } catch {
        // ignore
      }
      upsertSettings({
        live_sync_last_status: 'error',
        live_sync_last_error: errMsg,
      });
      return { ok: false, message: errMsg };
    }

    const nowIso = new Date().toISOString();
    upsertSettings({
      live_sync_last_at: nowIso,
      live_sync_last_status: 'success',
      live_sync_last_error: '',
    });

    return { ok: true, message: 'Sync completed successfully' };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    const msg = err.name === 'AbortError' ? 'Sync timed out (server took > 12s)' : String(err.message || 'Connection failed');
    upsertSettings({
      live_sync_last_status: 'error',
      live_sync_last_error: msg,
    });
    return { ok: false, message: msg };
  } finally {
    isPushing = false;
  }
}

/** Test endpoint connectivity with credentials */
export async function testLiveSyncConnection(url: string, key: string): Promise<{ ok: boolean; message: string }> {
  if (!url) return { ok: false, message: 'URL is required' };
  if (!key) return { ok: false, message: 'API Key is required' };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const testUrl = url.includes('?') ? `${url}&key=${encodeURIComponent(key)}` : `${url}?key=${encodeURIComponent(key)}`;
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': key,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 401) {
      return { ok: false, message: 'Unauthorized: The API Key does not match config.php' };
    }

    if (!res.ok) {
      return { ok: false, message: `Server error: HTTP ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (data?.ok) {
      return { ok: true, message: data.message || 'Connection successful!' };
    }

    return { ok: true, message: 'Endpoint reached successfully' };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === 'AbortError') {
      return { ok: false, message: 'Connection timed out (> 8 seconds)' };
    }
    return { ok: false, message: err.message || 'Could not reach server' };
  }
}

/** Debounced trigger to avoid spamming the endpoint when many actions happen quickly */
export function triggerLiveSyncDebounced(): void {
  const config = getLiveSyncConfig();
  if (!config.enabled || !config.syncUrl || !config.apiKey) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushLiveSync();
  }, 1200);
  if (typeof debounceTimer.unref === 'function') debounceTimer.unref();
}

/** Restart periodic sync timer */
function restartLiveSyncTimer(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }

  const config = getLiveSyncConfig();
  if (!config.enabled || !config.syncUrl || !config.apiKey) return;

  const intervalMs = Math.max(config.intervalSeconds, 10) * 1000;
  syncTimer = setInterval(() => {
    void pushLiveSync();
  }, intervalMs);
  if (typeof syncTimer.unref === 'function') syncTimer.unref();
}

/** Initialize Live Sync service on server startup */
export function initLiveSync(): void {
  restartLiveSyncTimer();
  console.log('[LiveSync] Service initialized');
}

/** Stop Live Sync service on server shutdown */
export function stopLiveSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  console.log('[LiveSync] Service stopped');
}
