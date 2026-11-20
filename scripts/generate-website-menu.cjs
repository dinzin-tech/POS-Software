const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../import_new_menu.cjs'), 'utf8');
const pStart = content.indexOf('const PRODUCTS = [');
const pEnd = content.indexOf('];', pStart) + 2;
const prods = new Function(content.slice(pStart, pEnd) + '; return PRODUCTS;')();

const catMap = {
  'cat-combos': { slug: 'combos', name: 'Value Combos & Feasts' },
  'cat-signature': { slug: 'signature', name: 'Signature Fried Chicken' },
  'cat-burgers': { slug: 'burgers', name: 'Burgers & Wraps' },
  'cat-veggie': { slug: 'veggie', name: 'Veggie Surprise' },
  'cat-bowls': { slug: 'bowls', name: 'Rice Bowls & Sandwiches' },
  'cat-snacks': { slug: 'snacks', name: 'Snack Attack' },
  'cat-desserts': { slug: 'desserts', name: 'Desserts & Treats' },
  'cat-beverages': { slug: 'beverages', name: 'Shakes & Coolers' },
};

const menuCategories = [
  { id: 'all', name: 'All Specialties' },
  { id: 'combos', name: 'Value Combos & Feasts' },
  { id: 'signature', name: 'Signature Fried Chicken' },
  { id: 'burgers', name: 'Burgers & Wraps' },
  { id: 'veggie', name: 'Veggie Surprise' },
  { id: 'bowls', name: 'Rice Bowls & Sandwiches' },
  { id: 'snacks', name: 'Snack Attack' },
  { id: 'desserts', name: 'Desserts & Treats' },
  { id: 'beverages', name: 'Shakes & Coolers' },
];

const menuItems = prods.map(p => {
  const cat = catMap[p.category_id] || { slug: 'combos', name: 'Combos' };
  const tags = p.tags || [];
  const isVeg = tags.includes('veg');
  const isBestseller = tags.includes('bestseller');
  const isHalal = !isVeg && (tags.includes('halal') || p.name.toLowerCase().includes('chicken') || p.description.toLowerCase().includes('chicken'));
  let spiceLevel = 'mild';
  if (tags.includes('peri_peri') || tags.includes('peri-peri')) spiceLevel = 'peri-peri';
  else if (tags.includes('hot') || tags.includes('spicy')) spiceLevel = 'hot';
  else if (tags.includes('medium')) spiceLevel = 'medium';

  let serves = undefined;
  if (tags.includes('serves_1') || p.name.includes('(Serves 1)')) serves = 'Serves 1';
  if (tags.includes('serves_2') || p.name.includes('(Serves 2)')) serves = 'Serves 2';
  if (p.name.includes('8 Pcs') || p.name.includes('6 Pcs')) serves = '3–4 People';

  let portion = undefined;
  const pcsMatch = p.name.match(/\((\d+)\s*Pcs?\)/i) || p.name.match(/(\d+)\s*Pcs?/i);
  if (pcsMatch) portion = pcsMatch[0].replace(/[()]/g, '');

  const itemObj = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: cat.slug,
    categoryName: cat.name,
    image: '/images/menu/' + p.image_file,
    tags: tags.map(t => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
    spiceLevel,
    isBestseller: isBestseller || undefined,
    isVeg: isVeg || undefined,
    isHalalChicken: isHalal || undefined,
    serves: serves || undefined,
    portion: portion || undefined,
  };
  return itemObj;
});

// Format TypeScript file
const tsContent = `import { MenuItem } from '@/types';

export const menuCategories = ${JSON.stringify(menuCategories, null, 2)} as const;

export const menuItems: MenuItem[] = ${JSON.stringify(menuItems, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../website/src/data/menu.ts'), tsContent, 'utf8');
console.log('[Website] Updated website/src/data/menu.ts with 62 items and 8 categories.');

// Format JSON catalog for shared hosting / mobile
const catalogCategories = menuCategories.filter(c => c.id !== 'all').map((c, i) => ({
  id: 'cat-' + c.id,
  name: c.name,
  slug: c.id,
  description: null,
  image_url: null,
  sort_order: i + 1,
}));

const catalogItems = menuItems.map(m => ({
  id: m.id,
  name: m.name,
  description: m.description,
  price: m.price,
  category: m.category,
  category_name: m.categoryName,
  category_id: 'cat-' + m.category,
  image: m.image,
  tags: m.tags,
  spiceLevel: m.spiceLevel,
  isBestseller: !!m.isBestseller,
  isVeg: !!m.isVeg,
  isHalalChicken: !!m.isHalalChicken,
  stock_status: 'in_stock',
  stock_quantity: null,
  low_stock_threshold: null,
  track_inventory: false,
  is_active: true,
}));

const catalogData = {
  synced_at: new Date().toISOString(),
  store_name: 'Five Star Chicken Nelamangala',
  categories: catalogCategories,
  items: catalogItems,
};

const catalogJson = JSON.stringify(catalogData, null, 2);

const targetPaths = [
  path.join(__dirname, '../sharedhost-mobile/data/menu_catalog.json'),
  path.join(__dirname, '../dist-deploy/dashboard/data/menu_catalog.json'),
  path.join(__dirname, '../dist-deploy/sharedhost-mobile/data/menu_catalog.json'),
  path.join(__dirname, '../dist-deploy/data/menu_catalog.json'),
];

for (const p of targetPaths) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p, catalogJson, 'utf8');
  console.log('[Catalog] Synced catalog to: ' + p);
}
