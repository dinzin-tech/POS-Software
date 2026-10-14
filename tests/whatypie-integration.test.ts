/**
 * Integration and contract tests for WhatyPie WhatsApp API platform.
 */
const Module = require('module');
const originalLoad = Module._load;
const fs = require('fs');
const os = require('os');
const path = require('path');
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flo-whatypie-'));
Module._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === 'electron') return { app: { isPackaged: true, getPath: () => testDir, getVersion: () => 'test' } };
  return originalLoad.apply(this, arguments as any);
};

const {
  initTestDb, createApp, startServer, seedOwnerUser,
  api, assertEqual, assertOrThrow, getResults, closeDatabase,
} = require('./helpers/test-setup');
const { whatsappRoutes } = require('../main/routes/whatsapp');
const {
  cleanPhoneNumber,
  getWhatyPieConfig,
  updateWhatyPieConfig,
  testWhatyPieConnection,
  resolveTemplateVariables,
} = require('../main/services/whatypie');

async function main() {
  const db = initTestDb();
  const { authHeader } = seedOwnerUser(db);
  const app = createApp({ '/api/whatsapp': whatsappRoutes });
  const { baseUrl, server } = await startServer(app);

  try {
    // 1. Phone number cleaning tests
    assertEqual(cleanPhoneNumber('9876543210'), '919876543210', '10-digit Indian numbers auto-prefix country code 91');
    assertEqual(cleanPhoneNumber('+91 98765 43210'), '919876543210', 'formatted Indian numbers strip spaces and symbols');
    assertEqual(cleanPhoneNumber('15555550100'), '15555550100', '11-digit numbers retain full digits');

    // 2. Default seeded config
    const initialConfig = getWhatyPieConfig();
    assertEqual(initialConfig.provider, 'whatypie', 'default WhatsApp provider is whatypie');
    assertEqual(initialConfig.apiUrl, 'https://api.whatypie.in', 'default WhatyPie API URL is set');
    assertEqual(initialConfig.enabled, false, 'WhatyPie is initially disabled until configured');

    // 3. Update config in database
    const updated = updateWhatyPieConfig({
      enabled: true,
      apiUrl: 'https://custom-api.whatypie.in',
      apiKey: 'test-wpy-key-12345',
      senderPhone: '919876543210',
      sendOnBill: true,
      sendOnOrderStatus: true,
      templateOrderStatus: 'custom_order_status',
    });

    assertEqual(updated.enabled, true, 'updated config reflects enabled state');
    assertEqual(updated.apiUrl, 'https://custom-api.whatypie.in', 'updated API URL is saved');
    assertEqual(updated.apiKey, 'test-wpy-key-12345', 'updated API key is saved');
    assertEqual(updated.senderPhone, '919876543210', 'updated sender phone is saved');
    assertEqual(updated.templateOrderStatus, 'custom_order_status', 'updated template name is saved');

    // Verify persistence across read
    const reloaded = getWhatyPieConfig();
    assertEqual(reloaded.apiKey, 'test-wpy-key-12345', 'config persists in SQLite database');
    assertEqual(reloaded.apiUrl, 'https://custom-api.whatypie.in', 'API URL persists in SQLite database');

    // 4. API Endpoints
    // GET /api/whatsapp/whatypie/config
    const getRes = await api(baseUrl, '/api/whatsapp/whatypie/config', { headers: authHeader });
    assertEqual(getRes.status, 200, 'GET /api/whatsapp/whatypie/config succeeds with auth');
    assertEqual(getRes.data.config.apiKey, 'test-wpy-key-12345', 'API returns current WhatyPie config');

    // POST /api/whatsapp/whatypie/config
    const postRes = await api(baseUrl, '/api/whatsapp/whatypie/config', {
      method: 'POST',
      headers: authHeader,
      body: {
        apiUrl: 'https://api.whatypie.in',
        apiKey: 'new-key-67890',
        sendOnBill: false,
      },
    });
    assertEqual(postRes.status, 200, 'POST /api/whatsapp/whatypie/config updates configuration');
    assertEqual(postRes.data.config.apiKey, 'new-key-67890', 'POST returned updated key');
    assertEqual(postRes.data.config.sendOnBill, false, 'POST returned updated sendOnBill flag');

    // POST /api/whatsapp/whatypie/test with missing API key
    const testEmptyRes = await api(baseUrl, '/api/whatsapp/whatypie/test', {
      method: 'POST',
      headers: authHeader,
      body: { apiKey: '' },
    });
    assertEqual(testEmptyRes.data.ok, false, 'test endpoint rejects empty API key');
    assertOrThrow(Boolean(testEmptyRes.data.error), 'test endpoint returns error description');

    // Direct service probe test with empty key
    const directTestRes = await testWhatyPieConnection('https://api.whatypie.in', '');
    assertEqual(directTestRes.ok, false, 'direct testWhatyPieConnection rejects empty key');

    // 5. Template variables resolution and count matching (Meta #132000 prevention)
    const mockFiveStarTemplate = {
      name: 'five_start_bill_receipt',
      language: 'en_US',
      category: 'UTILITY',
      status: 'approved',
      bodyVariables: [{ key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }],
      body: '🧾 *BILL RECEIPT - {{1}}* *Bill #:* {{2}} *Total Paid:* {{3}} {{4}} Thanks for dining with us! Hope you enjoyed your meal. Visit us again soon for more delicious food! 🍽️🙏',
    };

    const resolved = resolveTemplateVariables(
      mockFiveStarTemplate,
      {
        businessName: 'Five Star',
        orderNumber: 'TOK-0001',
        billNumber: 'TOK-0001',
        totalAmount: '225.00',
        currency: 'INR',
        currencySymbol: '₹',
        customerName: 'Charan',
        stageLabel: 'Confirmed',
      },
      ['TOK-0001', 'Confirmed', 'Five Star'],
    );

    assertEqual(resolved.length, 4, 'five_start_bill_receipt always resolves exactly 4 variables');
    assertEqual(resolved[0], 'Five Star', 'variable 1 maps to business name');
    assertEqual(resolved[1], 'TOK-0001', 'variable 2 maps to bill or order number');
    assertEqual(resolved[2], '225.00', 'variable 3 maps to total amount');
    assertEqual(resolved[3], 'INR', 'variable 4 maps to currency');

    // Test padding when template expects more variables than provided
    const padded = resolveTemplateVariables(
      {
        name: 'custom_status',
        language: 'en',
        category: 'UTILITY',
        status: 'approved',
        bodyVariables: [{ key: '1' }, { key: '2' }, { key: '3' }],
        body: 'Update: {{1}} {{2}} {{3}}',
      },
      { businessName: 'Five Star', orderNumber: 'TOK-0001' },
      ['TOK-0001'],
    );
    assertEqual(padded.length, 3, 'under-specified parameters are padded to expected count to prevent #132000');
    assertOrThrow(padded.every((v: string) => Boolean(v && v.trim())), 'all resolved variables are non-empty strings');
  } finally {
    server.close();
    closeDatabase();
    fs.rmSync(testDir, { recursive: true, force: true });
    Module._load = originalLoad;
  }

  const results = getResults();
  if (results.failed > 0) process.exit(1);
}

main().catch((error: any) => {
  console.error(error);
  Module._load = originalLoad;
  fs.rmSync(testDir, { recursive: true, force: true });
  process.exit(1);
});
