const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'flo.db');
const BACKUP_PATH = path.join(__dirname, `flo-pre-menu-backup-${Date.now()}.db`);

// 1. Safe Backup of Database
fs.copyFileSync(DB_PATH, BACKUP_PATH);
console.log(`[Backup] Safe backup created at: ${BACKUP_PATH}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Read cropped images as Base64 Data URIs
const CROPS_DIR = '/tmp/menu_crops';
function getBase64Uri(filename) {
  const filePath = path.join(CROPS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  }
  return null;
}

const CATEGORIES = [
  { id: 'cat-combos', name: 'Value Combos & Feasts', slug: 'combos', icon: '🍗', color: '#E11D48', sort_order: 1 },
  { id: 'cat-signature', name: 'Signature Fried Chicken', slug: 'signature', icon: '⭐', color: '#EA580C', sort_order: 2 },
  { id: 'cat-burgers', name: 'Burgers & Wraps', slug: 'burgers', icon: '🍔', color: '#D97706', sort_order: 3 },
  { id: 'cat-veggie', name: 'Veggie Surprise', slug: 'veggie', icon: '🥬', color: '#16A34A', sort_order: 4 },
  { id: 'cat-bowls', name: 'Rice Bowls & Sandwiches', slug: 'bowls', icon: '🍚', color: '#CA8A04', sort_order: 5 },
  { id: 'cat-snacks', name: 'Snack Attack', slug: 'snacks', icon: '🍟', color: '#F59E0B', sort_order: 6 },
  { id: 'cat-desserts', name: 'Desserts & Treats', slug: 'desserts', icon: '🍫', color: '#9333EA', sort_order: 7 },
  { id: 'cat-beverages', name: 'Shakes & Coolers', slug: 'beverages', icon: '🥤', color: '#0284C7', sort_order: 8 },
];

const PRODUCTS = [
  // ── VALUE COMBOS & FEASTS (Image 1) ──────────────────────────────────────────
  {
    id: 'combo-beast-feast',
    category_id: 'cat-combos',
    name: 'Beast Feast (Serves 2)',
    description: '2 Pcs Fried Chicken + 2 Classic Burgers + 1 French Fries (Reg) + 2 Soft Drinks 350ml',
    price: 399,
    image_file: 'combo-beast-feast.jpg',
    tags: ['non_veg', 'bestseller', 'combo', 'serves_2', 'halal'],
    sort_order: 1,
  },
  {
    id: 'combo-double-impact',
    category_id: 'cat-combos',
    name: 'Double Impact (Serves 2)',
    description: '2 Pcs Fried Chicken + 4 Pcs Peri Peri Chwings + 4 Pcs Chicken Nuggets + 1 French Fries (Reg) + 2 Soft Drinks 350ml',
    price: 369,
    image_file: 'combo-double-impact.jpg',
    tags: ['non_veg', 'combo', 'serves_2', 'halal', 'peri_peri'],
    sort_order: 2,
  },
  {
    id: 'combo-cluck-patty',
    category_id: 'cat-combos',
    name: 'Cluck n\' Patty (Serves 1)',
    description: '1 Classic Burger + 1 Pc Fried Chicken + 1 French Fries (Reg) + 1 Soft Drink 350ml',
    price: 299,
    image_file: 'combo-cluck-patty.jpg',
    tags: ['non_veg', 'bestseller', 'combo', 'serves_1', 'halal'],
    sort_order: 3,
  },
  {
    id: 'combo-pop-star',
    category_id: 'cat-combos',
    name: 'Pop Star (Serves 1)',
    description: 'Popcorn (Reg) + 1 Pc Fried Chicken + 1 Soft Drink 350ml',
    price: 249,
    image_file: 'combo-pop-star.jpg',
    tags: ['non_veg', 'combo', 'serves_1', 'halal'],
    sort_order: 4,
  },
  {
    id: 'combo-veg-value-meal',
    category_id: 'cat-combos',
    name: 'Veg Value Meal Combo',
    description: '1 Veg Burger + 3 Pcs Veg Fingers + 1 French Fries (Reg) + 1 Soft Drink 350ml',
    price: 199,
    image_file: 'combo-veg-value-meal.jpg',
    tags: ['veg', 'pure_veg', 'combo', 'value'],
    sort_order: 5,
  },
  {
    id: 'combo-paneer-delight',
    category_id: 'cat-combos',
    name: 'Paneer Delight Combo',
    description: 'Paneer Burger + French Fries (Reg) + 1 Soft Drink 350ml',
    price: 199,
    image_file: 'combo-paneer-delight.jpg',
    tags: ['veg', 'pure_veg', 'combo', 'paneer'],
    sort_order: 6,
  },
  {
    id: 'combo-crispy-n-cheesy',
    category_id: 'cat-combos',
    name: 'Crispy n\' Cheesy Combo',
    description: 'Hot & Crispy Burger + 6 Pcs Chicken Cheese Shots + 1 Soft Drink 350ml',
    price: 199,
    image_file: 'combo-crispy-n-cheesy.jpg',
    tags: ['non_veg', 'combo', 'cheese', 'halal'],
    sort_order: 7,
  },
  {
    id: 'combo-smokey-wrap',
    category_id: 'cat-combos',
    name: 'Smokey Wrap Combo',
    description: 'Tandoori Roll + French Fries (Reg) + 1 Soft Drink 350ml',
    price: 189,
    image_file: 'combo-smokey-wrap.jpg',
    tags: ['non_veg', 'combo', 'wrap', 'halal'],
    sort_order: 8,
  },
  {
    id: 'combo-quick-bite',
    category_id: 'cat-combos',
    name: 'Quick Bite Veg Combo',
    description: 'Veg Roll + French Fries (Reg) + 1 Soft Drink 350ml',
    price: 149,
    image_file: 'combo-quick-bite.jpg',
    tags: ['veg', 'pure_veg', 'combo', 'quick_bite'],
    sort_order: 9,
  },
  {
    id: 'combo-crunchy-treat',
    category_id: 'cat-combos',
    name: 'Crunchy Treat Combo',
    description: '1 Pc Fried Chicken + French Fries (Reg) + 1 Soft Drink 350ml',
    price: 149,
    image_file: 'combo-crunchy-treat.jpg',
    tags: ['non_veg', 'combo', 'value', 'halal'],
    sort_order: 10,
  },

  // ── SIGNATURE RANGE (Image 2) ────────────────────────────────────────────────
  {
    id: 'sig-bucket-8',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (8 Pcs Bucket)',
    description: '8 pieces of golden crispy, juicy bone-in chicken. Pressure-fried to perfection with Five Star secret herbs.',
    price: 699,
    image_file: 'sig-bucket.jpg',
    tags: ['non_veg', 'bestseller', 'halal', 'sharing'],
    sort_order: 11,
  },
  {
    id: 'sig-bucket-6',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (6 Pcs Bucket)',
    description: '6 pieces of hot, crispy and succulent fried chicken drumsticks and thighs.',
    price: 529,
    image_file: 'sig-bucket.jpg',
    tags: ['non_veg', 'halal', 'sharing'],
    sort_order: 12,
  },
  {
    id: 'sig-box-4',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (4 Pcs Box)',
    description: '4 pieces of fresh fried chicken with signature crunch.',
    price: 359,
    image_file: 'sig-bucket.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 13,
  },
  {
    id: 'sig-drum-2',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (2 Pcs)',
    description: '2 pieces of hot and crispy fried chicken.',
    price: 189,
    image_file: 'sig-pieces.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 14,
  },
  {
    id: 'sig-pc-1',
    category_id: 'cat-signature',
    name: 'Signature Crispy Chicken (1 Pc)',
    description: '1 piece of hot, golden crispy fried chicken.',
    price: 99,
    image_file: 'sig-pieces.jpg',
    tags: ['non_veg', 'halal', 'snack'],
    sort_order: 15,
  },

  // ── BURGERS & WRAPS (Image 2) ────────────────────────────────────────────────
  {
    id: 'burger-big-juicy',
    category_id: 'cat-burgers',
    name: 'Big Juicy Burger',
    description: 'Extra juicy chicken patty layered with melted cheese, fresh pickles and special burger dressing.',
    price: 149,
    image_file: 'burger-big-juicy.jpg',
    tags: ['non_veg', 'gourmet', 'halal'],
    sort_order: 16,
  },
  {
    id: 'burger-korean',
    category_id: 'cat-burgers',
    name: 'Korean Burger',
    description: 'Crispy fried chicken tossed in authentic sweet-and-spicy Korean glazed sauce with sesame seeds.',
    price: 149,
    image_file: 'burger-korean.jpg',
    tags: ['non_veg', 'spicy', 'specialty', 'halal'],
    sort_order: 17,
  },
  {
    id: 'burger-smoky-chilli',
    category_id: 'cat-burgers',
    name: 'Smoky Chilli Burger',
    description: 'Fiery smoky chilli glazed chicken patty with crunchy fresh onions and cheese.',
    price: 149,
    image_file: 'burger-smoky-chilli.jpg',
    tags: ['non_veg', 'spicy', 'hot', 'halal'],
    sort_order: 18,
  },
  {
    id: 'burger-hot-crispy',
    category_id: 'cat-burgers',
    name: 'Hot Crispy Burger',
    description: 'Signature crispy chicken fillet with spicy marinade, fresh lettuce and creamy garlic mayo on a sesame bun.',
    price: 139,
    image_file: 'burger-hot-crispy.jpg',
    tags: ['non_veg', 'bestseller', 'spicy', 'halal'],
    sort_order: 19,
  },
  {
    id: 'burger-tandoori',
    category_id: 'cat-burgers',
    name: 'Tandoori Burger',
    description: 'Juicy chicken patty infused with smoky Indian tandoori spices and cool mint mayo.',
    price: 109,
    image_file: 'burger-tandoori.jpg',
    tags: ['non_veg', 'desi', 'halal'],
    sort_order: 20,
  },
  {
    id: 'burger-classic',
    category_id: 'cat-burgers',
    name: 'Classic Burger',
    description: 'All-time favorite crunchy chicken patty topped with fresh crispy lettuce and creamy mayo.',
    price: 99,
    image_file: 'burger-classic.jpg',
    tags: ['non_veg', 'value', 'classic', 'halal'],
    sort_order: 21,
  },
  {
    id: 'roll-krisper',
    category_id: 'cat-burgers',
    name: 'Krisper Roll',
    description: 'Crispy chicken strips wrapped in a warm soft tortilla with house special sauces.',
    price: 109,
    image_file: 'roll-krisper.jpg',
    tags: ['non_veg', 'wrap', 'halal'],
    sort_order: 22,
  },
  {
    id: 'roll-tandoori',
    category_id: 'cat-burgers',
    name: 'Tandoori Roll',
    description: 'Grilled tandoori spiced chicken cubes with sliced onions and mint chutney wrapped in flaky paratha.',
    price: 99,
    image_file: 'roll-tandoori.jpg',
    tags: ['non_veg', 'wrap', 'halal'],
    sort_order: 23,
  },
  {
    id: 'roll-chicken',
    category_id: 'cat-burgers',
    name: 'Chicken Roll',
    description: 'Juicy shredded chicken with mild herbs and crunchy veggies wrapped in a soft roti wrap.',
    price: 79,
    image_file: 'roll-chicken.jpg',
    tags: ['non_veg', 'wrap', 'value', 'halal'],
    sort_order: 24,
  },

  // ── VEGGIE SURPRISE (Image 2) ────────────────────────────────────────────────
  {
    id: 'burger-paneer-delight',
    category_id: 'cat-veggie',
    name: 'Paneer Delight Burger',
    description: 'Crispy golden spiced cottage cheese (paneer) patty with fresh vegetables and creamy herb dressing.',
    price: 119,
    image_file: 'burger-paneer-delight.jpg',
    tags: ['veg', 'pure_veg', 'bestseller', 'paneer'],
    sort_order: 25,
  },
  {
    id: 'burger-veg',
    category_id: 'cat-veggie',
    name: 'Veg Burger',
    description: 'Crispy mixed vegetable patty seasoned with aromatic herbs, topped with lettuce and mayo.',
    price: 89,
    image_file: 'veggie-burger.jpg',
    tags: ['veg', 'pure_veg', 'classic'],
    sort_order: 26,
  },
  {
    id: 'sandwich-veg',
    category_id: 'cat-veggie',
    name: 'Veg Sandwich',
    description: 'Toasted multi-layer sandwich loaded with fresh veggies, melted cheese and spiced herb spread.',
    price: 99,
    image_file: 'sandwich-veg.jpg',
    tags: ['veg', 'pure_veg'],
    sort_order: 27,
  },
  {
    id: 'roll-veg',
    category_id: 'cat-veggie',
    name: 'Veg Roll',
    description: 'Sautéed seasoned garden vegetables with tangy sauce rolled in a warm flaky paratha.',
    price: 79,
    image_file: 'veggie-roll.jpg',
    tags: ['veg', 'pure_veg', 'wrap'],
    sort_order: 28,
  },
  {
    id: 'fries-french-reg',
    category_id: 'cat-veggie',
    name: 'French Fries (Regular)',
    description: 'Salted golden crispy potato french fries.',
    price: 69,
    image_file: 'fries-french.jpg',
    tags: ['veg', 'pure_veg', 'snack'],
    sort_order: 29,
  },
  {
    id: 'fries-french-large',
    category_id: 'cat-veggie',
    name: 'French Fries (Large)',
    description: 'Jumbo portion of salted golden crispy potato french fries.',
    price: 109,
    image_file: 'fries-french.jpg',
    tags: ['veg', 'pure_veg', 'snack'],
    sort_order: 30,
  },
  {
    id: 'snack-veg-fingers',
    category_id: 'cat-veggie',
    name: 'Veg Fingers (3 Pcs)',
    description: '3 golden crunchy crumb-coated vegetable fingers served piping hot.',
    price: 69,
    image_file: 'veggie-fingers.jpg',
    tags: ['veg', 'pure_veg', 'snack'],
    sort_order: 31,
  },

  // ── BOWLS & SANDWICHES (Image 2) ─────────────────────────────────────────────
  {
    id: 'bowl-biryani',
    category_id: 'cat-bowls',
    name: 'Biryani Bowl',
    description: 'Fragrant spiced dum biryani rice served with a succulent roasted chicken piece and sides.',
    price: 149,
    image_file: 'bowl-biryani.jpg',
    tags: ['non_veg', 'bestseller', 'biryani', 'halal'],
    sort_order: 32,
  },
  {
    id: 'bowl-grill-chicken',
    category_id: 'cat-bowls',
    name: 'Grill Chicken Rice Bowl',
    description: 'Steamed seasoned rice topped with tender grilled chicken and savory Indo/Oriental sauce.',
    price: 149,
    image_file: 'bowl-grill-chicken.jpg',
    tags: ['non_veg', 'bowl', 'halal'],
    sort_order: 33,
  },
  {
    id: 'bowl-pop-chicken',
    category_id: 'cat-bowls',
    name: 'Pop Chicken Rice Bowl',
    description: 'Aromatic flavored rice topped with crispy chicken popcorn and rich savory gravy.',
    price: 149,
    image_file: 'bowl-pop-chicken.jpg',
    tags: ['non_veg', 'bowl', 'halal'],
    sort_order: 34,
  },
  {
    id: 'sandwich-chicken',
    category_id: 'cat-bowls',
    name: 'Chicken Sandwich',
    description: 'Double-layer grilled club sandwich packed with seasoned chicken, fresh vegetables and creamy mayo.',
    price: 119,
    image_file: 'sandwich-chicken.jpg',
    tags: ['non_veg', 'sandwich', 'halal'],
    sort_order: 35,
  },

  // ── SNACK ATTACK (Image 2) ───────────────────────────────────────────────────
  {
    id: 'snack-lollipoppers',
    category_id: 'cat-snacks',
    name: 'Lollipoppers (Chicken Lollipops)',
    description: 'Frenched chicken wing drumettes shaped into lollipops, spiced and crisply fried.',
    price: 139,
    image_file: 'snack-lollipoppers.jpg',
    tags: ['non_veg', 'bestseller', 'halal'],
    sort_order: 36,
  },
  {
    id: 'snack-mirchi-bites',
    category_id: 'cat-snacks',
    name: 'Mirchi Bites (4 Pcs)',
    description: 'Crispy battered spicy green chili chicken bites for chili enthusiasts.',
    price: 129,
    image_file: 'snack-mirchi-bites.jpg',
    tags: ['non_veg', 'spicy', 'halal'],
    sort_order: 37,
  },
  {
    id: 'snack-peri-peri-chwings',
    category_id: 'cat-snacks',
    name: 'Peri Peri Chwings (3 Pcs)',
    description: 'Juicy chicken wings tossed in zesty African Peri-Peri seasoning with tangy heat.',
    price: 115,
    image_file: 'snack-chwings.jpg',
    tags: ['non_veg', 'spicy', 'wings', 'halal'],
    sort_order: 38,
  },
  {
    id: 'snack-korean-pops',
    category_id: 'cat-snacks',
    name: 'Korean Pops',
    description: 'Crunchy chicken bites tossed in sweet and fiery Korean glazed sauce.',
    price: 99,
    image_file: 'snack-korean-pops.jpg',
    tags: ['non_veg', 'spicy', 'halal'],
    sort_order: 39,
  },
  {
    id: 'snack-krusty-bites',
    category_id: 'cat-snacks',
    name: 'Krusty Bites',
    description: 'Crunchy spiced bite-size chicken snacks with Five Star special coating.',
    price: 95,
    image_file: 'snack-krusty-bites.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 40,
  },
  {
    id: 'snack-popcorn-reg',
    category_id: 'cat-snacks',
    name: 'Chicken Popcorn (Regular)',
    description: 'Tender bite-sized chicken breast pieces coated in signature crunchy batter.',
    price: 85,
    image_file: 'snack-popcorn.jpg',
    tags: ['non_veg', 'bestseller', 'snack', 'halal'],
    sort_order: 41,
  },
  {
    id: 'snack-popcorn-large',
    category_id: 'cat-snacks',
    name: 'Chicken Popcorn (Large)',
    description: 'Jumbo box of crunchy bite-sized chicken breast popcorn.',
    price: 149,
    image_file: 'snack-popcorn.jpg',
    tags: ['non_veg', 'bestseller', 'snack', 'halal'],
    sort_order: 42,
  },
  {
    id: 'snack-loaded-popcorn-reg',
    category_id: 'cat-snacks',
    name: 'Loaded Popcorn (Regular)',
    description: 'Hot crunchy chicken popcorn drenched in melted cheese sauce and seasonings.',
    price: 99,
    image_file: 'snack-loaded-popcorn.jpg',
    tags: ['non_veg', 'cheese', 'halal'],
    sort_order: 43,
  },
  {
    id: 'snack-loaded-popcorn-large',
    category_id: 'cat-snacks',
    name: 'Loaded Popcorn (Large)',
    description: 'Jumbo portion of chicken popcorn loaded with warm cheddar cheese sauce.',
    price: 169,
    image_file: 'snack-loaded-popcorn.jpg',
    tags: ['non_veg', 'cheese', 'halal'],
    sort_order: 44,
  },
  {
    id: 'snack-cheese-shots-5',
    category_id: 'cat-snacks',
    name: 'Chicken Cheese Shots (5 Pcs)',
    description: 'Crispy chicken bites with a molten core of melted gooey cheese.',
    price: 99,
    image_file: 'snack-cheese-shots.jpg',
    tags: ['non_veg', 'cheese', 'bestseller', 'halal'],
    sort_order: 45,
  },
  {
    id: 'snack-cheese-shots-10',
    category_id: 'cat-snacks',
    name: 'Chicken Cheese Shots (10 Pcs)',
    description: '10 pieces of crispy chicken bites with molten melted cheese inside.',
    price: 149,
    image_file: 'snack-cheese-shots.jpg',
    tags: ['non_veg', 'cheese', 'bestseller', 'halal'],
    sort_order: 46,
  },
  {
    id: 'snack-strips-3',
    category_id: 'cat-snacks',
    name: 'Chicken Strips (3 Pcs)',
    description: '100% whole chicken breast fillets cut into long strips and fried crisp.',
    price: 99,
    image_file: 'snack-strips.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 47,
  },
  {
    id: 'snack-strips-5',
    category_id: 'cat-snacks',
    name: 'Chicken Strips (5 Pcs)',
    description: '5 pieces of 100% whole chicken breast crispy fried strips.',
    price: 159,
    image_file: 'snack-strips.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 48,
  },
  {
    id: 'snack-loaded-fries-reg',
    category_id: 'cat-snacks',
    name: 'Loaded Fries (Regular)',
    description: 'Golden french fries topped with warm cheddar cheese sauce and savory herbs.',
    price: 89,
    image_file: 'snack-loaded-fries.jpg',
    tags: ['veg', 'snack', 'cheese'],
    sort_order: 49,
  },
  {
    id: 'snack-loaded-fries-large',
    category_id: 'cat-snacks',
    name: 'Loaded Fries (Large)',
    description: 'Jumbo portion of golden french fries loaded with melted cheddar cheese sauce.',
    price: 119,
    image_file: 'snack-loaded-fries.jpg',
    tags: ['veg', 'snack', 'cheese'],
    sort_order: 50,
  },
  {
    id: 'snack-fingers-3',
    category_id: 'cat-snacks',
    name: 'Chicken Fingers (3 Pcs)',
    description: 'Spiced minced chicken fingers breaded and fried to crispiness.',
    price: 69,
    image_file: 'snack-veg-fingers.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 51,
  },
  {
    id: 'snack-fingers-6',
    category_id: 'cat-snacks',
    name: 'Chicken Fingers (6 Pcs)',
    description: '6 pieces of seasoned crispy fried chicken fingers.',
    price: 109,
    image_file: 'snack-veg-fingers.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 52,
  },
  {
    id: 'snack-nuggets-4',
    category_id: 'cat-snacks',
    name: 'Chicken Nuggets (4 Pcs)',
    description: 'Tender juicy chicken nuggets in a light crispy golden coating.',
    price: 69,
    image_file: 'snack-nuggets.jpg',
    tags: ['non_veg', 'halal'],
    sort_order: 53,
  },

  // ── DESSERTS & TREATS (Image 2) ──────────────────────────────────────────────
  {
    id: 'dessert-choco-lava',
    category_id: 'cat-desserts',
    name: 'Choco Lava Cake',
    description: 'Warm chocolate cake with a molten liquid chocolate center that flows with every spoon.',
    price: 89,
    image_file: 'dessert-choco-lava.jpg',
    tags: ['veg', 'dessert', 'chocolate', 'bestseller'],
    sort_order: 54,
  },
  {
    id: 'dessert-brownie-bomb',
    category_id: 'cat-desserts',
    name: 'Brownie Bomb with Ice Cream',
    description: 'Warm fudgy chocolate brownie served with a scoop of premium vanilla ice cream.',
    price: 99,
    image_file: 'dessert-brownie.jpg',
    tags: ['veg', 'dessert', 'bestseller'],
    sort_order: 55,
  },
  {
    id: 'dessert-ice-cream',
    category_id: 'cat-desserts',
    name: 'Ice Cream (2 Scoops)',
    description: 'Two rich scoops of ice cream (Vanilla, Chocolate, or Moroccan Dry Fruit).',
    price: 99,
    image_file: 'dessert-ice-cream.jpg',
    tags: ['veg', 'dessert'],
    sort_order: 56,
  },

  // ── SHAKES & COOLERS (Image 2) ───────────────────────────────────────────────
  {
    id: 'bev-shake-berry',
    category_id: 'cat-beverages',
    name: 'Very Berry Shake',
    description: 'Thick chilled milkshake blended with real wild berries and cream.',
    price: 99,
    image_file: 'beverage-shake-berry.jpg',
    tags: ['veg', 'shake', 'beverage'],
    sort_order: 57,
  },
  {
    id: 'bev-shake-mango',
    category_id: 'cat-beverages',
    name: 'Mango Chill Shake',
    description: 'Rich thick shake bursting with the golden flavor of Alphonso mangoes.',
    price: 99,
    image_file: 'beverage-shake-mango.jpg',
    tags: ['veg', 'shake', 'beverage'],
    sort_order: 58,
  },
  {
    id: 'bev-shake-currant',
    category_id: 'cat-beverages',
    name: 'Black Currant Shake',
    description: 'Refreshing creamy shake infused with tart and sweet black currant puree.',
    price: 99,
    image_file: 'beverage-shake-blackcurrant.jpg',
    tags: ['veg', 'shake', 'beverage'],
    sort_order: 59,
  },
  {
    id: 'bev-mojito-classic',
    category_id: 'cat-beverages',
    name: 'Classic Mojito',
    description: 'Sparkling soda cooler infused with crushed fresh mint leaves, lemon juice and cane sweetness.',
    price: 79,
    image_file: 'beverage-mojito.jpg',
    tags: ['veg', 'cooler', 'beverage', 'bestseller'],
    sort_order: 60,
  },
  {
    id: 'bev-cooler-blue',
    category_id: 'cat-beverages',
    name: 'Blue Curacao Cooler',
    description: 'Vibrant electric blue citrus cooler with crushed ice and sparkling soda.',
    price: 79,
    image_file: 'beverage-blue-curacao.jpg',
    tags: ['veg', 'cooler', 'beverage'],
    sort_order: 61,
  },
  {
    id: 'bev-cooler-apple',
    category_id: 'cat-beverages',
    name: 'Green Apple Cooler',
    description: 'Crisp and tangy green apple sparkle with mint and soda on ice.',
    price: 79,
    image_file: 'beverage-green-apple.jpg',
    tags: ['veg', 'cooler', 'beverage'],
    sort_order: 62,
  },
];

// Perform Database Transaction
db.transaction(() => {
  // 1. Soft-delete legacy / existing products
  db.prepare("UPDATE products SET deleted_at = datetime('now') WHERE deleted_at IS NULL").run();
  console.log('[Database] Soft-deleted existing legacy menu products.');

  // 2. Soft-delete old demo categories if any
  db.prepare("UPDATE categories SET deleted_at = datetime('now') WHERE id IN ('cat-express-food', 'cat-express-beverages')").run();

  // 3. Upsert Categories
  const upsertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, icon, color, sort_order, is_active, created_at, updated_at)
    VALUES (@id, @name, @slug, @icon, @color, @sort_order, 1, datetime('now'), datetime('now'))
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

  for (const cat of CATEGORIES) {
    upsertCat.run(cat);
  }
  console.log(`[Database] Upserted ${CATEGORIES.length} official categories.`);

  // 4. Insert or reactivate Products
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
  for (const p of PRODUCTS) {
    const base64Uri = getBase64Uri(p.image_file);
    upsertProd.run({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      sort_order: p.sort_order,
      image_url: base64Uri,
      tags: JSON.stringify(p.tags),
    });
    count++;
  }
  console.log(`[Database] Successfully inserted/activated ${count} new products in flo.db.`);
})();

db.close();
console.log('Database operation completed successfully.');
