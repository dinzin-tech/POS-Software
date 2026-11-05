import {
  getDatabase,
  getSettingValue,
  generateOrderNumber,
  generateBillNumber,
  dateStampInTimezone,
  now,
  withTxn,
  isKotPrintingEnabled,
} from '../db';
import { printKOTDetailed } from '../printers/thermal';
import { routeItemsToStations, getEffectiveOrderItems } from '../routes/printers';
import { notifyOrderUpdated } from './kds';
import * as whatsapp from './whatsapp';
import * as whatypie from './whatypie';
import { parsePhoneE164 } from '../lib/phone';

export interface OnlineOrderCustomer {
  name: string;
  phone: string;
  address?: string;
}

export interface OnlineOrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  total?: number;
  notes?: string;
}

export interface RawOnlineOrder {
  order_id: string;
  order_number?: string;
  source?: string;
  order_type: 'dine-in' | 'pickup' | 'delivery' | string;
  table_number?: string;
  special_instructions?: string;
  customer: OnlineOrderCustomer;
  items: OnlineOrderItem[];
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  total: number;
  payment_status?: 'paid' | 'unpaid' | string;
  payment_method?: string;
  payment_id?: string;
  paid_amount?: number;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  created_at?: string;
}

/** Build live dynamic menu catalog and categories for website sync */
export function buildMenuCatalog(db: ReturnType<typeof getDatabase>) {
  const categories = db.prepare(`
    SELECT id, name, slug, description, image_url, sort_order
    FROM categories
    WHERE deleted_at IS NULL AND is_active = 1
    ORDER BY sort_order ASC, name ASC
  `).all() as { id: string; name: string; slug: string; description?: string; image_url?: string; sort_order: number }[];

  const products = db.prepare(`
    SELECT p.id, p.category_id, p.name, p.description, p.price, p.image_url,
           p.tags, p.track_inventory, p.stock_quantity, p.low_stock_threshold,
           p.is_active, p.sort_order, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.sort_order ASC, p.name ASC
  `).all() as any[];

  const items = products.map((p) => {
    const rawTags = (p.tags || '').toLowerCase();
    const tagList = rawTags.split(/[,\s]+/).filter(Boolean);
    const isVeg = tagList.includes('veg') || tagList.includes('pure-veg') || tagList.includes('vegetarian');

    let spiceLevel = 'mild';
    if (tagList.includes('peri-peri') || tagList.includes('periperi')) spiceLevel = 'peri-peri';
    else if (tagList.includes('hot') || tagList.includes('spicy')) spiceLevel = 'hot';
    else if (tagList.includes('medium')) spiceLevel = 'medium';

    const isBestseller = tagList.includes('bestseller') || tagList.includes('popular') || tagList.includes('star');
    const isHalalChicken = !isVeg && (
      tagList.includes('halal') ||
      p.name.toLowerCase().includes('chicken') ||
      (p.description || '').toLowerCase().includes('chicken')
    );

    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (p.is_active === 0) {
      stockStatus = 'out_of_stock';
    } else if (p.track_inventory === 1) {
      const stockQty = Number(p.stock_quantity || 0);
      const threshold = Number(p.low_stock_threshold || 5);
      if (stockQty <= 0) {
        stockStatus = 'out_of_stock';
      } else if (stockQty <= threshold) {
        stockStatus = 'low_stock';
      }
    }

    const catSlug = p.category_slug || (p.category_name ? p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'all');

    return {
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      price: Number(p.price || 0),
      category: catSlug,
      category_name: p.category_name || 'Specialties',
      category_id: p.category_id || '',
      image: p.image_url || '',
      tags: tagList,
      spiceLevel,
      isBestseller,
      isVeg,
      isHalalChicken,
      stock_status: stockStatus,
      stock_quantity: p.track_inventory === 1 ? Number(p.stock_quantity || 0) : null,
      low_stock_threshold: p.track_inventory === 1 ? Number(p.low_stock_threshold || 5) : null,
      track_inventory: p.track_inventory === 1,
      is_active: p.is_active === 1,
    };
  });

  return { categories, items };
}

