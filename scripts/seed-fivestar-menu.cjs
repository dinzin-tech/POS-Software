/**
 * Seed FloCafe POS SQLite Database (`flo.db`) with Five Star Chicken Restaurant categories and menu items.
 * Usage: node scripts/seed-fivestar-menu.cjs
 */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../flo.db');
const db = new Database(dbPath);

console.log(`Connecting to database at ${dbPath}...`);

// Categories
const categories = [
  { id: 'cat-signature', name: 'Signature Range', slug: 'signature', sort_order: 1 },
  { id: 'cat-combos', name: 'Snack Packs & Feasts', slug: 'combos', sort_order: 2 },
  { id: 'cat-burgers', name: 'Burgers & Wraps', slug: 'burgers', sort_order: 3 },
  { id: 'cat-bowls', name: 'Bowls & Sandwiches', slug: 'bowls', sort_order: 4 },
  { id: 'cat-snacks', name: 'Snack Attack', slug: 'snacks', sort_order: 5 },
  { id: 'cat-veggie', name: 'Veggie Delight', slug: 'veggie', sort_order: 6 },
  { id: 'cat-beverages', name: "Sip n' Slurp", slug: 'beverages', sort_order: 7 },
  { id: 'cat-desserts', name: 'Sweet Treats', slug: 'desserts', sort_order: 8 },
];

const upsertCat = db.prepare(`
  INSERT INTO categories (id, name, slug, sort_order, is_active, created_at, updated_at)
  VALUES (@id, @name, @slug, @sort_order, 1, datetime('now'), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    slug = excluded.slug,
    sort_order = excluded.sort_order,
    is_active = 1,
    updated_at = datetime('now')
`);

db.transaction(() => {
  for (const cat of categories) {
    upsertCat.run(cat);
  }
})();
console.log(`✅ Seeded ${categories.length} categories.`);

