import { getDatabase, getSettingValue, now, upsertSettings } from '../db';

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

export interface TemplateVariableContext {
  businessName?: string;
  orderNumber?: string;
  billNumber?: string;
  totalAmount?: string;
  currency?: string;
  currencySymbol?: string;
  customerName?: string;
  stageLabel?: string;
}

export interface SendWhatyPieParams {
  phone: string;
  message: string;
  messageType?: 'text' | 'template' | 'document';
  templateName?: string;
  languageCode?: string;
  templateVariables?: unknown[];
  templateContext?: TemplateVariableContext;
  mediaUrl?: string;
  billId?: number | null;
  customerId?: string | number | null;
  userId?: string | null;
  kind?: 'bill_receipt' | 'manual_reply' | 'auto_followup' | 'z_report';
}

export interface SendWhatyPieResult {
  ok: boolean;
  messageId?: number;
  externalId?: string | null;
  error?: string;
}

/** Retrieve current WhatyPie configuration from database settings. */
export function getWhatyPieConfig(): WhatyPieConfig {
  const providerRaw = getSettingValue('whatsapp_provider');
  const provider = providerRaw === 'baileys' ? 'baileys' : 'whatypie';
  const enabled = getSettingValue('whatypie_enabled') === 'true';
  const apiUrl = (getSettingValue('whatypie_api_url') || 'https://api.whatypie.in').trim().replace(/\/+$/, '');
  const apiKey = (getSettingValue('whatypie_api_key') || '').trim();
  const senderPhone = (getSettingValue('whatypie_sender_phone') || '').trim();
  const sendOnBill = getSettingValue('whatypie_send_on_bill') !== 'false';
  const sendOnOrderStatus = getSettingValue('whatypie_send_on_order_status') !== 'false';
  const templateOrderStatus = (getSettingValue('whatypie_template_order_status') || '').trim();
  const templateBill = (getSettingValue('whatypie_template_bill') || '').trim();

  return {
    enabled,
    provider,
    apiUrl,
    apiKey,
    senderPhone,
    sendOnBill,
    sendOnOrderStatus,
    templateOrderStatus,
    templateBill,
  };
}

/** Update WhatyPie settings in local database. */
export function updateWhatyPieConfig(patch: Partial<WhatyPieConfig>): WhatyPieConfig {
  const updates: Record<string, string> = {};

  if (patch.enabled !== undefined) {
    updates['whatypie_enabled'] = patch.enabled ? 'true' : 'false';
    if (patch.enabled) {
      updates['whatsapp_enabled'] = 'true';
    }
  }
  if (patch.provider !== undefined) updates['whatsapp_provider'] = patch.provider;
  if (patch.apiUrl !== undefined) updates['whatypie_api_url'] = patch.apiUrl.trim().replace(/\/+$/, '');
  if (patch.apiKey !== undefined) updates['whatypie_api_key'] = patch.apiKey.trim();
  if (patch.senderPhone !== undefined) updates['whatypie_sender_phone'] = patch.senderPhone.trim();
  if (patch.sendOnBill !== undefined) updates['whatypie_send_on_bill'] = patch.sendOnBill ? 'true' : 'false';
  if (patch.sendOnOrderStatus !== undefined) updates['whatypie_send_on_order_status'] = patch.sendOnOrderStatus ? 'true' : 'false';
  if (patch.templateOrderStatus !== undefined) updates['whatypie_template_order_status'] = patch.templateOrderStatus.trim();
  if (patch.templateBill !== undefined) updates['whatypie_template_bill'] = patch.templateBill.trim();

  upsertSettings(updates);
  return getWhatyPieConfig();
}

/** Sanitize phone number to standard digits format (e.g. 919876543210). */
export function cleanPhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, '');
  // If 10 digits (common in India), prefix 91 if no country code provided
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
}

export interface WhatyPiePhoneNumber {
  id: string;
  display_phone_number: string;
  is_primary?: boolean;
}

