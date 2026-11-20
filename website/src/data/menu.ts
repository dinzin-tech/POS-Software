import { MenuItem } from '@/types';

export const menuCategories = [
  {
    "id": "all",
    "name": "All Specialties"
  },
  {
    "id": "combos",
    "name": "Value Combos & Feasts"
  },
  {
    "id": "signature",
    "name": "Signature Fried Chicken"
  },
  {
    "id": "burgers",
    "name": "Burgers & Wraps"
  },
  {
    "id": "veggie",
    "name": "Veggie Surprise"
  },
  {
    "id": "bowls",
    "name": "Rice Bowls & Sandwiches"
  },
  {
    "id": "snacks",
    "name": "Snack Attack"
  },
  {
    "id": "desserts",
    "name": "Desserts & Treats"
  },
  {
    "id": "beverages",
    "name": "Shakes & Coolers"
  }
] as const;

export const menuItems: MenuItem[] = [
  {
    "id": "combo-beast-feast",
    "name": "Beast Feast (Serves 2)",
    "description": "2 Pcs Fried Chicken + 2 Classic Burgers + 1 French Fries (Reg) + 2 Soft Drinks 350ml",
    "price": 399,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-beast-feast.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Combo",
      "Serves 2",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true,
    "serves": "Serves 2"
  },
  {
    "id": "combo-double-impact",
    "name": "Double Impact (Serves 2)",
    "description": "2 Pcs Fried Chicken + 4 Pcs Peri Peri Chwings + 4 Pcs Chicken Nuggets + 1 French Fries (Reg) + 2 Soft Drinks 350ml",
    "price": 369,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-double-impact.jpg",
    "tags": [
      "Non Veg",
      "Combo",
      "Serves 2",
      "Halal",
      "Peri Peri"
    ],
    "spiceLevel": "peri-peri",
    "isHalalChicken": true,
    "serves": "Serves 2"
  },
  {
    "id": "combo-cluck-patty",
    "name": "Cluck n' Patty (Serves 1)",
    "description": "1 Classic Burger + 1 Pc Fried Chicken + 1 French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 299,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-cluck-patty.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Combo",
      "Serves 1",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true,
    "serves": "Serves 1"
  },
  {
    "id": "combo-pop-star",
    "name": "Pop Star (Serves 1)",
    "description": "Popcorn (Reg) + 1 Pc Fried Chicken + 1 Soft Drink 350ml",
    "price": 249,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-pop-star.jpg",
    "tags": [
      "Non Veg",
      "Combo",
      "Serves 1",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "serves": "Serves 1"
  },
  {
    "id": "combo-veg-value-meal",
    "name": "Veg Value Meal Combo",
    "description": "1 Veg Burger + 3 Pcs Veg Fingers + 1 French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 199,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-veg-value-meal.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Combo",
      "Value"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "combo-paneer-delight",
    "name": "Paneer Delight Combo",
    "description": "Paneer Burger + French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 199,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-paneer-delight.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Combo",
      "Paneer"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "combo-crispy-n-cheesy",
    "name": "Crispy n' Cheesy Combo",
    "description": "Hot & Crispy Burger + 6 Pcs Chicken Cheese Shots + 1 Soft Drink 350ml",
    "price": 199,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-crispy-n-cheesy.jpg",
    "tags": [
      "Non Veg",
      "Combo",
      "Cheese",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "combo-smokey-wrap",
    "name": "Smokey Wrap Combo",
    "description": "Tandoori Roll + French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 189,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-smokey-wrap.jpg",
    "tags": [
      "Non Veg",
      "Combo",
      "Wrap",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "combo-quick-bite",
    "name": "Quick Bite Veg Combo",
    "description": "Veg Roll + French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 149,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-quick-bite.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Combo",
      "Quick Bite"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "combo-crunchy-treat",
    "name": "Crunchy Treat Combo",
    "description": "1 Pc Fried Chicken + French Fries (Reg) + 1 Soft Drink 350ml",
    "price": 149,
    "category": "combos",
    "categoryName": "Value Combos & Feasts",
    "image": "/images/menu/combo-crunchy-treat.jpg",
    "tags": [
      "Non Veg",
      "Combo",
      "Value",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "sig-bucket-8",
    "name": "Signature Crispy Chicken (8 Pcs Bucket)",
    "description": "8 pieces of golden crispy, juicy bone-in chicken. Pressure-fried to perfection with Five Star secret herbs.",
    "price": 699,
    "category": "signature",
    "categoryName": "Signature Fried Chicken",
    "image": "/images/menu/sig-bucket.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Halal",
      "Sharing"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true,
    "serves": "3–4 People",
    "portion": "8 Pcs"
  },
  {
    "id": "sig-bucket-6",
    "name": "Signature Crispy Chicken (6 Pcs Bucket)",
    "description": "6 pieces of hot, crispy and succulent fried chicken drumsticks and thighs.",
    "price": 529,
    "category": "signature",
    "categoryName": "Signature Fried Chicken",
    "image": "/images/menu/sig-bucket.jpg",
    "tags": [
      "Non Veg",
      "Halal",
      "Sharing"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "serves": "3–4 People",
    "portion": "6 Pcs"
  },
  {
    "id": "sig-box-4",
    "name": "Signature Crispy Chicken (4 Pcs Box)",
    "description": "4 pieces of fresh fried chicken with signature crunch.",
    "price": 359,
    "category": "signature",
    "categoryName": "Signature Fried Chicken",
    "image": "/images/menu/sig-bucket.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "4 Pcs"
  },
  {
    "id": "sig-drum-2",
    "name": "Signature Crispy Chicken (2 Pcs)",
    "description": "2 pieces of hot and crispy fried chicken.",
    "price": 189,
    "category": "signature",
    "categoryName": "Signature Fried Chicken",
    "image": "/images/menu/sig-pieces.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "2 Pcs"
  },
  {
    "id": "sig-pc-1",
    "name": "Signature Crispy Chicken (1 Pc)",
    "description": "1 piece of hot, golden crispy fried chicken.",
    "price": 99,
    "category": "signature",
    "categoryName": "Signature Fried Chicken",
    "image": "/images/menu/sig-pieces.jpg",
    "tags": [
      "Non Veg",
      "Halal",
      "Snack"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "1 Pc"
  },
  {
    "id": "burger-big-juicy",
    "name": "Big Juicy Burger",
    "description": "Extra juicy chicken patty layered with melted cheese, fresh pickles and special burger dressing.",
    "price": 149,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-big-juicy.jpg",
    "tags": [
      "Non Veg",
      "Gourmet",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "burger-korean",
    "name": "Korean Burger",
    "description": "Crispy fried chicken tossed in authentic sweet-and-spicy Korean glazed sauce with sesame seeds.",
    "price": 149,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-korean.jpg",
    "tags": [
      "Non Veg",
      "Spicy",
      "Specialty",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isHalalChicken": true
  },
  {
    "id": "burger-smoky-chilli",
    "name": "Smoky Chilli Burger",
    "description": "Fiery smoky chilli glazed chicken patty with crunchy fresh onions and cheese.",
    "price": 149,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-smoky-chilli.jpg",
    "tags": [
      "Non Veg",
      "Spicy",
      "Hot",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isHalalChicken": true
  },
  {
    "id": "burger-hot-crispy",
    "name": "Hot Crispy Burger",
    "description": "Signature crispy chicken fillet with spicy marinade, fresh lettuce and creamy garlic mayo on a sesame bun.",
    "price": 139,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-hot-crispy.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Spicy",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isBestseller": true,
    "isHalalChicken": true
  },
  {
    "id": "burger-tandoori",
    "name": "Tandoori Burger",
    "description": "Juicy chicken patty infused with smoky Indian tandoori spices and cool mint mayo.",
    "price": 109,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-tandoori.jpg",
    "tags": [
      "Non Veg",
      "Desi",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "burger-classic",
    "name": "Classic Burger",
    "description": "All-time favorite crunchy chicken patty topped with fresh crispy lettuce and creamy mayo.",
    "price": 99,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/burger-classic.jpg",
    "tags": [
      "Non Veg",
      "Value",
      "Classic",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "roll-krisper",
    "name": "Krisper Roll",
    "description": "Crispy chicken strips wrapped in a warm soft tortilla with house special sauces.",
    "price": 109,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/roll-krisper.jpg",
    "tags": [
      "Non Veg",
      "Wrap",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "roll-tandoori",
    "name": "Tandoori Roll",
    "description": "Grilled tandoori spiced chicken cubes with sliced onions and mint chutney wrapped in flaky paratha.",
    "price": 99,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/roll-tandoori.jpg",
    "tags": [
      "Non Veg",
      "Wrap",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "roll-chicken",
    "name": "Chicken Roll",
    "description": "Juicy shredded chicken with mild herbs and crunchy veggies wrapped in a soft roti wrap.",
    "price": 79,
    "category": "burgers",
    "categoryName": "Burgers & Wraps",
    "image": "/images/menu/roll-chicken.jpg",
    "tags": [
      "Non Veg",
      "Wrap",
      "Value",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "burger-paneer-delight",
    "name": "Paneer Delight Burger",
    "description": "Crispy golden spiced cottage cheese (paneer) patty with fresh vegetables and creamy herb dressing.",
    "price": 119,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/burger-paneer-delight.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Bestseller",
      "Paneer"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isVeg": true
  },
  {
    "id": "burger-veg",
    "name": "Veg Burger",
    "description": "Crispy mixed vegetable patty seasoned with aromatic herbs, topped with lettuce and mayo.",
    "price": 89,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/veggie-burger.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Classic"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "sandwich-veg",
    "name": "Veg Sandwich",
    "description": "Toasted multi-layer sandwich loaded with fresh veggies, melted cheese and spiced herb spread.",
    "price": 99,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/sandwich-veg.jpg",
    "tags": [
      "Veg",
      "Pure Veg"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "roll-veg",
    "name": "Veg Roll",
    "description": "Sautéed seasoned garden vegetables with tangy sauce rolled in a warm flaky paratha.",
    "price": 79,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/veggie-roll.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Wrap"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "fries-french-reg",
    "name": "French Fries (Regular)",
    "description": "Salted golden crispy potato french fries.",
    "price": 69,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/fries-french.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Snack"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "fries-french-large",
    "name": "French Fries (Large)",
    "description": "Jumbo portion of salted golden crispy potato french fries.",
    "price": 109,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/fries-french.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Snack"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "snack-veg-fingers",
    "name": "Veg Fingers (3 Pcs)",
    "description": "3 golden crunchy crumb-coated vegetable fingers served piping hot.",
    "price": 69,
    "category": "veggie",
    "categoryName": "Veggie Surprise",
    "image": "/images/menu/veggie-fingers.jpg",
    "tags": [
      "Veg",
      "Pure Veg",
      "Snack"
    ],
    "spiceLevel": "mild",
    "isVeg": true,
    "portion": "3 Pcs"
  },
  {
    "id": "bowl-biryani",
    "name": "Biryani Bowl",
    "description": "Fragrant spiced dum biryani rice served with a succulent roasted chicken piece and sides.",
    "price": 149,
    "category": "bowls",
    "categoryName": "Rice Bowls & Sandwiches",
    "image": "/images/menu/bowl-biryani.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Biryani",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true
  },
  {
    "id": "bowl-grill-chicken",
    "name": "Grill Chicken Rice Bowl",
    "description": "Steamed seasoned rice topped with tender grilled chicken and savory Indo/Oriental sauce.",
    "price": 149,
    "category": "bowls",
    "categoryName": "Rice Bowls & Sandwiches",
    "image": "/images/menu/bowl-grill-chicken.jpg",
    "tags": [
      "Non Veg",
      "Bowl",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "bowl-pop-chicken",
    "name": "Pop Chicken Rice Bowl",
    "description": "Aromatic flavored rice topped with crispy chicken popcorn and rich savory gravy.",
    "price": 149,
    "category": "bowls",
    "categoryName": "Rice Bowls & Sandwiches",
    "image": "/images/menu/bowl-pop-chicken.jpg",
    "tags": [
      "Non Veg",
      "Bowl",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "sandwich-chicken",
    "name": "Chicken Sandwich",
    "description": "Double-layer grilled club sandwich packed with seasoned chicken, fresh vegetables and creamy mayo.",
    "price": 119,
    "category": "bowls",
    "categoryName": "Rice Bowls & Sandwiches",
    "image": "/images/menu/sandwich-chicken.jpg",
    "tags": [
      "Non Veg",
      "Sandwich",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "snack-lollipoppers",
    "name": "Lollipoppers (Chicken Lollipops)",
    "description": "Frenched chicken wing drumettes shaped into lollipops, spiced and crisply fried.",
    "price": 139,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-lollipoppers.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true
  },
  {
    "id": "snack-mirchi-bites",
    "name": "Mirchi Bites (4 Pcs)",
    "description": "Crispy battered spicy green chili chicken bites for chili enthusiasts.",
    "price": 129,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-mirchi-bites.jpg",
    "tags": [
      "Non Veg",
      "Spicy",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isHalalChicken": true,
    "portion": "4 Pcs"
  },
  {
    "id": "snack-peri-peri-chwings",
    "name": "Peri Peri Chwings (3 Pcs)",
    "description": "Juicy chicken wings tossed in zesty African Peri-Peri seasoning with tangy heat.",
    "price": 115,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-chwings.jpg",
    "tags": [
      "Non Veg",
      "Spicy",
      "Wings",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isHalalChicken": true,
    "portion": "3 Pcs"
  },
  {
    "id": "snack-korean-pops",
    "name": "Korean Pops",
    "description": "Crunchy chicken bites tossed in sweet and fiery Korean glazed sauce.",
    "price": 99,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-korean-pops.jpg",
    "tags": [
      "Non Veg",
      "Spicy",
      "Halal"
    ],
    "spiceLevel": "hot",
    "isHalalChicken": true
  },
  {
    "id": "snack-krusty-bites",
    "name": "Krusty Bites",
    "description": "Crunchy spiced bite-size chicken snacks with Five Star special coating.",
    "price": 95,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-krusty-bites.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "snack-popcorn-reg",
    "name": "Chicken Popcorn (Regular)",
    "description": "Tender bite-sized chicken breast pieces coated in signature crunchy batter.",
    "price": 85,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-popcorn.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Snack",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true
  },
  {
    "id": "snack-popcorn-large",
    "name": "Chicken Popcorn (Large)",
    "description": "Jumbo box of crunchy bite-sized chicken breast popcorn.",
    "price": 149,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-popcorn.jpg",
    "tags": [
      "Non Veg",
      "Bestseller",
      "Snack",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true
  },
  {
    "id": "snack-loaded-popcorn-reg",
    "name": "Loaded Popcorn (Regular)",
    "description": "Hot crunchy chicken popcorn drenched in melted cheese sauce and seasonings.",
    "price": 99,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-loaded-popcorn.jpg",
    "tags": [
      "Non Veg",
      "Cheese",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "snack-loaded-popcorn-large",
    "name": "Loaded Popcorn (Large)",
    "description": "Jumbo portion of chicken popcorn loaded with warm cheddar cheese sauce.",
    "price": 169,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-loaded-popcorn.jpg",
    "tags": [
      "Non Veg",
      "Cheese",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true
  },
  {
    "id": "snack-cheese-shots-5",
    "name": "Chicken Cheese Shots (5 Pcs)",
    "description": "Crispy chicken bites with a molten core of melted gooey cheese.",
    "price": 99,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-cheese-shots.jpg",
    "tags": [
      "Non Veg",
      "Cheese",
      "Bestseller",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true,
    "portion": "5 Pcs"
  },
  {
    "id": "snack-cheese-shots-10",
    "name": "Chicken Cheese Shots (10 Pcs)",
    "description": "10 pieces of crispy chicken bites with molten melted cheese inside.",
    "price": 149,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-cheese-shots.jpg",
    "tags": [
      "Non Veg",
      "Cheese",
      "Bestseller",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isHalalChicken": true,
    "portion": "10 Pcs"
  },
  {
    "id": "snack-strips-3",
    "name": "Chicken Strips (3 Pcs)",
    "description": "100% whole chicken breast fillets cut into long strips and fried crisp.",
    "price": 99,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-strips.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "3 Pcs"
  },
  {
    "id": "snack-strips-5",
    "name": "Chicken Strips (5 Pcs)",
    "description": "5 pieces of 100% whole chicken breast crispy fried strips.",
    "price": 159,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-strips.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "5 Pcs"
  },
  {
    "id": "snack-loaded-fries-reg",
    "name": "Loaded Fries (Regular)",
    "description": "Golden french fries topped with warm cheddar cheese sauce and savory herbs.",
    "price": 89,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-loaded-fries.jpg",
    "tags": [
      "Veg",
      "Snack",
      "Cheese"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "snack-loaded-fries-large",
    "name": "Loaded Fries (Large)",
    "description": "Jumbo portion of golden french fries loaded with melted cheddar cheese sauce.",
    "price": 119,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-loaded-fries.jpg",
    "tags": [
      "Veg",
      "Snack",
      "Cheese"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "snack-fingers-3",
    "name": "Chicken Fingers (3 Pcs)",
    "description": "Spiced minced chicken fingers breaded and fried to crispiness.",
    "price": 69,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-veg-fingers.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "3 Pcs"
  },
  {
    "id": "snack-fingers-6",
    "name": "Chicken Fingers (6 Pcs)",
    "description": "6 pieces of seasoned crispy fried chicken fingers.",
    "price": 109,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-veg-fingers.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "serves": "3–4 People",
    "portion": "6 Pcs"
  },
  {
    "id": "snack-nuggets-4",
    "name": "Chicken Nuggets (4 Pcs)",
    "description": "Tender juicy chicken nuggets in a light crispy golden coating.",
    "price": 69,
    "category": "snacks",
    "categoryName": "Snack Attack",
    "image": "/images/menu/snack-nuggets.jpg",
    "tags": [
      "Non Veg",
      "Halal"
    ],
    "spiceLevel": "mild",
    "isHalalChicken": true,
    "portion": "4 Pcs"
  },
  {
    "id": "dessert-choco-lava",
    "name": "Choco Lava Cake",
    "description": "Warm chocolate cake with a molten liquid chocolate center that flows with every spoon.",
    "price": 89,
    "category": "desserts",
    "categoryName": "Desserts & Treats",
    "image": "/images/menu/dessert-choco-lava.jpg",
    "tags": [
      "Veg",
      "Dessert",
      "Chocolate",
      "Bestseller"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isVeg": true
  },
  {
    "id": "dessert-brownie-bomb",
    "name": "Brownie Bomb with Ice Cream",
    "description": "Warm fudgy chocolate brownie served with a scoop of premium vanilla ice cream.",
    "price": 99,
    "category": "desserts",
    "categoryName": "Desserts & Treats",
    "image": "/images/menu/dessert-brownie.jpg",
    "tags": [
      "Veg",
      "Dessert",
      "Bestseller"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isVeg": true
  },
  {
    "id": "dessert-ice-cream",
    "name": "Ice Cream (2 Scoops)",
    "description": "Two rich scoops of ice cream (Vanilla, Chocolate, or Moroccan Dry Fruit).",
    "price": 99,
    "category": "desserts",
    "categoryName": "Desserts & Treats",
    "image": "/images/menu/dessert-ice-cream.jpg",
    "tags": [
      "Veg",
      "Dessert"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "bev-shake-berry",
    "name": "Very Berry Shake",
    "description": "Thick chilled milkshake blended with real wild berries and cream.",
    "price": 99,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-shake-berry.jpg",
    "tags": [
      "Veg",
      "Shake",
      "Beverage"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "bev-shake-mango",
    "name": "Mango Chill Shake",
    "description": "Rich thick shake bursting with the golden flavor of Alphonso mangoes.",
    "price": 99,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-shake-mango.jpg",
    "tags": [
      "Veg",
      "Shake",
      "Beverage"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "bev-shake-currant",
    "name": "Black Currant Shake",
    "description": "Refreshing creamy shake infused with tart and sweet black currant puree.",
    "price": 99,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-shake-blackcurrant.jpg",
    "tags": [
      "Veg",
      "Shake",
      "Beverage"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "bev-mojito-classic",
    "name": "Classic Mojito",
    "description": "Sparkling soda cooler infused with crushed fresh mint leaves, lemon juice and cane sweetness.",
    "price": 79,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-mojito.jpg",
    "tags": [
      "Veg",
      "Cooler",
      "Beverage",
      "Bestseller"
    ],
    "spiceLevel": "mild",
    "isBestseller": true,
    "isVeg": true
  },
  {
    "id": "bev-cooler-blue",
    "name": "Blue Curacao Cooler",
    "description": "Vibrant electric blue citrus cooler with crushed ice and sparkling soda.",
    "price": 79,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-blue-curacao.jpg",
    "tags": [
      "Veg",
      "Cooler",
      "Beverage"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  },
  {
    "id": "bev-cooler-apple",
    "name": "Green Apple Cooler",
    "description": "Crisp and tangy green apple sparkle with mint and soda on ice.",
    "price": 79,
    "category": "beverages",
    "categoryName": "Shakes & Coolers",
    "image": "/images/menu/beverage-green-apple.jpg",
    "tags": [
      "Veg",
      "Cooler",
      "Beverage"
    ],
    "spiceLevel": "mild",
    "isVeg": true
  }
];
