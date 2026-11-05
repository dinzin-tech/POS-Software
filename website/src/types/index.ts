export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryName?: string;
  image: string;
  tags: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'peri-peri' | string;
  isBestseller?: boolean;
  isVeg?: boolean;
  isHalalChicken?: boolean;
  serves?: string;
  portion?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  trackInventory?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface StoreStatus {
  isOpen: boolean;
  statusText: string;
  message?: string;
  openingHours?: {
    display: string;
    openHour: number;
    closeHour: number;
    days: string;
  };
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions?: string;
}

export type OrderType = 'takeaway' | 'dine-in';

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
  legalName: string;
  tradeName: string;
  constitution: string;
  gstin: string;
  fssaiNumber: string;
  fssaiValidity?: string;
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
  menuApiUrl?: string;
  razorpayKeyId?: string;
}
