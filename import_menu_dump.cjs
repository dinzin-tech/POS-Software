#!/usr/bin/env node
/**
 * FloCafe / Five Star Chicken Menu Importer for Client POS
 *
 * Usage:
 *   node import_menu_dump.cjs [optional_path_to_flo.db]
 *
 * Safe: Creates a backup before importing and soft-deletes old menu items
 *       without touching orders, customers, settings, or bills.
 */

const fs = require('fs');
const path = require('path');

// Try finding better-sqlite3 or sqlite3
let Database;
try {
  Database = require('better-sqlite3');
} catch {
  try {
    // Check local node_modules
    Database = require(path.join(__dirname, 'node_modules/better-sqlite3'));
  } catch (err) {
    console.error('Error: "better-sqlite3" module not found. Run this script inside your FloCafe project root or run: npm install better-sqlite3');
    process.exit(1);
  }
}

// Locate client's flo.db
function findClientDbPath(customPath) {
  if (customPath && fs.existsSync(customPath)) {
    return path.resolve(customPath);
  }

  const candidatePaths = [
    path.join(__dirname, 'flo.db'),
    path.join(process.cwd(), 'flo.db'),
    // Windows AppData
    process.env.APPDATA ? path.join(process.env.APPDATA, 'dinzin-desktop', 'flo.db') : null,
    process.env.APPDATA ? path.join(process.env.APPDATA, 'FloCafe', 'flo.db') : null,
    // Linux config
    process.env.HOME ? path.join(process.env.HOME, '.config', 'dinzin-desktop', 'flo.db') : null,
    // macOS Application Support
    process.env.HOME ? path.join(process.env.HOME, 'Library', 'Application Support', 'dinzin-desktop', 'flo.db') : null,
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

const targetDbPath = findClientDbPath(process.argv[2]);

if (!targetDbPath) {
  console.error('Error: Could not find flo.db automatically.');
  console.error('Please specify the path to flo.db: node import_menu_dump.cjs <path/to/flo.db>');
  process.exit(1);
}

const dumpFilePath = path.join(__dirname, 'menu_dump.json');
if (!fs.existsSync(dumpFilePath)) {
  console.error(`Error: Dump file not found at: ${dumpFilePath}`);
  process.exit(1);
}

console.log(`[Target DB] Using database: ${targetDbPath}`);

// 1. Create safety backup
const backupPath = path.join(path.dirname(targetDbPath), `flo-backup-pre-menu-${Date.now()}.db`);
fs.copyFileSync(targetDbPath, backupPath);
console.log(`[Backup] Safe backup created at: ${backupPath}`);

// 2. Load dump data
const dumpData = JSON.parse(fs.readFileSync(dumpFilePath, 'utf8'));
const categories = dumpData.categories || [];
const products = dumpData.products || [];

const db = new Database(targetDbPath);
db.pragma('journal_mode = WAL');

db.transaction(() => {
  // Step 1: Soft-delete existing active products so order history remains intact
  db.prepare("UPDATE products SET deleted_at = datetime('now') WHERE deleted_at IS NULL").run();
  console.log('[Import] Existing menu products safely archived (order history intact).');

  // Step 2: Upsert categories
  const upsertCat = db.prepare(`
    INSERT INTO categories (
      id, name, slug, icon, color, sort_order, is_active, deleted_at, created_at, updated_at
    ) VALUES (
      @id, @name, @slug, @icon, @color, @sort_order, 1, NULL, datetime('now'), datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      icon = excluded.icon,
      color = excluded.color,
      sort_order = excluded.sort_order,
      is_active = 1,
      deleted_at = NULL,
      updated_at = datetime('now')
  `);

  for (const cat of categories) {
    upsertCat.run({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.id.replace('cat-', ''),
      icon: cat.icon || '🍗',
      color: cat.color || '#E11D48',
      sort_order: cat.sort_order || 1,
    });
  }
  console.log(`[Import] Upserted ${categories.length} categories.`);

  // Step 3: Upsert products
  const upsertProd = db.prepare(`
    INSERT INTO products (
      id, category_id, name, description, price,
      sale_unit, is_active, sort_order, track_inventory, stock_quantity,
      tax_type, tax_rate, tax_category_id, tax_behavior, cb_percent,
      image_url, tags, deleted_at, created_at, updated_at
    ) VALUES (
      @id, @category_id, @name, @description, @price,
      'each', 1, @sort_order, 0, 0,
      'none', 0, 'standard', 'country_default', 0,
      @image_url, @tags, NULL, datetime('now'), datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      category_id = excluded.category_id,
      name = excluded.name,
      description = excluded.description,
      price = excluded.price,
      is_active = 1,
      sort_order = excluded.sort_order,
      image_url = excluded.image_url,
      tags = excluded.tags,
      deleted_at = NULL,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const p of products) {
    upsertProd.run({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      sort_order: p.sort_order || 0,
      image_url: p.image_url || null,
      tags: typeof p.tags === 'string' ? p.tags : JSON.stringify(p.tags || []),
    });
    count++;
  }
  console.log(`[Import] Successfully imported ${count} menu products.`);
})();

db.close();
console.log('✅ Menu import completed successfully!');
