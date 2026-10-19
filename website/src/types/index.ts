export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'signature' | 'combos' | 'burgers' | 'bowls' | 'snacks' | 'veggie' | 'beverages' | 'desserts';
  image: string;
  tags: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'peri-peri';
  isBestseller?: boolean;
  isVeg?: boolean;
  serves?: string;
  portion?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions?: string;
}

export type OrderType = 'delivery' | 'pickup' | 'dine-in';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
  orderType: OrderType;
  tableNumber?: string;
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  dishRecommended: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  branch: string;
  tagline: string;
  description: string;
  city: string;
  address: string;
  landmark: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  openingHours: {
    display: string;
    openHour: number; // 24-hr format (e.g. 11)
    closeHour: number; // 24-hr format (e.g. 23)
    days: string;
  };
  stats: {
    label: string;
    value: string;
    subtext: string;
  }[];
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
}