// Products
const products = [
  // Signature Range
  {
    id: 'sig-bucket-8',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (8 Pcs Bucket)',
    description: 'Golden-crusted, tender bone-in chicken marinated in secret aromatic herbs and pressure-fried to seal in maximum juices. Serves 3-4.',
    price: 699,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Bestseller, Party Size, Pressure Fried, Halal',
    sort_order: 1,
  },
  {
    id: 'sig-peri-8',
    category_id: 'cat-signature',
    name: 'Peri Peri Fiery Chicken (8 Pcs Bucket)',
    description: 'Crispy bone-in chicken tossed in our explosive African bird’s eye peri-peri spice dust for bold, fiery heat. Serves 3-4.',
    price: 699,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Spicy Delight, Chef Special, Halal, Peri-Peri',
    sort_order: 2,
  },
  {
    id: 'sig-bucket-6',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (6 Pcs Bucket)',
    description: 'Six signature crispy fried chicken pieces with our golden crunchy breading and succulent center.',
    price: 529,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Value Share, Halal',
    sort_order: 3,
  },
  {
    id: 'sig-box-4',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (4 Pcs Box)',
    description: 'Four succulent pieces of original recipe golden fried chicken with peri-peri sprinkle sachet.',
    price: 359,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Duo Pack, Halal',
    sort_order: 4,
  },
  {
    id: 'sig-drum-2',
    category_id: 'cat-signature',
    name: 'Crispy Chicken Drumsticks (2 Pcs)',
    description: 'Two prime drumsticks with our signature crunch and tender seasoned interior.',
    price: 189,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Quick Bite, Halal',
    sort_order: 5,
  },
  {
    id: 'sig-pc-1',
    category_id: 'cat-signature',
    name: 'Crispy Fried Chicken (1 Pc)',
    description: 'A single cut of freshly fried crispy chicken piece.',
    price: 99,
    image_url: '/images/menu/signature-chicken-bucket.jpg',
    tags: 'Single, Halal',
    sort_order: 6,
  },

  // Combos & Feasts
  {
    id: 'combo-beast-feast',
    category_id: 'cat-combos',
    name: 'Beast Feast (Serves 2)',
    description: 'The ultimate monster combo: 2 Pcs Fried Chicken, 2 Classic Burgers, 1 French Fries (Reg), 6 Pcs Chicken Cheese Shots, and 2 Soft Drinks (350ml).',
    price: 399,
    image_url: '/images/menu/beast-feast-combo.jpg',
    tags: 'Bestseller, Feast for Two, High Value, Halal',
    sort_order: 7,
  },
  {
    id: 'combo-double-impact',
    category_id: 'cat-combos',
    name: 'Double Impact Combo (Serves 2)',
    description: '2 Pcs Crispy Fried Chicken, 4 Pcs Peri Peri Wings, 4 Chicken Nuggets, 1 French Fries, and 2 Soft Drinks (350ml).',
    price: 349,
    image_url: '/images/menu/double-impact-combo.jpg',
    tags: 'Wings & More, Sharing, Halal, Spicy',
    sort_order: 8,
  },
  {
    id: 'combo-cluck-patty',
    category_id: 'cat-combos',
    name: "Cluck n' Patty Combo (Serves 1)",
    description: '1 Classic Chicken Burger, 1 Pc Fried Chicken, 1 French Fries, and 1 Chilled Soft Drink (350ml).',
    price: 299,
    image_url: '/images/menu/cluck-n-patty.jpg',
    tags: 'Single Combo, Lunch Favorite, Halal',
    sort_order: 9,
  },
  {
    id: 'combo-pop-star',
    category_id: 'cat-combos',
    name: 'Pop Star Snack Pack',
    description: '1 Regular Crunchy Chicken Popcorn, 1 Pc Fried Chicken, and 1 Refreshing Soft Drink (350ml).',
    price: 249,
    image_url: '/images/menu/pop-star-combo.jpg',
    tags: 'Snack Pack, Halal',
    sort_order: 10,
  },

  // Burgers & Wraps
  {
    id: 'burger-hot-crispy',
    category_id: 'cat-burgers',
    name: 'Hot Crispy Chicken Burger',
    description: 'Extra-crisp whole chicken thigh patty stacked with spicy peri-peri mayo, fresh crisp iceberg lettuce on a toasted sesame brioche bun.',
    price: 139,
    image_url: '/images/menu/hot-crispy-burger.jpg',
    tags: 'Bestseller, Signature Crunch, Halal, Hot',
    sort_order: 11,
  },
  {
    id: 'burger-big-juicy',
    category_id: 'cat-burgers',
    name: 'Big Juicy Burger',
    description: 'Double tender chicken patty layered with melted cheese slice, tangy barbecue relish, and creamy house dressing.',
    price: 149,
    image_url: '/images/menu/big-juicy-burger.jpg',
    tags: 'Cheese Melt, Satisfying, Halal',
    sort_order: 12,
  },
  {
    id: 'burger-smoky-chilli',
    category_id: 'cat-burgers',
    name: 'Smoky Chilli Burger',
    description: 'Spicy chicken patty infused with smoky chipotle sauce, caramelized onion glaze, and pickled jalapeños.',
    price: 149,
    image_url: '/images/menu/hot-crispy-burger.jpg',
    tags: 'Smoky Heat, Halal, Spicy',
    sort_order: 13,
  },
  {
    id: 'burger-tandoori',
    category_id: 'cat-burgers',
    name: 'Tandoori Chicken Burger',
    description: 'Grilled chicken patty smothered in bold tandoori spiced mint mayo and crunchy red onion rings.',
    price: 109,
    image_url: '/images/menu/big-juicy-burger.jpg',
    tags: 'Desi Spiced, Halal',
    sort_order: 14,
  },
  {
    id: 'burger-classic',
    category_id: 'cat-burgers',
    name: 'Classic Crunchy Burger',
    description: 'Golden chicken patty with classic garlic mayo and crunchy shredded lettuce.',
    price: 99,
    image_url: '/images/menu/hot-crispy-burger.jpg',
    tags: 'Classic, Halal',
    sort_order: 15,
  },
  {
    id: 'roll-tandoori',
    category_id: 'cat-burgers',
    name: 'Tandoori Chicken Roll',
    description: 'Juicy spiced chicken kebab pieces rolled in a warm flaky paratha with mint glaze and chatpata onions.',
    price: 99,
    image_url: '/images/menu/tandoori-chicken-roll.jpg',
    tags: 'Street Style, Handheld, Halal',
    sort_order: 16,
  },
  {
    id: 'roll-krisper',
    category_id: 'cat-burgers',
    name: 'Krisper Chicken Roll',
    description: 'Crunchy chicken tenders rolled with honey mustard slaw in a toasted golden wrap.',
    price: 109,
    image_url: '/images/menu/tandoori-chicken-roll.jpg',
    tags: 'Crispy Wrap, Halal',
    sort_order: 17,
  },
  {
    id: 'roll-paneer',
    category_id: 'cat-burgers',
    name: 'Royal Paneer Wrapper',
    description: 'Marinated soft cottage cheese fingers wrapped with tandoori mayo and crunchy bell peppers.',
    price: 129,
    image_url: '/images/menu/paneer-wrapper.jpg',
    tags: 'Vegetarian, Cheesy, Veg',
    sort_order: 18,
  },

  // Bowls & Gourmet Sandwiches
  {
    id: 'bowl-asian-fried',
    category_id: 'cat-bowls',
    name: 'Asian Boneless Fried Chicken Bowl',
    description: 'Crisp golden boneless chicken bites served on steaming aromatic herb rice, accompanied by spicy Schezwan or rich Kerala Curry glaze and cold drink.',
    price: 199,
    image_url: '/images/menu/asian-fried-chicken-bowl.jpg',
    tags: 'Fusion Favorite, Meal In A Bowl, Halal, Spicy',
    sort_order: 19,
  },
  {
    id: 'bowl-grill-chicken',
    category_id: 'cat-bowls',
    name: 'Grill Chicken Rice Bowl',
    description: 'Tender marinated flame-grilled chicken chunks served over aromatic basmati pilaf with roasted pepper salsa.',
    price: 149,
    image_url: '/images/menu/grill-chicken-rice-bowl.jpg',
    tags: 'Healthy Choice, Grilled, Halal',
    sort_order: 20,
  },
  {
    id: 'sandwich-clucky-chunky',
    category_id: 'cat-bowls',
    name: 'Clucky Chunky Gourmet Sandwich',
    description: 'Thick grilled sourdough stuffed with succulent chunky chicken shreds, herb mayo, and melted cheese.',
    price: 169,
    image_url: '/images/menu/clucky-chunky-sandwich.jpg',
    tags: 'Artisan Toast, Loaded, Halal',
    sort_order: 21,
  },

  // Snack Attack
  {
    id: 'snack-loaded-popcorn',
    category_id: 'cat-snacks',
    name: 'Loaded Chicken Popcorn',
    description: 'Bite-sized crispy chicken poppers drizzled with warm cheddar cheese sauce, fiery peri-peri sprinkles, and spring onions.',
    price: 99,
    image_url: '/images/menu/loaded-chicken-popcorn.jpg',
    tags: 'Bestseller, Snack Mania, Halal',
    sort_order: 22,
  },
  {
    id: 'snack-loaded-fries',
    category_id: 'cat-snacks',
    name: 'Loaded Cheesy Fries',
    description: 'Crispy skin-on golden potato fries smothered in creamy melted cheese sauce, salsa drizzle, and herbs.',
    price: 89,
    image_url: '/images/menu/loaded-cheesy-fries.jpg',
    tags: 'Vegetarian, Cheesy Delight, Veg',
    sort_order: 23,
  },
  {
    id: 'snack-strips',
    category_id: 'cat-snacks',
    name: 'Crispy Chicken Strips (4 Pcs)',
    description: '100% whole muscle chicken breast tenders breaded in seasoned panko crumbs with garlic mayo dip.',
    price: 139,
    image_url: '/images/menu/crispy-chicken-strips.jpg',
    tags: 'Finger Food, Crunchy, Halal',
    sort_order: 24,
  },
  {
    id: 'snack-nuggets',
    category_id: 'cat-snacks',
    name: 'Golden Chicken Nuggets (6 Pcs)',
    description: 'Tender bite-sized chicken nuggets flash-fried golden brown with sweet chilli dip.',
    price: 69,
    image_url: '/images/menu/crispy-chicken-strips.jpg',
    tags: 'Kids Love, Halal',
    sort_order: 25,
  },

  // Veggie Delight
  {
    id: 'veg-meal-deal',
    category_id: 'cat-veggie',
    name: 'Veggie Delight Meal Deal',
    description: '1 Veggie Surprise Burger, 2 Pcs Veg Bites, 2 Pcs Potato Kievs, and 1 Refreshing Cold Drink (350ml).',
    price: 249,
    image_url: '/images/menu/veggie-meal-deal.jpg',
    tags: 'Vegetarian, Complete Meal, Veg',
    sort_order: 26,
  },
  {
    id: 'veg-big-box',
    category_id: 'cat-veggie',
    name: 'Veggie Big Box Feast',
    description: '1 Royal Paneer Burger, 5 Pcs Potato Kievs, 3 Pcs Crispy Veg Fingers, 1 French Fries, and 1 Soft Drink.',
    price: 279,
    image_url: '/images/menu/veggie-big-box.jpg',
    tags: 'Vegetarian Feast, Shareable, Veg',
    sort_order: 27,
  },
  {
    id: 'veg-burger-crispy',
    category_id: 'cat-veggie',
    name: 'Crispy Veggie Surprise Burger',
    description: 'Spiced potato and sweet corn patty encrusted with golden crumbs, topped with mint mayo and pickled cucumber.',
    price: 89,
    image_url: '/images/menu/crispy-veg-burger.jpg',
    tags: 'Vegetarian, Veg',
    sort_order: 28,
  },

  // Sip n' Slurp & Beverages
  {
    id: 'bev-mojito',
    category_id: 'cat-beverages',
    name: 'Sparkling Classic Mint Mojito',
    description: 'Crushed garden fresh mint leaves, zesty lemon wedges, chilled sparkling soda, and organic cane syrup.',
    price: 69,
    image_url: '/images/menu/sparkling-mojitos.jpg',
    tags: 'Chilled Cooler, Refreshing, Veg',
    sort_order: 29,
  },
  {
    id: 'bev-blue-curacao',
    category_id: 'cat-beverages',
    name: 'Electric Blue Curacao Splash',
    description: 'Vibrant blue citrus syrup shaken with crushed ice and sparkling lemon-lime fizz.',
    price: 69,
    image_url: '/images/menu/sparkling-mojitos.jpg',
    tags: 'Signature Drink, Veg',
    sort_order: 30,
  },
  {
    id: 'bev-cappuccino',
    category_id: 'cat-beverages',
    name: 'Artisan Cappuccino / Latte',
    description: 'Freshly ground Arabica espresso topped with creamy steamed microfoam and cocoa dust.',
    price: 129,
    image_url: '/images/menu/cappuccino-coffee.jpg',
    tags: 'Hot Brew, Barista Craft, Veg',
    sort_order: 31,
  },
  {
    id: 'bev-masala-tea',
    category_id: 'cat-beverages',
    name: 'Kadak Masala Chai + Butter Cookie',
    description: 'Slow-simmered Assam black tea infused with crushed cardamom, ginger, cloves, served with bakery butter cookies.',
    price: 69,
    image_url: '/images/menu/cappuccino-coffee.jpg',
    tags: 'Comfort Hot, Local Favorite, Veg',
    sort_order: 32,
  },

  // Sweet Treats & Desserts
  {
    id: 'des-brownie-bomb',
    category_id: 'cat-desserts',
    name: 'Sizzling Brownie Bomb with Ice Cream',
    description: 'Warm, gooey walnut dark chocolate brownie crowned with velvety vanilla bean ice cream and hot chocolate fudge drizzle.',
    price: 99,
    image_url: '/images/menu/brownie-bomb-icecream.jpg',
    tags: 'Bestseller, Pure Indulgence, Veg',
    sort_order: 33,
  },
  {
    id: 'des-fudge-brownie',
    category_id: 'cat-desserts',
    name: 'American Rich Fudge Brownie',
    description: 'Decadent baked chocolate cake square with crackly crust and rich dense center.',
    price: 109,
    image_url: '/images/menu/fudge-brownie.jpg',
    tags: 'Chocoholic, Veg',
    sort_order: 34,
  },
  {
    id: 'des-ice-cream',
    category_id: 'cat-desserts',
    name: 'Artisan Ice Cream (2 Scoops)',
    description: 'Two generous scoops of gourmet ice cream. Choose from Belgian Chocolate, Madagascar Vanilla, or Moroccan Hazelnut.',
    price: 99,
    image_url: '/images/menu/ice-cream-scoops.jpg',
    tags: 'Cool Treat, Veg',
    sort_order: 35,
  },
];

const upsertProd = db.prepare(`
  INSERT INTO products (
    id, category_id, name, description, price, image_url, tags,
    is_active, sort_order, track_inventory, stock_quantity, low_stock_threshold,
    created_at, updated_at
  )
  VALUES (
    @id, @category_id, @name, @description, @price, @image_url, @tags,
    1, @sort_order, 0, 100, 5,
    datetime('now'), datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    image_url = excluded.image_url,
    tags = excluded.tags,
    is_active = 1,
    sort_order = excluded.sort_order,
    updated_at = datetime('now')
`);

db.transaction(() => {
  for (const prod of products) {
    upsertProd.run(prod);
  }
})();

console.log(`✅ Seeded ${products.length} Five Star Chicken products into flo.db.`);

db.close();
