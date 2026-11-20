/**
 * Verification test for online order ingestion, idempotency, and sequence synchronization.
 */
const Module = require('module');
const originalLoad = Module._load;
const fs = require('fs');
const os = require('os');
const path = require('path');
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flo-online-orders-'));
Module._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === 'electron') return { app: { isPackaged: true, getPath: () => testDir, getVersion: () => 'test' } };
  return originalLoad.apply(this, arguments as any);
};

const {
  initTestDb, seedOwnerUser,
  assertEqual, assertOrThrow, getResults, closeDatabase,
} = require('./helpers/test-setup');
const { ingestOnlineOrder } = require('../main/services/online-orders');

async function main() {
  const db = initTestDb();
  seedOwnerUser(db);

  try {
    // 1. Simulate an old historical order with order_number 'TOK-0002' from 3 days ago (like Order #56)
    db.prepare(`
      INSERT INTO orders (
        order_number, external_order_id, special_instructions, status,
        subtotal, tax_amount, delivery_charge, total, online_platform,
        created_at, updated_at
      ) VALUES (
        'TOK-0002', 'TOK-0002', '[Online: TOK-0002] Takeaway [PAID: online - Ref: pay_old]',
        'completed', 100, 5, 0, 105, 'website',
        datetime('now', '-3 days'), datetime('now', '-3 days')
      )
    `).run();

    // 2. Ingest a brand new order from website with globally unique order_id and order_number 'TOK-0002'
    const newOrder1 = {
      order_id: 'WEB-261120-110509-0002',
      order_number: 'TOK-0002',
      source: 'website',
      customer: {
        name: 'Charan Test',
        phone: '9353333945',
        address: 'Nelamangala',
      },
      order_type: 'takeaway',
      items: [
        { id: 'item-1', name: 'Hot Crispy Chicken', price: 150, quantity: 2, total: 300 },
      ],
      total: 300,
      payment_status: 'paid',
      payment_method: 'online',
      payment_id: 'pay_test_12345',
    };

    const res1 = await ingestOnlineOrder(newOrder1);
    assertOrThrow(res1.ok === true, 'Order 1 ingestion should succeed');
    assertOrThrow(typeof res1.orderId === 'number', 'Order 1 got valid orderId');
    assertEqual(res1.orderNumber, 'TOK-0002', 'Order 1 kept candidate token TOK-0002 because old TOK-0002 is historical');

    const createdOrder1 = db.prepare('SELECT * FROM orders WHERE id = ?').get(res1.orderId);
    assertEqual(createdOrder1.external_order_id, 'WEB-261120-110509-0002', 'External order id matches unique WEB id');
    assertEqual(createdOrder1.order_number, 'TOK-0002', 'Order number in DB matches TOK-0002');
    assertEqual(createdOrder1.status, 'pending', 'New order is marked pending');

    // 3. Test Idempotency: Attempting to ingest the EXACT same order_id again should NOT duplicate
    const resDuplicate = await ingestOnlineOrder(newOrder1);
    assertEqual(resDuplicate.ok, true, 'Duplicate ingestion returns ok=true');
    assertEqual(resDuplicate.orderId, res1.orderId, 'Duplicate ingestion returns same orderId');
    const countOrders = db.prepare('SELECT count(*) as count FROM orders WHERE external_order_id = ?').get('WEB-261120-110509-0002').count;
    assertEqual(countOrders, 1, 'Duplicate ingestion did not insert another row');

    // 4. Test Token Collision Prevention on SAME day:
    // If another order arrives today also asking for 'TOK-0002', it should get the NEXT sequence number
    const newOrder2 = {
      order_id: 'WEB-261120-110610-0002',
      order_number: 'TOK-0002',
      source: 'website',
      customer: {
        name: 'Another Customer',
        phone: '9886426278',
      },
      order_type: 'takeaway',
      items: [
        { id: 'item-2', name: 'Rolls', price: 100, quantity: 1, total: 100 },
      ],
      total: 100,
      payment_status: 'unpaid',
      payment_method: 'cash',
    };

    const res2 = await ingestOnlineOrder(newOrder2);
    assertOrThrow(res2.ok === true, 'Order 2 ingestion should succeed');
    assertOrThrow(res2.orderNumber !== 'TOK-0002', 'Order 2 generated a fresh token number to prevent same-day collision');
    assertOrThrow(res2.orderId !== res1.orderId, 'Order 2 created a distinct order');

    // 5. Test Backward Compatibility: An older legacy order with short token 'TOK-0003'
    const legacyOrder = {
      order_id: 'TOK-0003',
      order_number: 'TOK-0003',
      source: 'website',
      customer: {
        name: 'Legacy Token Customer',
        phone: '9123456789',
      },
      order_type: 'takeaway',
      items: [
        { id: 'item-3', name: 'Burger', price: 90, quantity: 1, total: 90 },
      ],
      total: 90,
      payment_status: 'paid',
      payment_method: 'online',
    };

    const res3 = await ingestOnlineOrder(legacyOrder);
    assertEqual(res3.ok, true, 'Legacy token order ingested successfully');
    assertEqual(res3.orderNumber, 'TOK-0003', 'Legacy token order assigned TOK-0003');

    // Legacy duplicate within same day is caught
    const res3Dup = await ingestOnlineOrder(legacyOrder);
    assertEqual(res3Dup.ok, true, 'Legacy duplicate ingestion returns ok=true');
    assertEqual(res3Dup.orderId, res3.orderId, 'Legacy duplicate matches existing order');

    console.log('All online order ingestion and idempotency tests passed successfully!');
  } finally {
    closeDatabase();
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  const results = getResults();
  if (results.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});