/** Compute store open/closed status for website display */
export function getStoreStatus(_db: ReturnType<typeof getDatabase>) {
  const manualOpen = getSettingValue('store_online_orders_enabled') !== 'false';
  const openHour = parseInt(getSettingValue('store_open_hour') || '11', 10);
  const closeHour = parseInt(getSettingValue('store_close_hour') || '23', 10);

  const now = new Date();
  const currentHour = now.getHours();

  let isOpenByHours = true;
  if (!isNaN(openHour) && !isNaN(closeHour) && openHour !== closeHour) {
    if (openHour < closeHour) {
      isOpenByHours = currentHour >= openHour && currentHour < closeHour;
    } else {
      isOpenByHours = currentHour >= openHour || currentHour < closeHour;
    }
  }

  const isOpen = manualOpen && isOpenByHours;
  const statusText = isOpen ? 'Open Now' : 'Currently Closed';
  const message = !manualOpen
    ? 'Online ordering paused temporarily by the restaurant'
    : (!isOpenByHours ? `Opens at ${openHour}:00` : 'Accepting online orders');

  return {
    is_open: isOpen,
    status_text: statusText,
    message,
    opening_hours: {
      display: `${openHour % 12 || 12}:00 ${openHour >= 12 ? 'PM' : 'AM'} – ${closeHour % 12 || 12}:00 ${closeHour >= 12 ? 'PM' : 'AM'}`,
      openHour,
      closeHour,
      days: 'Monday – Sunday',
    },
  };
}

/** Format and send automatic WhatsApp order confirmation and bill to customer */
export async function sendOrderWhatsAppMessage(params: {
  phone: string;
  message: string;
  billId?: number | null;
  customerId?: string | number | null;
}): Promise<{ ok: boolean; error?: string }> {
  const defaultCountry = getSettingValue('country') || 'IN';
  const parsed = parsePhoneE164(params.phone, defaultCountry);
  if (!parsed) {
    console.warn('[OnlineOrders] Invalid customer phone format:', params.phone);
    return { ok: false, error: 'Invalid phone format' };
  }

  const wpConfig = whatypie.getWhatyPieConfig();
  if (wpConfig.provider === 'whatypie' && wpConfig.enabled) {
    const res = await whatypie.sendWhatyPieMessage({
      phone: parsed.e164,
      message: params.message,
      billId: params.billId ?? null,
      customerId: params.customerId ?? null,
      kind: 'bill_receipt',
    });
    console.log('[OnlineOrders] Sent WhatsApp via WhatyPie:', { ok: res.ok, messageId: res.messageId });
    return { ok: res.ok, error: res.error };
  }

  try {
    const res = await whatsapp.sendMessage({
      phoneE164: parsed.e164,
      body: params.message,
      billId: params.billId ?? null,
      customerId: params.customerId != null ? Number(params.customerId) : null,
      kind: 'bill_receipt',
      userId: 'system',
    });
    console.log('[OnlineOrders] Sent WhatsApp via Baileys:', { ok: res.ok, messageId: res.messageId });
    return { ok: res.ok, error: res.error };
  } catch (err: any) {
    console.error('[OnlineOrders] Failed to dispatch WhatsApp:', err?.message);
    return { ok: false, error: err?.message || 'Failed to send WhatsApp message' };
  }
}