let cachedPhoneNumbers: { fetchedAt: number; numbers: WhatyPiePhoneNumber[] } | null = null;

/** Fetch list of connected WhatsApp phone numbers from WhatyPie. */
export async function fetchWhatyPiePhoneNumbers(
  apiUrl?: string,
  apiKey?: string,
): Promise<WhatyPiePhoneNumber[]> {
  const config = getWhatyPieConfig();
  const cleanUrl = (apiUrl || config.apiUrl || 'https://api.whatypie.in').trim().replace(/\/+$/, '');
  const cleanKey = (apiKey || config.apiKey || '').trim();
  if (!cleanKey) return [];

  if (cachedPhoneNumbers && Date.now() - cachedPhoneNumbers.fetchedAt < 5 * 60 * 1000) {
    return cachedPhoneNumbers.numbers;
  }

  try {
    const res = await fetch(`${cleanUrl}/api/whatsapp/phone-numbers`, {
      method: 'GET',
      headers: {
        'x-api-key': cleanKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return cachedPhoneNumbers?.numbers || [];
    const json = (await res.json()) as { success?: boolean; data?: WhatyPiePhoneNumber[] };
    if (json?.success && Array.isArray(json.data)) {
      cachedPhoneNumbers = { fetchedAt: Date.now(), numbers: json.data };
      return json.data;
    }
  } catch (err) {
    console.warn('[WhatyPie] Failed to fetch phone numbers:', err);
  }
  return cachedPhoneNumbers?.numbers || [];
}

export interface WhatyPieTemplateInfo {
  name: string;
  language: string;
  category: string;
  status: string;
  bodyVariables: Array<{ key: string; example?: string }>;
  body: string;
}

let cachedTemplates: { fetchedAt: number; templates: WhatyPieTemplateInfo[] } | null = null;

/** Fetch list of approved WhatsApp templates from WhatyPie across connected accounts. */
export async function fetchWhatyPieTemplates(
  apiUrl?: string,
  apiKey?: string,
): Promise<WhatyPieTemplateInfo[]> {
  const config = getWhatyPieConfig();
  const cleanUrl = (apiUrl || config.apiUrl || 'https://api.whatypie.in').trim().replace(/\/+$/, '');
  const cleanKey = (apiKey || config.apiKey || '').trim();
  if (!cleanKey) return [];

  if (cachedTemplates && Date.now() - cachedTemplates.fetchedAt < 5 * 60 * 1000) {
    return cachedTemplates.templates;
  }

  try {
    const connsRes = await fetch(`${cleanUrl}/api/whatsapp/connections`, {
      method: 'GET',
      headers: { 'x-api-key': cleanKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!connsRes.ok) return cachedTemplates?.templates || [];
    const connsJson = (await connsRes.json()) as {
      data?: Array<{ id: string; whatsapp_business_account_id?: string }>;
    };
    const wabas = connsJson.data?.filter((c) => Boolean(c.whatsapp_business_account_id)) || [];
    const targets = wabas.length > 0 ? wabas : (connsJson.data || []);
    if (targets.length === 0) return cachedTemplates?.templates || [];

    const fetchedTemplates: WhatyPieTemplateInfo[] = [];
    const seenNames = new Set<string>();

    for (const waba of targets) {
      try {
        const tmplRes = await fetch(`${cleanUrl}/api/template?waba_id=${waba.id}`, {
          method: 'GET',
          headers: { 'x-api-key': cleanKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        if (!tmplRes.ok) continue;
        const tmplJson = (await tmplRes.json()) as {
          data?: { templates?: Record<string, unknown>[] } | Record<string, unknown>[];
        };
        const rawList = Array.isArray(tmplJson.data)
          ? tmplJson.data
          : Array.isArray(tmplJson.data?.templates)
            ? tmplJson.data.templates
            : [];

        for (const t of rawList) {
          const name = String(t.template_name || '');
          if (!name || seenNames.has(name)) continue;
          seenNames.add(name);
          fetchedTemplates.push({
            name,
            language: String(t.language || 'en'),
            category: String(t.category || ''),
            status: String(t.status || ''),
            bodyVariables: Array.isArray(t.body_variables)
              ? (t.body_variables as Array<{ key: string; example?: string }>)
              : [],
            body: String(t.message_body || ''),
          });
        }
      } catch {
        // continue to next waba
      }
    }

    if (fetchedTemplates.length > 0) {
      cachedTemplates = { fetchedAt: Date.now(), templates: fetchedTemplates };
      return fetchedTemplates;
    }
  } catch (err) {
    console.warn('[WhatyPie] Failed to fetch templates:', err);
  }
  return cachedTemplates?.templates || [];
}

/** Resolves and pads template variables according to approved template body structure. */
export function resolveTemplateVariables(
  template: WhatyPieTemplateInfo,
  ctx: TemplateVariableContext,
  providedVariables?: unknown[],
): string[] {
  const expectedCount = template.bodyVariables.length;
  if (expectedCount === 0) return [];

  const body = template.body || '';
  const parts = body.split(/\{\{(?:\d+|[a-zA-Z0-9_]+)\}\}/);
  const result: string[] = [];

  const businessName = ctx.businessName || 'Five Star';
  const billOrOrder = ctx.billNumber || ctx.orderNumber || '-';
  const totalAmount = ctx.totalAmount || '0.00';
  const currency = ctx.currency || ctx.currencySymbol || 'INR';
  const customerName = ctx.customerName || 'Valued Customer';
  const stageLabel = ctx.stageLabel || 'Confirmed';

  for (let i = 0; i < expectedCount; i++) {
    const explicitVal =
      providedVariables &&
      providedVariables[i] !== undefined &&
      providedVariables[i] !== null &&
      String(providedVariables[i]).trim() !== ''
        ? String(providedVariables[i]).trim()
        : null;

    if (parts.length > 1) {
      const prefix = (parts[i] || '').toLowerCase();
      const suffix = (parts[i + 1] || '').toLowerCase();

      if (/receipt\s*-|restaurant|cafe|brand|\bfrom\b|store|shop/.test(prefix)) {
        result.push(businessName);
      } else if (/bill\s*#|bill\s*no|order\s*#|order\s*no|ticket|token/.test(prefix)) {
        result.push(billOrOrder);
      } else if (/total\s*paid|total|amount|sum|price/.test(prefix)) {
        result.push(totalAmount);
      } else if (
        i > 0 &&
        (/total\s*paid|total|amount/.test((parts[i - 1] || '').toLowerCase()) ||
          /currency|inr|usd|eur|\$/.test(prefix))
      ) {
        result.push(currency);
      } else if (/hi|hello|dear|customer|name/.test(prefix) || /hi|hello/.test(suffix)) {
        result.push(customerName);
      } else if (/status|stage|update|ready|kitchen|\snow\b|\sis\b/.test(prefix)) {
        result.push(stageLabel);
      } else if (explicitVal) {
        result.push(explicitVal);
      } else {
        const fallbackList = [businessName, billOrOrder, totalAmount, currency, stageLabel, customerName];
        result.push(fallbackList[i] || businessName);
      }
    } else if (explicitVal) {
      result.push(explicitVal);
    } else {
      const fallbackList = [businessName, billOrOrder, totalAmount, currency, stageLabel, customerName];
      result.push(fallbackList[i] || businessName);
    }
  }

  return result.slice(0, expectedCount).map((v) => String(v || '').trim() || '-');
}

/** Probe WhatyPie endpoint and verify API key. */
export async function testWhatyPieConnection(
  apiUrl: string,
  apiKey: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const cleanUrl = (apiUrl || 'https://api.whatypie.in').trim().replace(/\/+$/, '');
  const cleanKey = (apiKey || '').trim();

  if (!cleanKey) {
    return { ok: false, error: 'WhatyPie API Key is required.' };
  }

  try {
    const response = await fetch(`${cleanUrl}/api/whatsapp/status`, {
      method: 'GET',
      headers: {
        'x-api-key': cleanKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      // Invalidate cache so fresh numbers are retrieved
      cachedPhoneNumbers = null;
      return { ok: true, message: 'Successfully connected to WhatyPie WhatsApp API!' };
    }

    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: 'Authentication failed. Please verify your WhatyPie API Key.' };
    }

    let errorDetail = '';
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) errorDetail = data.message;
    } catch {
      // ignore json parse error
    }

    return {
      ok: false,
      error: errorDetail || `WhatyPie responded with HTTP status ${response.status}.`,
    };
  } catch (err: unknown) {
    const e = err as Error;
    if (e.name === 'TimeoutError') {
      return { ok: false, error: 'Connection to WhatyPie timed out after 10 seconds.' };
    }
    return { ok: false, error: e.message || 'Connection test failed.' };
  }
}

/** Send WhatsApp message via WhatyPie REST API and record in SQLite. */
export async function sendWhatyPieMessage(params: SendWhatyPieParams): Promise<SendWhatyPieResult> {
  const config = getWhatyPieConfig();
  const phone = cleanPhoneNumber(params.phone);

  if (!phone) {
    return { ok: false, error: 'Invalid phone number.' };
  }
  if (!config.apiKey) {
    return { ok: false, error: 'WhatyPie API key is not configured.' };
  }

  const db = getDatabase();
  const baseTs = now();
  const kind = params.kind || 'manual_reply';

  // 1. Record queued message in local SQLite
  let messageRowId: number;
  try {
    const insertResult = db.prepare(`
      INSERT INTO whatsapp_messages (
        bill_id, customer_id, phone_e164, direction, kind, status,
        body, queued_at, created_by_user_id
      ) VALUES (?, ?, ?, 'outbound', ?, 'queued', ?, ?, ?)
    `).run(
      params.billId ?? null,
      params.customerId ?? null,
      `+${phone}`,
      kind,
      params.message,
      baseTs,
      params.userId ?? null,
    );
    messageRowId = Number(insertResult.lastInsertRowid);
  } catch (err: unknown) {
    const e = err as Error;
    return { ok: false, error: e.message || 'Failed to record local message queue row.' };
  }

  // 2. Resolve sender WhatsApp phone number ID from WhatyPie
  let resolvedPhoneId: string | null = null;
  let resolvedPhoneNumber: string | null = config.senderPhone || null;

  try {
    const phoneList = await fetchWhatyPiePhoneNumbers(config.apiUrl, config.apiKey);
    if (phoneList.length > 0) {
      if (config.senderPhone) {
        const targetDigits = config.senderPhone.replace(/\D/g, '');
        const matched = phoneList.find((p) => p.display_phone_number.replace(/\D/g, '') === targetDigits);
        if (matched) {
          resolvedPhoneId = matched.id;
          resolvedPhoneNumber = matched.display_phone_number;
        }
      }
      if (!resolvedPhoneId) {
        const primary = phoneList.find((p) => p.is_primary) || phoneList[0];
        if (primary) {
          resolvedPhoneId = primary.id;
          resolvedPhoneNumber = primary.display_phone_number;
        }
      }
    }
  } catch (resolveErr) {
    console.warn('[WhatyPie] Could not resolve phone numbers list:', resolveErr);
  }

  // 3. Resolve template details (language code and variable counts)
  let resolvedLanguage = params.languageCode;
  let resolvedVariables: unknown[] | undefined = params.templateVariables
    ? [...params.templateVariables]
    : undefined;

  if (params.templateName) {
    try {
      const templates = await fetchWhatyPieTemplates(config.apiUrl, config.apiKey);
      const matched = templates.find((t) => t.name === params.templateName);
      if (matched) {
        if (!resolvedLanguage) {
          resolvedLanguage = matched.language;
        }
        const expectedCount = matched.bodyVariables.length;
        if (expectedCount === 0) {
          resolvedVariables = undefined;
        } else {
          const ctx = params.templateContext || {};
          resolvedVariables = resolveTemplateVariables(matched, ctx, resolvedVariables);
        }
      } else if (params.templateName === 'five_start_bill_receipt') {
        if (!resolvedLanguage) resolvedLanguage = 'en_US';
        const ctx = params.templateContext || {};
        const bName = ctx.businessName || 'Five Star';
        const num = ctx.billNumber || ctx.orderNumber || (resolvedVariables?.[0] as string) || 'TOK-0001';
        const tot = ctx.totalAmount || (resolvedVariables?.[2] as string) || '0.00';
        const cur = ctx.currency || 'INR';
        resolvedVariables = [bName, num, tot, cur];
      }
    } catch (tmplErr) {
      console.warn('[WhatyPie] Template auto-resolution warning:', tmplErr);
    }
  }

  // 4. Build WhatyPie payload
  const endpoint = `${config.apiUrl}/api/whatsapp/send`;
  const isTemplate = params.messageType === 'template' || Boolean(params.templateName);
  const payload: Record<string, unknown> = {
    contact_no: phone,
    message: params.message,
    messageType: isTemplate ? 'template' : (params.messageType || 'text'),
  };

  if (resolvedPhoneId) {
    payload.whatsapp_phone_number_id = resolvedPhoneId;
  }
  if (resolvedPhoneNumber) {
    payload.whatsapp_phone_number = resolvedPhoneNumber;
  }
  if (params.templateName) {
    payload.templateName = params.templateName;
  }
  if (resolvedLanguage) {
    payload.languageCode = resolvedLanguage;
  }
  if (resolvedVariables && resolvedVariables.length > 0) {
    payload.templateVariables = resolvedVariables;
  }
  if (params.mediaUrl) {
    payload.mediaUrl = params.mediaUrl;
  }

  // 4. Dispatch to WhatyPie API (with automatic text fallback if template fails)
  try {
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    // If template send failed (e.g. template does not exist or mismatched params),
    // automatically fallback to sending the rich formatted text message directly.
    if (!response.ok && isTemplate) {
      let templateErr = `HTTP ${response.status}`;
      try {
        const errJson = (await response.json()) as { message?: string; error?: string; details?: string };
        templateErr = errJson.details || errJson.error || errJson.message || templateErr;
      } catch {
        // ignore
      }
      console.warn(`[WhatyPie] Template dispatch failed (${templateErr}). Falling back to text message...`);

      const textPayload: Record<string, unknown> = {
        ...payload,
        messageType: 'text',
      };
      delete textPayload.templateName;
      delete textPayload.templateVariables;

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(textPayload),
        signal: AbortSignal.timeout(15000),
      });
    }

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errJson = (await response.json()) as { message?: string; error?: string; details?: string };
        errorMsg = errJson.details || errJson.message || errJson.error || errorMsg;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    let respData: { success?: boolean; messageId?: string; data?: { _id?: string; external_id?: string; wa_message_id?: string } } = {};
    try {
      respData = (await response.json()) as typeof respData;
    } catch {
      // ignore
    }

    const externalId = respData?.messageId || respData?.data?.wa_message_id || respData?.data?._id || respData?.data?.external_id || null;

    db.prepare(`
      UPDATE whatsapp_messages
      SET status = 'sent', sent_at = ?, external_message_id = ?
      WHERE id = ?
    `).run(now(), externalId, messageRowId);

    return { ok: true, messageId: messageRowId, externalId };
  } catch (err: unknown) {
    const e = err as Error;
    const errorMessage = e.message || 'WhatyPie request failed';
    console.error(`[WhatyPie] Message #${messageRowId} to ${phone} failed:`, errorMessage);

    db.prepare(`
      UPDATE whatsapp_messages
      SET status = 'failed', failed_at = ?, error = ?
      WHERE id = ?
    `).run(now(), errorMessage, messageRowId);

    return { ok: false, messageId: messageRowId, error: errorMessage };
  }
}

/** Formats and sends a digital bill receipt to the customer via WhatyPie. */
export async function sendWhatyPieBillReceipt(
  billId: number,
  customerPhoneOverride?: string,
  userId?: string,
): Promise<SendWhatyPieResult> {
  const config = getWhatyPieConfig();
  if (!config.enabled || !config.sendOnBill) {
    return { ok: false, error: 'WhatyPie bill receipt sending is disabled in settings.' };
  }

  const db = getDatabase();
  const bill = db.prepare(`
    SELECT b.id, b.bill_number, b.total, b.order_id, b.customer_id, b.created_at,
           c.name AS customer_name, c.phone AS customer_phone
    FROM bills b
    LEFT JOIN customers c ON c.id = b.customer_id
    WHERE b.id = ?
  `).get(billId) as {
    id: number;
    bill_number: string;
    total: number;
    order_id: number;
    customer_id: number | null;
    created_at: string;
    customer_name: string | null;
    customer_phone: string | null;
  } | undefined;

  if (!bill) {
    return { ok: false, error: `Bill #${billId} not found.` };
  }

  const recipientPhone = customerPhoneOverride || bill.customer_phone;
  if (!recipientPhone) {
    return { ok: false, error: 'No customer phone number associated with this bill.' };
  }

  // Fetch ordered items
  const items = db.prepare(`
    SELECT oi.product_name, oi.quantity, oi.total
    FROM order_items oi
    WHERE oi.order_id = ? AND oi.status != 'cancelled'
  `).all(bill.order_id) as { product_name: string; quantity: number; total: number }[];

  const businessName = getSettingValue('business_name') || 'DinZin Restaurant';
  const currency = getSettingValue('currency') || 'INR';
  const currencySymbol = getSettingValue('currency_symbol') || '₹';
  const totalAmount = Number(bill.total || 0).toFixed(2);

  const itemLines = items.map(
    (item) => `• ${item.quantity}x ${item.product_name} - ${currencySymbol}${Number(item.total).toFixed(2)}`,
  );

  const formattedMessage = [
    `🧾 *BILL RECEIPT - ${businessName}*`,
    `*Bill #:* ${bill.bill_number}`,
    `*Date:* ${bill.created_at.replace('T', ' ').slice(0, 16)}`,
    ...(itemLines.length > 0 ? ['', '*Ordered Items:*', ...itemLines] : []),
    '',
    `*Total Paid:* ${currencySymbol}${totalAmount} ${currency}`,
    '',
    'Thank you for your visit! 🙏',
  ].join('\n');

  const templateContext: TemplateVariableContext = {
    businessName,
    billNumber: bill.bill_number,
    orderNumber: bill.bill_number,
    totalAmount,
    currency,
    currencySymbol,
    customerName: bill.customer_name || 'Valued Customer',
    stageLabel: 'Completed',
  };

  const isReceiptTemplate =
    config.templateBill.toLowerCase().includes('receipt') ||
    config.templateBill.toLowerCase().includes('bill');
  const candidateVariables = isReceiptTemplate
    ? [businessName, bill.bill_number, totalAmount, currency]
    : [bill.bill_number, `${currencySymbol}${totalAmount}`, businessName, currency];

  return sendWhatyPieMessage({
    phone: recipientPhone,
    message: formattedMessage,
    messageType: config.templateBill ? 'template' : 'text',
    templateName: config.templateBill || undefined,
    templateVariables: config.templateBill ? candidateVariables : undefined,
    templateContext,
    billId: bill.id,
    customerId: bill.customer_id,
    userId,
    kind: 'bill_receipt',
  });
}

/** Formats and sends an order status update to the customer via WhatyPie. */
export async function sendWhatyPieOrderStatus(
  orderId: number,
  stage: string,
  customerPhoneOverride?: string,
  userId?: string,
): Promise<SendWhatyPieResult> {
  const config = getWhatyPieConfig();
  if (!config.enabled || !config.sendOnOrderStatus) {
    return { ok: false, error: 'WhatyPie order status notifications are disabled in settings.' };
  }

  const db = getDatabase();
  const order = db.prepare(`
    SELECT o.id, o.order_number, o.status, o.type, o.total, o.customer_id,
           c.name AS customer_name, c.phone AS customer_phone
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ?
  `).get(orderId) as {
    id: number;
    order_number: string;
    status: string;
    type: string;
    total: number;
    customer_id: number | null;
    customer_name: string | null;
    customer_phone: string | null;
  } | undefined;

  if (!order) {
    return { ok: false, error: `Order #${orderId} not found.` };
  }

  const recipientPhone = customerPhoneOverride || order.customer_phone;
  if (!recipientPhone) {
    return { ok: false, error: 'No customer phone number associated with this order.' };
  }

  const businessName = getSettingValue('business_name') || 'DinZin Restaurant';
  const currency = getSettingValue('currency') || 'INR';
  const currencySymbol = getSettingValue('currency_symbol') || '₹';
  const totalAmount = Number(order.total || 0).toFixed(2);

  let stageLabel = stage;
  let statusText = '';
  if (stage === 'in_preparation' || stage === 'preparing') {
    stageLabel = 'Preparing in Kitchen';
    statusText = `👨‍🍳 *Order Update* from *${businessName}*\nYour Order *#${order.order_number}* is now being prepared in the kitchen!`;
  } else if (stage === 'ready') {
    stageLabel = 'Ready for Pickup';
    statusText = `🥡 *Order Ready!* from *${businessName}*\nYour Order *#${order.order_number}* is freshly prepared and ready for pickup/delivery!`;
  } else if (stage === 'out_for_delivery') {
    stageLabel = 'Out for Delivery';
    statusText = `🚚 *Out for Delivery!* from *${businessName}*\nYour Order *#${order.order_number}* is out for delivery and will arrive soon!`;
  } else if (stage === 'completed' || stage === 'delivered') {
    stageLabel = order.type === 'delivery' || stage === 'delivered' ? 'Delivered' : 'Completed';
    statusText = `✅ *Order ${stageLabel}* from *${businessName}*\nYour Order *#${order.order_number}* has been ${stageLabel === 'Delivered' ? 'delivered' : 'completed'}. Thank you for choosing us! 🙏`;
  } else if (stage === 'confirmed' || stage === 'placed') {
    stageLabel = 'Confirmed';
    statusText = `🛎️ *Order Confirmed* from *${businessName}*\nWe have received your Order *#${order.order_number}*. We're on it!`;
  } else {
    // Other intermediate stages
    stageLabel = stage.toUpperCase();
    statusText = `📢 *Order Update* from *${businessName}*\nYour Order *#${order.order_number}* status is now: *${stage.toUpperCase()}*.`;
  }

  const templateContext: TemplateVariableContext = {
    businessName,
    orderNumber: order.order_number,
    billNumber: order.order_number,
    totalAmount,
    currency,
    currencySymbol,
    customerName: order.customer_name || 'Valued Customer',
    stageLabel,
  };

  const isReceiptTemplate =
    config.templateOrderStatus.toLowerCase().includes('receipt') ||
    config.templateOrderStatus.toLowerCase().includes('bill');
  const candidateVariables = isReceiptTemplate
    ? [businessName, order.order_number, totalAmount, currency]
    : [order.order_number, stageLabel, businessName, totalAmount];

  return sendWhatyPieMessage({
    phone: recipientPhone,
    message: statusText,
    messageType: config.templateOrderStatus ? 'template' : 'text',
    templateName: config.templateOrderStatus || undefined,
    templateVariables: config.templateOrderStatus ? candidateVariables : undefined,
    templateContext,
    customerId: order.customer_id,
    userId,
    kind: 'auto_followup',
  });
}
