'use client';

import { useState, useEffect, useCallback } from 'react';
import { MenuItem, MenuCategory, StoreStatus } from '@/types';
import { menuItems as defaultMenuItems, menuCategories as defaultCategories } from '@/data/menu';
import { siteConfig } from '@/config/site';

interface LiveMenuState {
  items: MenuItem[];
  categories: MenuCategory[];
  storeStatus: StoreStatus;
  paymentConfig: PaymentConfig;
  isLoading: boolean;
  isLive: boolean;
  lastSyncedAt: string | null;
  refetch: () => Promise<void>;
}

export interface PaymentConfig {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
}

interface LiveBridgeCategory {
  id?: string;
  name?: string;
  slug?: string;
}

interface LiveBridgeItem {
  id?: string | number;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  category_name?: string;
  image?: string;
  tags?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'peri-peri';
  isBestseller?: boolean;
  isVeg?: boolean;
  isHalalChicken?: boolean;
  serves?: string;
  portion?: string;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  track_inventory?: boolean;
  is_active?: boolean;
}

export function useLiveMenu(): LiveMenuState {
  const [items, setItems] = useState<MenuItem[]>(defaultMenuItems);
  const [categories, setCategories] = useState<MenuCategory[]>([...defaultCategories]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isOpen: true,
    statusText: 'Open Now',
    message: 'Accepting online orders',
    openingHours: siteConfig.openingHours,
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    razorpayEnabled: true,
    razorpayKeyId: siteConfig.razorpayKeyId || '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const fetchLiveMenu = useCallback(async () => {
    const defaultApiUrl = siteConfig.menuApiUrl || '/dashboard/api.php';
    const candidateUrls = Array.from(new Set([
      defaultApiUrl,
      '/dashboard/api.php',
      '/sharedhost-mobile/api.php',
    ]));

    try {
      let data: any = null;
      for (const apiUrl of candidateUrls) {
        try {
          const targetUrl = apiUrl.includes('?') ? `${apiUrl}&action=menu` : `${apiUrl}?action=menu`;
          const res = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });
          if (res.ok) {
            const parsed = await res.json().catch(() => null);
            if (parsed && parsed.ok) {
              data = parsed;
              break;
            }
          }
        } catch {
          // try next candidate url
        }
      }

      if (!data || !data.ok) {
        throw new Error(data?.error || 'Failed to fetch live menu');
      }

      // Update store open/closed status
      if (typeof data.store_open === 'boolean') {
        setStoreStatus({
          isOpen: data.store_open,
          statusText: data.status_text || (data.store_open ? 'Open Now' : 'Currently Closed'),
          message: data.message || '',
          openingHours: data.opening_hours || siteConfig.openingHours,
        });
      }

      // Update payment configuration if provided by server
      if (data.payment_config && typeof data.payment_config === 'object') {
        setPaymentConfig({
          razorpayEnabled: data.payment_config.razorpay_enabled !== false,
          razorpayKeyId: data.payment_config.razorpay_key_id || siteConfig.razorpayKeyId || '',
        });
      }

      // Update categories if available
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        const catMap = new Map<string, MenuCategory>();
        defaultCategories.forEach((c) => catMap.set(c.id, c));
        (data.categories as LiveBridgeCategory[]).forEach((c) => {
          const id = c.slug || c.id || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'misc');
          catMap.set(id, {
            id,
            name: c.name || 'Category',
            slug: c.slug,
          });
        });
        setCategories(Array.from(catMap.values()));
      }

      // Update items if available
      if (Array.isArray(data.items) && data.items.length > 0) {
        const liveItemsList = data.items as LiveBridgeItem[];
        const liveMap = new Map<string, LiveBridgeItem>();
        const nameMap = new Map<string, LiveBridgeItem>();
        liveItemsList.forEach((it) => {
          if (it.id) liveMap.set(String(it.id).toLowerCase(), it);
          if (it.name) nameMap.set(String(it.name).toLowerCase().trim(), it);
        });

        const seenIds = new Set<string>();

        // Merge onto default rich items first
        const merged: MenuItem[] = defaultMenuItems.map((def) => {
          const live = liveMap.get(def.id.toLowerCase()) || nameMap.get(def.name.toLowerCase().trim());
          if (live) {
            seenIds.add(String(live.id).toLowerCase());
            return {
              ...def,
              price: typeof live.price === 'number' && live.price > 0 ? live.price : def.price,
              stockStatus: live.stock_status || (live.is_active === false ? 'out_of_stock' : 'in_stock'),
              stockQuantity: live.stock_quantity !== undefined ? live.stock_quantity : null,
              lowStockThreshold: live.low_stock_threshold !== undefined ? live.low_stock_threshold : null,
              trackInventory: Boolean(live.track_inventory),
              description: live.description && live.description.trim() ? live.description : def.description,
              image: live.image && live.image.trim() ? live.image : def.image,
            };
          }
          return def;
        });

        // Add any brand-new live items that are not in defaults
        for (const it of liveItemsList) {
          const itId = String(it.id || '').toLowerCase();
          const itName = String(it.name || '').toLowerCase().trim();
          if (!seenIds.has(itId) && !defaultMenuItems.some((d) => d.name.toLowerCase().trim() === itName)) {
            merged.push({
              id: String(it.id || Date.now()),
              name: it.name || 'Item',
              description: it.description || '',
              price: Number(it.price || 0),
              category: it.category || 'signature',
              categoryName: it.category_name || '',
              image: it.image || '/images/menu/signature-chicken-bucket.jpg',
              tags: Array.isArray(it.tags) ? it.tags : [],
              spiceLevel: it.spiceLevel || 'mild',
              isBestseller: Boolean(it.isBestseller),
              isVeg: Boolean(it.isVeg),
              isHalalChicken: Boolean(it.isHalalChicken),
              serves: it.serves || undefined,
              portion: it.portion || undefined,
              stockStatus: it.stock_status || (it.is_active === false ? 'out_of_stock' : 'in_stock'),
              stockQuantity: it.stock_quantity !== undefined ? it.stock_quantity : null,
              lowStockThreshold: it.low_stock_threshold !== undefined ? it.low_stock_threshold : null,
              trackInventory: Boolean(it.track_inventory),
            });
          }
        }

        setItems(merged);
        setIsLive(true);
        setLastSyncedAt(data.synced_at || new Date().toISOString());
      }
    } catch {
      // Keep existing items/defaults silently if network or host is unavailable
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void fetchLiveMenu();
    }, 0);

    // Poll every 30 seconds for live stock/status updates
    const interval = setInterval(() => {
      void fetchLiveMenu();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchLiveMenu]);

  return {
    items,
    categories,
    storeStatus,
    paymentConfig,
    isLoading,
    isLive,
    lastSyncedAt,
    refetch: fetchLiveMenu,
  };
}