/** Ingest a single online order transactionally into SQLite, trigger auto KOT and WhatsApp bill */
export async function ingestOnlineOrder(raw: RawOnlineOrder): Promise<{ ok: boolean; orderId?: number; orderNumber?: string; error?: string }> {
  const db = getDatabase();

  // 1. Idempotency check: Don't process the same order twice
  const existingOrder = db.prepare(`
    SELECT id, order_number FROM orders
    WHERE external_order_id = ? OR special_instructions LIKE ?
    LIMIT 1
  `).get(raw.order_id, `%[Online: ${raw.order_id}]%`) as { id: number; order_number: string } | undefined;

  if (existingOrder) {
    console.log(`[OnlineOrders] Order ${raw.order_id} already ingested as ${existingOrder.order_number}`);
    return { ok: true, orderId: existingOrder.id, orderNumber: existingOrder.order_number };
  }

  let createdOrderId: number | null = null;
  let createdOrderNumber: string | null = null;
  let billId: number | null = null;
  let billNumber: string = '';
  const subtotal = Number(raw.subtotal || raw.total || 0);
  const taxAmount = Number(raw.tax_amount || 0);
  const delCharge = Number(raw.delivery_fee || 0);
  const grandTotal = Number(raw.total || (subtotal + taxAmount + delCharge));
  const isPrepaid = (raw.payment_status || '').toLowerCase() === 'paid' || !!raw.payment_id;
  const paidAmount = isPrepaid ? grandTotal : Math.min(grandTotal, Number(raw.paid_amount || 0));
  const balance = Math.max(0, grandTotal - paidAmount);
  const paymentStatus = isPrepaid ? 'paid' : (paidAmount > 0 ? 'partially_paid' : 'unpaid');

  try {
    withTxn(() => {
      // 2. Resolve Customer
      let customerId: string | null = null;
      const cleanPhone = (raw.customer.phone || '').replace(/\D/g, '');
      if (cleanPhone) {
        const found = db.prepare('SELECT id FROM customers WHERE phone LIKE ? LIMIT 1').get(`%${cleanPhone.slice(-10)}`) as { id: string } | undefined;
        if (found) {
          customerId = found.id;
        } else {
          customerId = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          db.prepare(`
            INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'Registered via Website Online Order', ?, ?)
          `).run(customerId, raw.customer.name, raw.customer.phone, raw.customer.address || '', now(), now());
        }
      }

      // 3. Resolve Table (if dine-in)
      let tableId: string | null = null;
      const cleanType = raw.order_type.toLowerCase();
      const posType = cleanType === 'dine-in' ? 'dine_in' : (cleanType === 'delivery' ? 'delivery' : 'takeaway');

      if (posType === 'dine_in' && raw.table_number) {
        const cleanTableNum = raw.table_number.replace(/^table\s*/i, '').trim();
        const tableNum = cleanTableNum || raw.table_number.trim();
        const foundTable = db.prepare('SELECT id FROM tables WHERE number = ? OR id = ? LIMIT 1').get(tableNum, tableNum) as { id: string } | undefined;
        if (foundTable) {
          tableId = foundTable.id;
          db.prepare("UPDATE tables SET status = 'occupied', updated_at = ? WHERE id = ?").run(now(), tableId);
        } else {
          const newTableId = `tbl-${tableNum.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
          try {
            db.prepare(`
              INSERT INTO tables (id, number, capacity, status, is_active, created_at, updated_at)
              VALUES (?, ?, 4, 'occupied', 1, ?, ?)
            `).run(newTableId, tableNum, now(), now());
            tableId = newTableId;
          } catch {
            tableId = null;
          }
        }
      }

      // 4. Insert Order - Align order number with website token number if provided (e.g. TOK-0009)
      let orderNumber: string;
      const candidateNumber = (raw.order_number || raw.order_id || '').trim();
      if (candidateNumber.startsWith('TOK-')) {
        const existingWithNumber = db.prepare('SELECT id FROM orders WHERE order_number = ? LIMIT 1').get(candidateNumber);
        if (!existingWithNumber) {
          orderNumber = candidateNumber;
          // Synchronize POS sequences table so subsequent counter orders won't collide
          try {
            const numPart = parseInt(candidateNumber.replace(/\D/g, ''), 10);
            if (!isNaN(numPart) && numPart > 0) {
              const tz = getSettingValue('timezone') || 'Asia/Kolkata';
              const bucket = dateStampInTimezone(tz);
              db.prepare(`
                INSERT INTO sequences (name, bucket, current_value)
                VALUES ('orders', ?, ?)
                ON CONFLICT(name, bucket) DO UPDATE SET current_value = MAX(current_value, excluded.current_value)
              `).run(bucket, numPart);
            }
          } catch {
            // ignore
          }
        } else {
          orderNumber = generateOrderNumber();
        }
      } else {
        orderNumber = generateOrderNumber();
      }
      const typeLabel = posType === 'dine_in' ? `Dine-In (${raw.table_number || 'No Table'})` : (posType === 'delivery' ? 'Delivery' : 'Takeaway');
      const payTag = isPrepaid ? ` [PAID: ${raw.payment_method || 'Online'} - Ref: ${raw.payment_id || 'Razorpay'}]` : ' [PAYMENT DUE: Cash/Counter]';
      const notes = `[Online: ${raw.order_id}] ${typeLabel}${payTag}${raw.special_instructions ? ' | ' + raw.special_instructions : ''}`.trim();

      const defaultUser = db.prepare("SELECT id FROM users ORDER BY created_at ASC LIMIT 1").get() as { id: string } | undefined;
      const userId = defaultUser?.id || null;

      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          order_number, table_id, customer_id, user_id, type,
          delivery_address, special_instructions, status,
          subtotal, tax_amount, delivery_charge, total,
          online_platform, external_order_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'website', ?, ?, ?)
      `);

      const res = insertOrderStmt.run(
        orderNumber,
        tableId,
        customerId,
        userId,
        posType,
        raw.customer.address || null,
        notes,
        subtotal,
        taxAmount,
        delCharge,
        grandTotal,
        raw.order_id,
        now(),
        now(),
      );

      const orderId = Number(res.lastInsertRowid);
      createdOrderId = orderId;
      createdOrderNumber = orderNumber;

      // 5. Insert Order Items & Deduct Stock
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, unit_price,
          quantity, subtotal, total, special_instructions, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `);

      for (const it of raw.items) {
        // Match product in local DB
        let matchedProduct: any = null;
        if (it.id) {
          matchedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(it.id);
        }
        if (!matchedProduct && it.name) {
          matchedProduct = db.prepare('SELECT * FROM products WHERE LOWER(name) = ? LIMIT 1').get(it.name.toLowerCase().trim());
        }

        const productId = matchedProduct?.id || `ext-${Date.now()}`;
        const productName = matchedProduct?.name || it.name;
        const sku = matchedProduct?.sku || null;
        const unitPrice = Number(it.price || 0);
        const qty = Math.max(1, Number(it.quantity || 1));
        const lineTotal = Number(it.total || (unitPrice * qty));

        insertItemStmt.run(
          orderId,
          productId,
          productName,
          sku,
          unitPrice,
          qty,
          lineTotal,
          lineTotal,
          it.notes || null,
          now(),
          now(),
        );

        // Deduct inventory if tracked
        if (matchedProduct && matchedProduct.track_inventory === 1) {
          db.prepare(`
            UPDATE products
            SET stock_quantity = MAX(0, stock_quantity - ?),
                updated_at = ?
            WHERE id = ?
          `).run(qty, now(), matchedProduct.id);
        }
      }

      // 6. Generate Bill Entry
      billNumber = generateBillNumber();
      const paidAt = isPrepaid ? now() : null;

      let paymentDetails: string | null = null;
      if (isPrepaid) {
        const rawMethod = (raw.payment_method || 'online').toLowerCase();
        let methodTag = 'UPI';
        if (rawMethod.includes('card')) methodTag = 'Card';
        else if (rawMethod.includes('cash')) methodTag = 'Cash';
        else if (rawMethod.includes('netbanking')) methodTag = 'Net Banking';
        else if (rawMethod.includes('wallet')) methodTag = 'Wallet';
        else methodTag = 'UPI';

        paymentDetails = JSON.stringify([
          {
            method: methodTag,
            payment_method: methodTag,
            amount: paidAmount,
            reference: raw.payment_id || `Razorpay: ${raw.order_id}`,
            paid_at: paidAt,
          },
        ]);
      }

      const insertBillStmt = db.prepare(`
        INSERT INTO bills (
          bill_number, order_id, customer_id, subtotal, tax_amount,
          delivery_charge, total, paid_amount, balance, payment_status,
          payment_details, paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const billRes = insertBillStmt.run(
        billNumber,
        orderId,
        customerId,
        subtotal,
        taxAmount,
        delCharge,
        grandTotal,
        paidAmount,
        balance,
        paymentStatus,
        paymentDetails,
        paidAt,
        now(),
        now(),
      );
      billId = Number(billRes.lastInsertRowid);
    });
  } catch (err: any) {
    console.error('[OnlineOrders] Transaction failure while saving order:', err);
    return { ok: false, error: err?.message || 'Database transaction error' };
  }

  if (!createdOrderId || !createdOrderNumber) {
    return { ok: false, error: 'Failed to record order' };
  }

  console.log(`[OnlineOrders] Successfully created local order #${createdOrderNumber} (ID: ${createdOrderId}) from ${raw.order_id}`);

  // Broadcast to connected KDS screens and trigger debounced cloud sync
  try {
    notifyOrderUpdated();
  } catch (err: any) {
    console.warn('[OnlineOrders] Failed to broadcast KDS update:', err?.message);
  }

  // 7. Auto Print KOT
  try {
    if (isKotPrintingEnabled()) {
      const orderData: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(createdOrderId);
      if (orderData) {
        if (orderData.table_id) {
          const t: any = db.prepare('SELECT number FROM tables WHERE id = ?').get(orderData.table_id);
          if (t) orderData.table = { name: t.number };
        }
        if (orderData.customer_id) {
          const c: any = db.prepare('SELECT name FROM customers WHERE id = ?').get(orderData.customer_id);
          if (c) orderData.customer = { name: c.name };
        }

        const effectiveItems = getEffectiveOrderItems(db, String(createdOrderId));
        const groups = routeItemsToStations(db, effectiveItems).filter((g) => g.items.length > 0);

        for (const g of groups) {
          void printKOTDetailed(orderData, g.items, g.stationName, false, g.printer || undefined)
            .then((res) => {
              console.log(`[OnlineOrders] KOT printed for station "${g.stationName}":`, res.ok ? 'SUCCESS' : res.detail);
            })
            .catch((e) => {
              console.error(`[OnlineOrders] KOT print error for "${g.stationName}":`, e?.message);
            });
        }
      }
    } else {
      console.log('[OnlineOrders] KOT printing skipped (disabled in store settings)');
    }
  } catch (printErr: any) {
    console.error('[OnlineOrders] Automatic KOT trigger failed:', printErr?.message);
  }

  // 8. Auto Send Bill Receipt via WhatsApp with Digital Receipt Link
  try {
    const storeName = getSettingValue('restaurant_name') || getSettingValue('business_name') || 'Five Star';
    const storePhone = getSettingValue('phone') || '+919353333945';
    const storeAddress = getSettingValue('address') || 'Lohith Nagara, Nelmangala.';
    const syncUrl = getSettingValue('live_sync_url') || 'https://fivestarnelamangala.in/dashboard/sync.php';
    const apiKey = getSettingValue('live_sync_key') || 'fivestar_pos_2026';

    let baseDomain = 'https://fivestarnelamangala.in';
    try {
      const parsed = new URL(syncUrl);
      baseDomain = `${parsed.protocol}//${parsed.host}`;
    } catch {
      // fallback
    }

    const receiptId = raw.order_id || `REC-${createdOrderNumber}`;
    const receiptUrl = `${baseDomain}/bill.php?id=${encodeURIComponent(receiptId)}`;

    // Publish official thermal bill snapshot to web server for 4-day retention
    const receiptPayload = {
      receipt_id: receiptId,
      order_number: createdOrderNumber,
      bill_number: billNumber,
      online_order_id: raw.order_id,
      customer_name: raw.customer.name,
      customer_phone: raw.customer.phone,
      order_type: raw.order_type === 'dine-in' ? 'Dine-In' : 'Takeaway',
      table_number: raw.table_number || '',
      created_date_formatted: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit',
        hour12: true,
      }),
      items: raw.items.map((it) => ({
        name: it.name,
        quantity: Math.max(1, Number(it.quantity || 1)),
        price: Number(it.price || 0),
        total: Number(it.total || (Number(it.price || 0) * Math.max(1, Number(it.quantity || 1)))),
      })),
      subtotal,
      tax_amount: taxAmount,
      delivery_charge: 0.0,
      total: grandTotal,
      paid_amount: paidAmount,
      balance,
      payment_status: paymentStatus.toUpperCase(),
      payment_method: (raw.payment_method || (isPrepaid ? 'ONLINE' : 'CASH')).toUpperCase(),
      payment_id: raw.payment_id || '',
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
    };

    let publishEndpoint = syncUrl;
    if (!publishEndpoint.includes('action=')) {
      publishEndpoint += (publishEndpoint.includes('?') ? '&' : '?') + 'action=publish_receipt';
    }

    fetch(publishEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(receiptPayload),
      signal: AbortSignal.timeout(4000),
    }).catch((pubErr) => {
      console.warn('[OnlineOrders] Failed to push receipt to cloud (non-fatal):', pubErr?.message);
    });

    const itemsSummary = raw.items.map((it, idx) => `${idx + 1}. ${it.name} x ${it.quantity} = ₹${it.total || (it.price * it.quantity)}`).join('\n');

    let typeStr = raw.order_type === 'dine-in' ? 'Dine-In' : 'Takeaway';
    if (raw.table_number) {
      typeStr += ` (Table ${raw.table_number})`;
    }

    let waText = `🍗 *${storeName.toUpperCase()}* 🍗\n`;
    waText += `*Thank You for Your Order!* 🙏\n\n`;
    waText += `*Order No:* #${createdOrderNumber}\n`;
    waText += `*Invoice No:* ${billNumber}\n`;
    waText += `*Customer:* ${raw.customer.name}\n`;
    waText += `*Fulfillment:* ${typeStr}\n`;
    if (isPrepaid) {
      waText += `*Payment:* ✅ PAID ONLINE via Razorpay (${raw.payment_method || 'UPI'} - Ref: ${raw.payment_id || 'Instant'})\n`;
    } else {
      waText += `*Payment:* 💵 Pay at Counter / UPI\n`;
    }
    waText += `*Kitchen Status:* Preparing Freshly 👨‍🍳\n\n`;
    waText += `*─── ORDERED ITEMS ───*\n${itemsSummary}\n\n`;
    waText += `*─── BILLING BREAKDOWN ───*\n`;
    waText += `Item Total: ₹${grandTotal}\n`;
    if (taxAmount > 0) waText += `GST (5% Included): ₹${taxAmount}\n`;
    waText += `*TOTAL AMOUNT: ₹${grandTotal}*\n`;
    if (isPrepaid) {
      waText += `*Amount Paid:* ₹${paidAmount} (Paid in Full)\n`;
      waText += `*Balance Due:* ₹0.00\n\n`;
    } else {
      waText += `*Balance Due:* ₹${balance}\n\n`;
    }
    waText += `📄 *VIEW / DOWNLOAD OFFICIAL BILL RECEIPT:*\n`;
    waText += `👉 ${receiptUrl}\n`;
    waText += `_(Secure digital receipt link active for 4 days)_\n\n`;
    waText += `------------------------------------------\n`;
    waText += `${storeAddress}\n`;
    if (storePhone) waText += `Ph: ${storePhone}\n\n`;
    waText += `Thank you for visiting ${storeName}! ✨\n`;
    waText += `Powered by DinZin (dinzin.in)`;

    void sendOrderWhatsAppMessage({
      phone: raw.customer.phone,
      message: waText,
      billId,
      customerId: raw.customer.name,
    });
  } catch (waErr: any) {
    console.error('[OnlineOrders] Automatic WhatsApp trigger failed:', waErr?.message);
  }

  return { ok: true, orderId: createdOrderId, orderNumber: createdOrderNumber };
}

