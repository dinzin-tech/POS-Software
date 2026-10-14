/**
 * Integration and contract tests for DinZin Live Sync to Shared Hosting.
 */
const Module = require('module');
const originalLoad = Module._load;
const fs = require('fs');
const os = require('os');
const path = require('path');
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flo-livesync-'));
Module._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === 'electron') return { app: { isPackaged: true, getPath: () => testDir, getVersion: () => 'test' } };
  return originalLoad.apply(this, arguments as any);
};

const {
  initTestDb, createApp, startServer, seedOwnerUser,
  api, assertEqual, assertOrThrow, getResults, closeDatabase,
} = require('./helpers/test-setup');
const { liveSyncRoutes } = require('../main/routes/live-sync');
const {
  getLiveSyncConfig,
  updateLiveSyncConfig,
  buildLiveSyncPayload,
  testLiveSyncConnection,
  stopLiveSync,
} = require('../main/services/live-sync');

async function main() {
  const db = initTestDb();
  const { authHeader } = seedOwnerUser(db);
  const app = createApp({ '/api/live-sync': liveSyncRoutes });
  const { baseUrl, server } = await startServer(app);

  try {
    // 1. Initial config defaults
    const initialConfig = getLiveSyncConfig();
    assertEqual(initialConfig.enabled, false, 'Live sync is initially disabled');
    assertEqual(initialConfig.syncUrl, '', 'Live sync URL is initially empty');
    assertEqual(initialConfig.apiKey, '', 'Live sync API key is initially empty');
    assertEqual(initialConfig.intervalSeconds, 30, 'Live sync default interval is 30s');

    // 2. Update config in database
    const updated = updateLiveSyncConfig({
      enabled: true,
      syncUrl: 'https://example.com/dashboard/sync.php',
      apiKey: 'test_secret_key_9988',
      intervalSeconds: 15,
    });
    assertEqual(updated.enabled, true, 'Updated config has enabled=true');
    assertEqual(updated.syncUrl, 'https://example.com/dashboard/sync.php', 'Updated sync URL saved');
    assertEqual(updated.apiKey, 'test_secret_key_9988', 'Updated API key saved');
    assertEqual(updated.intervalSeconds, 15, 'Updated interval saved');

    // 3. Verify persistence
    const reloaded = getLiveSyncConfig();
    assertEqual(reloaded.enabled, true, 'Config persists enabled status');
    assertEqual(reloaded.apiKey, 'test_secret_key_9988', 'Config persists API key');

    // 4. Test snapshot payload generation
    const payload = buildLiveSyncPayload();
    assertOrThrow(payload !== null && typeof payload === 'object', 'Payload is non-null object');
    assertOrThrow(payload.store && typeof payload.store.name === 'string', 'Payload contains store info');
    assertOrThrow(payload.today && typeof payload.today.net_sales === 'number', 'Payload contains today sales');
    assertOrThrow(payload.comparison && typeof payload.comparison.yesterday === 'object', 'Payload contains comparison metrics');
    assertOrThrow(payload.operations && typeof payload.operations.peak_hour === 'object', 'Payload contains operations & peak hour');
    assertOrThrow(Array.isArray(payload.categories), 'Payload categories is an array');
    assertOrThrow(Array.isArray(payload.staff_sales), 'Payload staff_sales is an array');
    assertOrThrow(Array.isArray(payload.recent_bills), 'Payload recent_bills is an array');
    assertOrThrow(Array.isArray(payload.active_orders), 'Payload active_orders is an array');
    assertOrThrow(Array.isArray(payload.payment_methods), 'Payload payment_methods is an array');
    assertOrThrow(Array.isArray(payload.hourly_sales), 'Payload hourly_sales is an array');
    assertEqual(payload.hourly_sales.length, 24, 'Payload hourly_sales has 24 hours');

    // 5. Test Live Sync API: GET /api/live-sync/config
    const resGet = await api(baseUrl, '/api/live-sync/config', {
      headers: authHeader,
    });
    assertEqual(resGet.status, 200, 'GET /api/live-sync/config returns 200 with auth');
    assertEqual(resGet.data.config.enabled, true, 'GET /api/live-sync/config returns current config');

    // 6. Test Live Sync API: POST /api/live-sync/config
    const resPost = await api(baseUrl, '/api/live-sync/config', {
      method: 'POST',
      headers: authHeader,
      body: { intervalSeconds: 45 },
    });
    assertEqual(resPost.status, 200, 'POST /api/live-sync/config returns 200');
    assertEqual(resPost.data.config.intervalSeconds, 45, 'POST updated interval to 45');

    // 7. Connection test rejects empty URL
    const testResult = await testLiveSyncConnection('', '');
    assertEqual(testResult.ok, false, 'testLiveSyncConnection rejects empty URL');

    const resTest = await api(baseUrl, '/api/live-sync/test', {
      method: 'POST',
      headers: authHeader,
      body: { syncUrl: '', apiKey: '' },
    });
    assertEqual(resTest.status, 200, 'POST /api/live-sync/test returns 200 response envelope');
    assertEqual(resTest.data.ok, false, 'POST /api/live-sync/test indicates failure for empty params');

    // 8. Test unauthenticated request rejection
    const unauth = await api(baseUrl, '/api/live-sync/config');
    assertEqual(unauth.status, 401, 'Unauthenticated GET /api/live-sync/config returns 401');

  } finally {
    stopLiveSync();
    server.close();
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
