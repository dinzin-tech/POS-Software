#!/usr/bin/env node
/**
 * DinZin POS / FloCafe - Clear Orders & Related Payments Data Script
 *
 * Safely clears all transactional order, billing, payment, and receipt data from the SQLite database.
 * Preserves products, categories, addons, users, permissions, taxes, printers, and store settings.
 *
 * Usage:
 *   node scripts/clear-orders-data.cjs
 *   node scripts/clear-orders-data.cjs --yes
 *   node scripts/clear-orders-data.cjs --include-cash-sessions
 *   node scripts/clear-orders-data.cjs --db "C:\path\to\flo.db"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

// ── SQLite Engine Loader (supports built-in node:sqlite or better-sqlite3) ────
let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch {
  try {
    DatabaseSync = require('better-sqlite3');
  } catch {
    // Automatically respawn node with --experimental-sqlite if not yet enabled
    const res = spawnSync(process.execPath, ['--experimental-sqlite', __filename, ...process.argv.slice(2)], {
      stdio: 'inherit',
    });
    process.exit(res.status ?? 0);
  }
}

// ── Target Tables ────────────────────────────────────────────────────────────
const ORDER_PAYMENT_TABLES = [
  // Order items & addons
  'order_item_addons',
  'order_items',
  'order_audit_log',
  'order_idempotency',
  'order_idempotency_scoped',
  'orders_v99',
  'orders',
  'held_orders',

  // Bills & payments
  'bill_items',
  'refund_idempotency',
  'refunds',
  'payment_transaction_ref_conflicts',
  'payment_transaction_refs',
  'payment_transaction_refs_global',
  'payment_transaction_refs_method',
  'payment_transaction_refs_repaired',
  'payment_idempotency',
  'payment_idempotency_scoped',
  'payment_method_merges',
  'bills',

  // Linked print logs & notifications
  'print_logs',
  'loyalty_ledger',
  'whatsapp_messages',
  'cloud_sync_outbox',
];

const CASH_SESSION_TABLES = [
  'cash_closures',
  'cash_drawer_movements',
  'cash_sessions',
];

// ── Helper Functions ─────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let customPath = null;
  let includeCashSessions = false;
  let autoConfirm = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--db' && i + 1 < args.length) {
      customPath = args[++i];
    } else if (arg === '--include-cash-sessions') {
      includeCashSessions = true;
    } else if (arg === '-y' || arg === '--yes') {
      autoConfirm = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return { customPath, includeCashSessions, autoConfirm };
}

function printHelp() {
  console.log(`
Usage: node scripts/clear-orders-data.cjs [options]

Options:
  --db <path>               Path to custom flo.db file
  --include-cash-sessions   Also clear cash drawer movements, sessions, and closures
  -y, --yes                 Skip confirmation prompt
  -h, --help                Show this help message
`);
}

function findDatabasePath(customPath) {
  if (customPath) {
    const resolved = path.resolve(customPath);
    if (fs.existsSync(resolved)) return resolved;
    console.error(`Error: Database file not found at: ${customPath}`);
    process.exit(1);
  }

  const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library/Application Support') : '');

  const candidates = [
    path.join(appData, 'dinzin-desktop', 'flo.db'),
    path.resolve(process.cwd(), 'flo.db'),
    path.join(appData, 'com.dinzin.desktop', 'flo.db'),
    path.join(appData, 'DinZin', 'flo.db'),
    path.join(appData, 'Flo Cafe', 'flo.db'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  console.error('Error: Could not find flo.db in standard application directories.');
  console.error('Please specify the path using: --db <path-to-flo.db>');
  process.exit(1);
}

function getExistingTables(db) {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return new Set(rows.map((r) => r.name));
}

function getTableCounts(db, tables) {
  const existing = getExistingTables(db);
  const counts = {};
  for (const t of tables) {
    if (existing.has(t)) {
      try {
        const row = db.prepare(`SELECT COUNT(*) as count FROM "${t}"`).get();
        counts[t] = Number(row.count ?? 0);
      } catch {
        // Ignore unreadable tables
      }
    }
  }
  return counts;
}

function backupDatabase(dbPath) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const backupPath = `${dbPath}.backup_${timestamp}`;

  console.log('\n[1/4] Creating safety backup of database...');
  fs.copyFileSync(dbPath, backupPath);
  console.log(`      Backup saved to: ${backupPath}`);
  return backupPath;
}

function askConfirmation(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Main Execution ───────────────────────────────────────────────────────────
async function main() {
  const { customPath, includeCashSessions, autoConfirm } = parseArgs();
  const dbPath = findDatabasePath(customPath);

  console.log('='.repeat(70));
  console.log('  DinZin POS - Clear Orders & Payments Data');
  console.log('='.repeat(70));
  console.log(`Database: ${dbPath}`);

  const db = new DatabaseSync(dbPath);

  const tablesToClear = [...ORDER_PAYMENT_TABLES];
  if (includeCashSessions) {
    tablesToClear.push(...CASH_SESSION_TABLES);
  }

  const countsBefore = getTableCounts(db, tablesToClear);
  const totalRecords = Object.values(countsBefore).reduce((sum, n) => sum + n, 0);

  console.log('\nCurrent records to be cleared:');
  let hasRecords = false;
  for (const [tbl, cnt] of Object.entries(countsBefore)) {
    if (cnt > 0) {
      hasRecords = true;
      console.log(`  - ${tbl.padEnd(35)}: ${cnt} rows`);
    }
  }
  if (!hasRecords) {
    console.log('  (All order and payment tables are currently empty: 0 records)');
  }

  if (!includeCashSessions) {
    console.log('\nNote: Cash drawer sessions and closure reports are preserved.');
    console.log('      (Pass --include-cash-sessions if you also want to clear drawer sessions).');
  } else {
    console.log('\nNote: Cash drawer sessions and closure reports WILL ALSO be cleared.');
  }

  console.log('\nPreserved data:');
  console.log('  ✓ Products, Categories, Addons & Modifiers');
  console.log('  ✓ Store Settings, Users, Roles & Passwords');
  console.log('  ✓ Printers, Tax Rules & System Configuration');
  console.log('  ✓ Tables structure (statuses will be reset to available)');

  if (!autoConfirm) {
    console.log('\n' + '!'.repeat(70));
    console.log('WARNING: This will permanently delete all order, bill, and payment records.');
    const response = await askConfirmation("Type 'CLEAR' to proceed, or press Enter to cancel: ");
    if (response !== 'CLEAR') {
      console.log('Operation cancelled. No changes made.');
      db.close();
      process.exit(0);
    }
  }

  // Step 1: Backup
  backupDatabase(dbPath);

  // Step 2: Clear inside transaction
  console.log('\n[2/4] Clearing records inside database transaction...');
  const existing = getExistingTables(db);

  try {
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec('BEGIN TRANSACTION;');

    for (const tbl of tablesToClear) {
      if (existing.has(tbl)) {
        db.exec(`DELETE FROM "${tbl}";`);
      }
    }

    // Reset table occupancy
    if (existing.has('tables')) {
      db.exec("UPDATE tables SET status = 'available', reservation_customer_id = NULL;");
    }

    // Reset daily sequences (token numbers, order numbering, bill numbers)
    if (existing.has('sequences')) {
      db.exec("DELETE FROM sequences WHERE name LIKE '%order%' OR name LIKE '%token%' OR name LIKE '%bill%' OR name LIKE '%kot%';");
    }

    // Reset sqlite_sequence autoincrement counters for cleared tables
    if (existing.has('sqlite_sequence')) {
      const escapedNames = tablesToClear.map((t) => `'${t}'`).join(',');
      db.exec(`DELETE FROM sqlite_sequence WHERE name IN (${escapedNames});`);
    }

    db.exec('COMMIT;');
    console.log('      All order and payment tables cleared successfully.');

    // Step 3: Integrity Check
    db.exec('PRAGMA foreign_keys = ON;');
    const fkErrors = db.prepare('PRAGMA foreign_key_check;').all();
    if (fkErrors && fkErrors.length > 0) {
      console.warn(`      Warning: Foreign key check reported ${fkErrors.length} inconsistencies.`);
    } else {
      console.log('      Foreign key integrity check passed.');
    }
  } catch (err) {
    try {
      db.exec('ROLLBACK;');
    } catch {}
    console.error('\nError occurred during deletion:', err);
    console.error('Transaction rolled back. No changes were committed.');
    db.close();
    process.exit(1);
  }

  // Step 4: VACUUM to reclaim disk space
  console.log('\n[3/4] Reclaiming unused disk space (VACUUM)...');
  try {
    db.exec('VACUUM;');
    console.log('      Database optimized and compacted.');
  } catch (e) {
    console.log(`      Vacuum skipped: ${e.message}`);
  }

  // Step 5: Verification
  console.log('\n[4/4] Verifying cleared tables...');
  const countsAfter = getTableCounts(db, tablesToClear);
  const remaining = Object.values(countsAfter).reduce((sum, n) => sum + n, 0);
  db.close();

  if (remaining === 0) {
    console.log('      Verified: All order and payment tables now have 0 rows.');
  } else {
    console.warn(`      Warning: ${remaining} records remaining in tables.`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUCCESS: Orders and payments data have been completely cleared.');
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
