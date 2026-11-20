const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../flo.db');
const db = new Database(DB_PATH, { readonly: true });

// 1. Fetch active categories
const categories = db.prepare(`
  SELECT id, name, slug, icon, color, sort_order, is_active
  FROM categories
  WHERE deleted_at IS NULL
  ORDER BY sort_order ASC
`).all();

// 2. Fetch active products
const products = db.prepare(`
  SELECT id, category_id, name, description, price, sale_unit,
         is_active, sort_order, track_inventory, stock_quantity,
         tax_type, tax_rate, tax_category_id, tax_behavior, cb_percent,
         image_url, tags
  FROM products
  WHERE deleted_at IS NULL
  ORDER BY sort_order ASC
`).all();

console.log(`Fetched ${categories.length} categories and ${products.length} products from flo.db.`);

// 3. Generate menu_dump.json
const dumpJson = {
  version: '1.0.0',
  exported_at: new Date().toISOString(),
  store_brand: 'Five Star Chicken',
  categories,
  products,
};

fs.writeFileSync(path.join(__dirname, '../menu_dump.json'), JSON.stringify(dumpJson, null, 2), 'utf8');
console.log('Generated menu_dump.json successfully.');

// 4. Generate menu_dump.sql
function sqlEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  return "'" + String(val).replace(/'/g, "''") + "'";
}

let sql = `-- FloCafe Menu Dump for Client POS
-- Brand: Five Star Chicken (62 items, 8 categories)
-- Safe import: Soft-deletes previous menu items without touching orders, bills, or customers.

BEGIN TRANSACTION;

-- Step 1: Safely soft-delete existing products so past order history remains valid
UPDATE products SET deleted_at = datetime('now') WHERE deleted_at IS NULL;

-- Step 2: Insert or update categories
`;

for (const c of categories) {
  sql += `INSERT INTO categories (id, name, slug, icon, color, sort_order, is_active, deleted_at, created_at, updated_at)
VALUES (${sqlEscape(c.id)}, ${sqlEscape(c.name)}, ${sqlEscape(c.slug)}, ${sqlEscape(c.icon)}, ${sqlEscape(c.color)}, ${c.sort_order}, 1, NULL, datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = 1,
  deleted_at = NULL,
  updated_at = datetime('now');\n`;
}

sql += `\n-- Step 3: Insert or update products with full Base64 images and tags\n`;

for (const p of products) {
  sql += `INSERT INTO products (
  id, category_id, name, description, price, sale_unit,
  is_active, sort_order, track_inventory, stock_quantity,
  tax_type, tax_rate, tax_category_id, tax_behavior, cb_percent,
  image_url, tags, deleted_at, created_at, updated_at
) VALUES (
  ${sqlEscape(p.id)}, ${sqlEscape(p.category_id)}, ${sqlEscape(p.name)}, ${sqlEscape(p.description)}, ${p.price}, 'each',
  1, ${p.sort_order}, 0, 0,
  'none', 0, 'standard', 'country_default', 0,
  ${sqlEscape(p.image_url)}, ${sqlEscape(p.tags)}, NULL, datetime('now'), datetime('now')
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
  updated_at = datetime('now');\n`;
}

sql += `\nCOMMIT;\n`;

fs.writeFileSync(path.join(__dirname, '../menu_dump.sql'), sql, 'utf8');
console.log('Generated menu_dump.sql successfully (' + (fs.statSync(path.join(__dirname, '../menu_dump.sql')).size / 1024).toFixed(1) + ' KB).');

db.close();