/** Poll pending online orders from shared host, process them, and send back acknowledgment */
export async function pollOnlineOrders(syncUrl: string, apiKey: string): Promise<number> {
  if (!syncUrl || !apiKey) return 0;

  try {
    const fetchUrl = syncUrl.includes('?')
      ? `${syncUrl}&action=get_orders`
      : `${syncUrl}?action=get_orders`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return 0;
    }

    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; orders?: RawOnlineOrder[] };
    const orders = data?.orders;
    if (!Array.isArray(orders) || orders.length === 0) {
      return 0;
    }

    console.log(`[OnlineOrders] Found ${orders.length} pending online order(s) on shared host`);
    const ackIds: string[] = [];

    for (const ord of orders) {
      if (!ord || !ord.order_id) continue;
      const result = await ingestOnlineOrder(ord);
      if (result.ok) {
        ackIds.push(ord.order_id);
      }
    }

    // Acknowledge processed orders with shared host
    if (ackIds.length > 0) {
      const ackUrl = syncUrl.includes('?')
        ? `${syncUrl}&action=ack_orders`
        : `${syncUrl}?action=ack_orders`;

      await fetch(ackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ order_ids: ackIds }),
      }).catch((e) => console.warn('[OnlineOrders] Ack failed:', e?.message));

      console.log(`[OnlineOrders] Acknowledged ${ackIds.length} processed order(s)`);
    }

    return ackIds.length;
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn('[OnlineOrders] Polling error:', err?.message || err);
    }
    return 0;
  }
}
