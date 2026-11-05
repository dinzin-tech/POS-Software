'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Store,
  UtensilsCrossed,
  FileText,
  Send,
  Banknote,
  QrCode,
  RotateCcw,
  Sparkles,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  SearchCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLiveMenu } from '@/lib/useLiveMenu';
import { useCartStore } from '@/store/useCartStore';
import { siteConfig } from '@/config/site';
import DishPlaceholder from '@/components/ui/DishPlaceholder';
import { MenuItem, OrderType } from '@/types';

interface StoredOrderTicket {
  order_id: string;
  order_number: string;
  bill_number?: string | null;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  table_number: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
  bill_url: string;
  status: 'pending' | 'confirmed' | 'ready';
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existing = document.getElementById('razorpay-checkout-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrderPageClient() {
  const searchParams = useSearchParams();
  const { items: menuItems, categories, storeStatus, isLive } = useLiveMenu();

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    specialInstructions,
    setSpecialInstructions,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'menu' | 'ticket' | 'lookup'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState<string>('all');


  // In-Store Checkout Drawer state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Active Order & Ticket state
  const [activeTicket, setActiveTicket] = useState<StoredOrderTicket | null>(null);
  const [recentOrders, setRecentOrders] = useState<StoredOrderTicket[]>([]);

  // Token Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const cartCount = getItemCount();
  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const defaultApiUrl = siteConfig.menuApiUrl || '/dashboard/api.php';
  const candidateUrls = useMemo(() => Array.from(new Set([
    defaultApiUrl,
    '/dashboard/api.php',
    '/sharedhost-mobile/api.php',
  ])), [defaultApiUrl]);

  // Load customer preferences and recent orders from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedName = localStorage.getItem('five_star_customer_name') || '';
      const savedPhone = localStorage.getItem('five_star_customer_phone') || '';
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);

      const rawOrders = localStorage.getItem('five_star_recent_orders');
      if (rawOrders) {
        const parsed: StoredOrderTicket[] = JSON.parse(rawOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentOrders(parsed);
          // Set latest order as default active ticket
          setActiveTicket(parsed[0]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Lookup order by Token or Phone
  const fetchOrderByToken = useCallback(async (tokenOrPhone: string) => {
    const clean = tokenOrPhone.trim();
    if (!clean) return;

    setIsLookingUp(true);
    setLookupError('');

    try {
      let foundData: any = null;
      for (const apiUrl of candidateUrls) {
        try {
          const isPhone = /^\d{10}$/.test(clean.replace(/\D/g, ''));
          const param = isPhone ? `phone=${encodeURIComponent(clean)}` : `order_id=${encodeURIComponent(clean)}`;
          const url = apiUrl.includes('?')
            ? `${apiUrl}&action=order_status&${param}`
            : `${apiUrl}?action=order_status&${param}`;

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.ok) {
              foundData = data;
              break;
            }
          }
        } catch {
          // try next
        }
      }

      if (!foundData || !foundData.ok) {
        throw new Error('Order not found. Please verify your Token # (e.g. TOK-0009) or 10-digit mobile number.');
      }

      const ticket: StoredOrderTicket = {
        order_id: foundData.order_id || foundData.order_number,
        order_number: foundData.order_number || foundData.order_id,
        bill_number: foundData.bill_number,
        customer_name: foundData.customer_name || 'Customer',
        customer_phone: foundData.customer_phone || '',
        order_type: foundData.order_type || 'Takeaway',
        table_number: foundData.table_number || '',
        items: Array.isArray(foundData.items) ? foundData.items : [],
        subtotal: Number(foundData.subtotal || foundData.total || 0),
        tax_amount: Number(foundData.tax_amount || 0),
        total: Number(foundData.total || 0),
        paid_amount: Number(foundData.paid_amount || 0),
        payment_status: foundData.payment_status || 'PAID',
        payment_method: foundData.payment_method || 'ONLINE',
        created_at: foundData.created_at || 'Just now',
        bill_url: foundData.bill_url || `/bill.php?id=${encodeURIComponent(foundData.order_number || foundData.order_id)}`,
        status: foundData.status === 'confirmed' ? 'confirmed' : 'pending',
      };

      setActiveTicket(ticket);
      setActiveTab('ticket');

      // Save to recent orders
      setRecentOrders((prev) => {
        const filtered = prev.filter((o) => o.order_number !== ticket.order_number);
        const updated = [ticket, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('five_star_recent_orders', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err: any) {
      setLookupError(err?.message || 'Could not find order. Please check your token or phone.');
    } finally {
      setIsLookingUp(false);
    }
  }, [candidateUrls]);

  // Parse URL query parameters (type, token)
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const tokenParam = searchParams.get('token') || searchParams.get('order_id') || searchParams.get('id');

    if (typeParam) {
      if (typeParam.toLowerCase() === 'takeaway') {
        setOrderType('takeaway');
      } else if (typeParam.toLowerCase() === 'dine-in') {
        setOrderType('dine-in');
      }
    }

    // Direct token view if specified in URL
    if (tokenParam) {
      fetchOrderByToken(tokenParam);
    }
  }, [searchParams, setOrderType, fetchOrderByToken]);

  // Live polling for official POS bill number assignment when ticket is pending
  useEffect(() => {
    if (!activeTicket || activeTicket.bill_number) return;

    let attempts = 0;
    const maxAttempts = 20;
    const pollId = setInterval(async () => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(pollId);
        return;
      }

      try {
        for (const apiUrl of candidateUrls) {
          const url = apiUrl.includes('?')
            ? `${apiUrl}&action=order_status&order_id=${encodeURIComponent(activeTicket.order_number)}`
            : `${apiUrl}?action=order_status&order_id=${encodeURIComponent(activeTicket.order_number)}`;

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.bill_number && typeof data.bill_number === 'string') {
              setActiveTicket((prev) => {
                if (!prev) return null;
                const updated = {
                  ...prev,
                  bill_number: data.bill_number,
                  status: 'confirmed' as const,
                };
                // update in storage
                setRecentOrders((old) => {
                  const list = old.map((o) => o.order_number === updated.order_number ? updated : o);
                  try {
                    localStorage.setItem('five_star_recent_orders', JSON.stringify(list));
                  } catch {
                    // ignore
                  }
                  return list;
                });
                return updated;
              });
              clearInterval(pollId);
              break;
            }
          }
        }
      } catch {
        // ignore polling error
      }
    }, 2500);

    return () => clearInterval(pollId);
  }, [activeTicket, candidateUrls]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (activeCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const activeCat = activeCategory.toLowerCase();
        if (itemCat !== activeCat && item.categoryName?.toLowerCase() !== activeCat) {
          return false;
        }
      }
      if (vegOnly && !item.isVeg) {
        return false;
      }
      if (selectedSpice !== 'all' && item.spiceLevel !== selectedSpice) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, activeCategory, vegOnly, selectedSpice, searchQuery]);

  // Item quantity map in cart for direct card steppers
  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((ci) => {
      map.set(ci.item.id, ci.quantity);
    });
    return map;
  }, [cartItems]);

  // Submit in-store order
  const submitInStoreOrder = async (paymentData: {
    payment_status: 'paid' | 'unpaid';
    payment_method: string;
    payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => {
    setIsSubmitting(true);
    setCheckoutError('');

    try {
      const orderPayload = {
        name: customerName.trim(),
        customer_name: customerName.trim(),
        phone: customerPhone.trim(),
        customer_phone: customerPhone.trim(),
        order_type: orderType,
        table_number: '',
        delivery_address: '',
        special_instructions: specialInstructions.trim(),
        notes: specialInstructions.trim(),
        items: cartItems.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          instructions: ci.instructions || '',
        })),
        subtotal,
        tax_amount: tax,
        delivery_fee: 0,
        total,
        payment_status: paymentData.payment_status,
        payment_method: paymentData.payment_method,
        payment_id: paymentData.payment_id || '',
        paid_amount: paymentData.payment_status === 'paid' ? total : 0,
        razorpay_order_id: paymentData.razorpay_order_id || '',
        razorpay_signature: paymentData.razorpay_signature || '',
      };

      let submittedData: any = null;
      let lastError = 'Failed to submit in-store order. Please ask staff or try again.';

      for (const apiUrl of candidateUrls) {
        try {
          const submitUrl = apiUrl.includes('?') ? `${apiUrl}&action=submit_order` : `${apiUrl}?action=submit_order`;
          const res = await fetch(submitUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(orderPayload),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.ok) {
            submittedData = data;
            break;
          } else if (data?.error) {
            lastError = data.error;
          }
        } catch (e: any) {
          lastError = e?.message || lastError;
        }
      }

      if (!submittedData) {
        throw new Error(lastError);
      }

      // Persist customer info for repeat dining
      try {
        localStorage.setItem('five_star_customer_name', customerName.trim());
        localStorage.setItem('five_star_customer_phone', customerPhone.trim());
      } catch {
        // ignore
      }

      const assignedToken = submittedData.order_number || submittedData.order_id || `TOK-${Date.now().toString().slice(-4)}`;

      const newTicket: StoredOrderTicket = {
        order_id: submittedData.order_id || assignedToken,
        order_number: assignedToken,
        bill_number: submittedData.bill_number || null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        order_type: orderType === 'dine-in' ? 'Dine-In' : 'Takeaway',
        table_number: '',
        items: cartItems.map((ci) => ({
          name: ci.item.name,
          quantity: ci.quantity,
          price: ci.item.price,
          total: ci.item.price * ci.quantity,
        })),
        subtotal,
        tax_amount: tax,
        total,
        paid_amount: paymentData.payment_status === 'paid' ? total : 0,
        payment_status: paymentData.payment_status === 'paid' ? 'PAID' : 'PAY_AT_COUNTER',
        payment_method: paymentData.payment_method.toUpperCase(),
        created_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        bill_url: `/bill.php?id=${encodeURIComponent(assignedToken)}`,
        status: 'pending',
      };

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f5c542', '#38b2ac', '#d93829'],
        });
      } catch {
        // ignore
      }

      // Update state and localStorage
      setActiveTicket(newTicket);
      setRecentOrders((prev) => {
        const updated = [newTicket, ...prev.filter((o) => o.order_number !== newTicket.order_number)].slice(0, 10);
        try {
          localStorage.setItem('five_star_recent_orders', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      clearCart();
      setIsCheckoutOpen(false);
      setActiveTab('ticket');
    } catch (err: any) {
      setCheckoutError(err?.message || 'Could not place order. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim()) {
      setCheckoutError('Please enter your name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().replace(/\D/g, '').length < 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number for WhatsApp updates.');
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (paymentMethod === 'online') {
      setIsSubmitting(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
        setIsSubmitting(false);
        setCheckoutError('Razorpay payment gateway failed to load. Please select "Pay at Counter".');
        return;
      }

      let razorpayKey = siteConfig.razorpayKeyId || 'rzp_test_5StarNelamangala';
      for (const apiUrl of candidateUrls) {
        try {
          const cfgUrl = apiUrl.includes('?') ? `${apiUrl}&action=payment_config` : `${apiUrl}?action=payment_config`;
          const res = await fetch(cfgUrl);
          if (res.ok) {
            const cfg = await res.json().catch(() => ({}));
            if (cfg?.razorpay_key_id && typeof cfg.razorpay_key_id === 'string' && cfg.razorpay_key_id.trim() !== '') {
              razorpayKey = cfg.razorpay_key_id.trim();
              break;
            }
          }
        } catch {
          // ignore
        }
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: siteConfig.name,
        description: `${orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'} Order • Nelamangala Flagship`,
        image: '/images/logo/five-star-emblem.png',
        prefill: {
          name: customerName.trim(),
          contact: customerPhone.trim(),
        },
        theme: {
          color: '#d93829',
        },
        handler: async (response: any) => {
          await submitInStoreOrder({
            payment_status: 'paid',
            payment_method: 'online',
            payment_id: response.razorpay_payment_id || `PAY-${Date.now().toString().slice(-6)}`,
            razorpay_order_id: response.razorpay_order_id || '',
            razorpay_signature: response.razorpay_signature || '',
          });
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (failResp: any) => {
          setIsSubmitting(false);
          setCheckoutError(failResp?.error?.description || 'Payment failed or cancelled. Please try again or pay at counter.');
        });
        rzp.open();
      } catch (rzpErr: any) {
        setIsSubmitting(false);
        setCheckoutError(rzpErr?.message || 'Error opening Razorpay payment window.');
      }
    } else {
      // Pay at Counter
      await submitInStoreOrder({
        payment_status: 'unpaid',
        payment_method: 'cash',
        payment_id: '',
      });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--ks-lacquer-black)] text-[var(--ks-text-warm)] pb-28">
      {/* 1. In-Store Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--ks-lacquer-deep)]/95 backdrop-blur-md border-b border-[var(--ks-gold-hairline)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-8 h-8 rounded-[2px] overflow-hidden border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] shrink-0">
              <Image
                src="/images/logo/five-star-emblem.png"
                alt="Five Star Chicken"
                fill
                sizes="32px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm sm:text-base font-light tracking-[0.14em] text-[var(--ks-champagne)] uppercase leading-none">
                Five Star <span className="text-[var(--ks-kinpaku)] font-mono text-[9px] px-1 py-0.2 rounded border border-[var(--ks-gold-hairline)]">ORDER</span>
              </span>
              <span className="text-[10px] text-[var(--ks-text-muted)] font-mono leading-tight mt-0.5">
                Nelamangala Flagship
              </span>
            </div>
          </Link>

          {/* Order Type Toggle: Dine-In or Takeaway (No table selection) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] text-xs font-mono">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] transition-colors ${
                  (mounted ? orderType : 'takeaway') === 'dine-in'
                    ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold'
                    : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Dine-In</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] transition-colors ${
                  (mounted ? orderType : 'takeaway') === 'takeaway'
                    ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold'
                    : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Takeaway</span>
              </button>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="relative p-2 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] hover:border-[var(--ks-gold-hairline-strong)] transition-colors shrink-0"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[var(--ks-kinpaku)]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-mono text-[11px] font-bold rounded-[2px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Top Active Order Banner (If customer has placed an order) */}
        {mounted && activeTicket && (
          <div className="max-w-4xl mx-auto mt-2.5 pt-2 border-t border-[var(--ks-gold-hairline)]/50 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[var(--ks-champagne)] truncate">
              <span className="w-2 h-2 rounded-full bg-[var(--ks-patina)] animate-ping" />
              <span className="truncate">
                Active Token: <strong className="text-[var(--ks-kinpaku)]">#{activeTicket.order_number}</strong>
                {activeTicket.bill_number ? ` • ${activeTicket.bill_number}` : ' • In Kitchen'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('ticket')}
              className="text-[var(--ks-kinpaku)] underline underline-offset-2 hover:text-[var(--ks-champagne)] transition-colors shrink-0 ml-2"
            >
              View Ticket →
            </button>
          </div>
        )}
      </header>

      {/* 2. Mode Tabs: Menu / Active Ticket / Order Lookup */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--ks-raised-lacquer)] rounded-[4px] border border-[var(--ks-gold-hairline)] font-mono text-xs">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-3 rounded-[2px] transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'menu'
                ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold shadow-sm'
                : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Digital Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('ticket')}
            className={`py-2 px-3 rounded-[2px] transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'ticket'
                ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold shadow-sm'
                : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Order Token</span>
            {mounted && activeTicket && activeTab !== 'ticket' && (
              <span className="w-2 h-2 rounded-full bg-[var(--ks-patina)] absolute top-1 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`py-2 px-3 rounded-[2px] transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold shadow-sm'
                : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
            }`}
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>Find Order</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW A: DIGITAL MENU & INSTANT IN-STORE ORDERING          */}
      {/* ========================================================= */}
      {activeTab === 'menu' && (
        <div className="max-w-4xl mx-auto px-4 mt-3 space-y-4">
          {/* Store Live Status Notification */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] text-xs font-mono">
            <div className="flex items-center gap-2 text-[var(--ks-champagne)]">
              <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-[var(--ks-patina)]' : 'bg-[var(--ks-vermilion)]'}`} />
              <span>{storeStatus.statusText}</span>
              <span className="text-[var(--ks-text-muted)] hidden sm:inline">• {storeStatus.message || '100% Halal Certified'}</span>
            </div>
            {isLive && (
              <span className="text-[var(--ks-kinpaku)] inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                POS Sync
              </span>
            )}
          </div>

          {/* Search & Quick Veg / Spicy Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--ks-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crispy chicken, burgers, combos, rolls..."
                className="w-full bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] rounded-[4px] pl-10 pr-9 py-2 text-sm text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:outline-none focus:border-[var(--ks-kinpaku)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Dietary Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border transition-all ${
                  vegOnly
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-[var(--ks-raised-lacquer)] border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Veg Only</span>
              </button>

              <button
                onClick={() => setSelectedSpice(selectedSpice === 'all' ? 'hot' : 'all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border transition-all ${
                  selectedSpice !== 'all'
                    ? 'bg-red-950/40 border-red-500 text-red-400 font-bold'
                    : 'bg-[var(--ks-raised-lacquer)] border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)]'
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Spicy Dishes</span>
              </button>

              {(searchQuery || vegOnly || selectedSpice !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setVegOnly(false);
                    setSelectedSpice('all');
                  }}
                  className="text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] text-xs underline ml-auto pl-2"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-[var(--ks-gold-hairline)]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold'
                  : 'bg-[var(--ks-raised-lacquer)] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] border border-[var(--ks-gold-hairline)]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold'
                    : 'bg-[var(--ks-raised-lacquer)] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] border border-[var(--ks-gold-hairline)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dish List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {filteredItems.map((item) => {
              const qtyInCart = mounted ? (cartItemMap.get(item.id) || 0) : 0;
              const isOutOfStock = item.stockStatus === 'out_of_stock';

              return (
                <div
                  key={item.id}
                  className={`ks-tile rounded-[6px] p-3 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] flex gap-3 transition-colors ${
                    isOutOfStock ? 'opacity-60' : 'hover:border-[var(--ks-gold-hairline-strong)]'
                  }`}
                >
                  {/* Dish Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[4px] overflow-hidden bg-[var(--ks-lacquer-deep)] shrink-0 border border-[var(--ks-gold-hairline)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <DishPlaceholder name={item.name} category={item.category} isVeg={item.isVeg} />
                    )}

                    {/* Veg / Non-Veg emblem */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      {item.isVeg ? (
                        <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-500 bg-[var(--ks-lacquer-deep)] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-[2px] border border-red-600 bg-[var(--ks-lacquer-deep)] flex items-center justify-center">
                          <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dish Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-title text-sm sm:text-base font-semibold text-[var(--ks-champagne)] leading-tight truncate">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--ks-text-muted)] line-clamp-2 mt-1 leading-relaxed font-body">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--ks-gold-hairline)]/60">
                      <div className="font-mono text-sm font-bold text-[var(--ks-kinpaku)]">
                        ₹{item.price}
                      </div>

                      {/* Stepper / Add button */}
                      {isOutOfStock ? (
                        <span className="text-[11px] font-mono text-[var(--ks-vermilion)] bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50">
                          Sold Out
                        </span>
                      ) : qtyInCart > 0 ? (
                        <div className="inline-flex items-center gap-2 bg-[var(--ks-lacquer-black)] border border-[var(--ks-kinpaku)] rounded-[4px] px-1 py-0.5 font-mono text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                            className="p-1 hover:text-[var(--ks-kinpaku)] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-[var(--ks-champagne)] min-w-[16px] text-center">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                            className="p-1 hover:text-[var(--ks-kinpaku)] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item, 1)}
                          className="ks-btn-primary py-1 px-3 text-xs rounded-[2px] flex items-center gap-1 font-mono"
                        >
                          <Plus className="w-3 h-3" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 px-4 rounded-[6px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] space-y-2 font-mono">
              <UtensilsCrossed className="w-8 h-8 text-[var(--ks-text-muted)] mx-auto" />
              <p className="text-sm text-[var(--ks-champagne)]">No items match your search or filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setVegOnly(false);
                  setSelectedSpice('all');
                  setActiveCategory('all');
                }}
                className="text-xs text-[var(--ks-kinpaku)] underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: ORDER TOKEN & LIVE KITCHEN TICKET                 */}
      {/* ========================================================= */}
      {activeTab === 'ticket' && (
        <div className="max-w-xl mx-auto px-4 mt-4 space-y-4">
          {activeTicket ? (
            <div className="ks-tile rounded-[8px] p-5 sm:p-6 bg-[var(--ks-raised-lacquer)] border-2 border-[var(--ks-kinpaku)] shadow-xl relative overflow-hidden">
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--ks-kinpaku)] via-[var(--ks-patina)] to-[var(--ks-kinpaku)]" />

              {/* Huge Token Callout */}
              <div className="text-center py-3 border-b border-[var(--ks-gold-hairline)] space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--ks-text-muted)]">
                  Restaurant Order Token
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ks-kinpaku)] py-1">
                  #{activeTicket.order_number}
                </div>
                <p className="text-xs text-[var(--ks-champagne)] font-mono">
                  Show or quote Token <strong className="text-[var(--ks-kinpaku)]">#{activeTicket.order_number}</strong> at the counter or to your server.
                </p>
              </div>

              {/* POS Invoice & Fulfillment Meta */}
              <div className="py-3 border-b border-[var(--ks-gold-hairline)] grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[var(--ks-text-muted)] block text-[11px]">Official POS Invoice:</span>
                  {activeTicket.bill_number ? (
                    <span className="font-bold text-[var(--ks-patina)]">{activeTicket.bill_number}</span>
                  ) : (
                    <span className="text-[var(--ks-text-muted)] flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--ks-patina)]" />
                      Syncing POS...
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[var(--ks-text-muted)] block text-[11px]">Fulfillment:</span>
                  <span className="font-bold text-[var(--ks-champagne)]">
                    {activeTicket.order_type}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[var(--ks-text-muted)] block text-[11px]">Customer:</span>
                  <span className="text-[var(--ks-champagne)]">{activeTicket.customer_name}</span>
                </div>

                <div className="pt-1 text-right">
                  <span className="text-[var(--ks-text-muted)] block text-[11px]">Payment:</span>
                  <span className={`font-semibold ${activeTicket.payment_status === 'PAID' ? 'text-[var(--ks-kinpaku)]' : 'text-amber-400'}`}>
                    {activeTicket.payment_status === 'PAID' ? '✅ Paid Online' : '💵 Pay at Counter'}
                  </span>
                </div>
              </div>

              {/* Live Kitchen Status Stepper */}
              <div className="py-4 border-b border-[var(--ks-gold-hairline)] space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ks-text-muted)] block">
                  Kitchen Live Progress
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[var(--ks-lacquer-deep)] border border-[var(--ks-patina)] text-[var(--ks-patina)]">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                    <span>Confirmed</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--ks-lacquer-deep)] border border-[var(--ks-kinpaku)] text-[var(--ks-kinpaku)] animate-pulse">
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <span>Preparing 👨‍🍳</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)]">
                    <Store className="w-4 h-4 mx-auto mb-1" />
                    <span>Ready for Pickup</span>
                  </div>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="py-3 border-b border-[var(--ks-gold-hairline)] space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ks-text-muted)]">
                  Ordered Items ({activeTicket.items.length})
                </span>
                <div className="space-y-1.5 text-xs font-mono">
                  {activeTicket.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[var(--ks-champagne)]">
                      <span>{it.name} <strong className="text-[var(--ks-text-muted)]">x{it.quantity}</strong></span>
                      <span>₹{it.total || (it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Totals */}
              <div className="py-3 border-b border-[var(--ks-gold-hairline)] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[var(--ks-text-muted)]">
                  <span>Item Total:</span>
                  <span>₹{activeTicket.total}</span>
                </div>
                {activeTicket.tax_amount > 0 && (
                  <div className="flex justify-between text-[11px] text-[var(--ks-text-muted)]">
                    <span>GST (5% Included):</span>
                    <span>₹{activeTicket.tax_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[var(--ks-kinpaku)] pt-1 border-t border-[var(--ks-gold-hairline)]/50">
                  <span>Grand Total:</span>
                  <span>₹{activeTicket.total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <a
                  href={`/bill.php?id=${encodeURIComponent(activeTicket.order_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full ks-btn-primary py-2.5 text-xs rounded-[3px] flex items-center justify-center gap-2 font-mono"
                >
                  <FileText className="w-4 h-4" />
                  <span>View / Print 80mm Official Bill</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const msg = `Hi Five Star Chicken, I placed in-store order #${activeTicket.order_number}. Customer: ${activeTicket.customer_name}.`;
                      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full ks-btn-secondary py-2 text-xs rounded-[3px] flex items-center justify-center gap-1.5 font-mono"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full ks-btn-secondary py-2 text-xs rounded-[3px] flex items-center justify-center gap-1.5 font-mono text-[var(--ks-champagne)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Order More</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-[6px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] space-y-3 font-mono">
              <QrCode className="w-10 h-10 text-[var(--ks-kinpaku)] mx-auto" />
              <h3 className="text-base font-semibold text-[var(--ks-champagne)]">No Active Ticket Found</h3>
              <p className="text-xs text-[var(--ks-text-muted)] max-w-sm mx-auto leading-relaxed">
                You haven&apos;t placed an order in this browser session yet. Choose dishes from the menu to generate your live order token!
              </p>
              <button
                onClick={() => setActiveTab('menu')}
                className="ks-btn-primary py-2 px-5 text-xs rounded-[2px] inline-flex items-center gap-1.5"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW C: ORDER & TOKEN LOOKUP (SEARCH ANY TOKEN / PHONE)   */}
      {/* ========================================================= */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto px-4 mt-4 space-y-4 font-mono">
          <div className="ks-tile rounded-[6px] p-5 bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] space-y-3">
            <h3 className="text-sm font-semibold text-[var(--ks-champagne)] flex items-center gap-2">
              <SearchCheck className="w-4 h-4 text-[var(--ks-kinpaku)]" />
              <span>Track Order or Token</span>
            </h3>
            <p className="text-xs text-[var(--ks-text-muted)] leading-relaxed font-body">
              Enter your Token # (e.g. <strong className="text-[var(--ks-champagne)]">TOK-0009</strong>) or your 10-digit mobile number to view live kitchen status and official bill.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchOrderByToken(lookupQuery);
              }}
              className="space-y-2 pt-1"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="e.g. TOK-0009 or 9845012345"
                  className="flex-1 bg-[var(--ks-lacquer-black)] border border-[var(--ks-gold-hairline)] rounded-[3px] px-3 py-2 text-sm text-[var(--ks-champagne)] focus:outline-none focus:border-[var(--ks-kinpaku)] font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="ks-btn-primary px-4 py-2 text-xs rounded-[3px] shrink-0 font-bold"
                >
                  {isLookingUp ? 'Searching...' : 'Find'}
                </button>
              </div>

              {lookupError && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Recent Orders in this device */}
          {recentOrders.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-[var(--ks-text-muted)] uppercase tracking-wider block">
                Recent Orders on this Phone
              </span>
              <div className="space-y-2">
                {recentOrders.map((ord) => (
                  <button
                    key={ord.order_number}
                    onClick={() => {
                      setActiveTicket(ord);
                      setActiveTab('ticket');
                    }}
                    className="w-full text-left p-3 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-gold-hairline-strong)] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ks-kinpaku)]">#{ord.order_number}</span>
                        {ord.bill_number && (
                          <span className="text-[11px] text-[var(--ks-patina)]">({ord.bill_number})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--ks-text-muted)] block mt-0.5">
                        {ord.order_type} • ₹{ord.total} • {ord.created_at}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--ks-text-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. STICKY BOTTOM CART BAR                                 */}
      {/* ========================================================= */}
      {mounted && cartCount > 0 && activeTab === 'menu' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-[var(--ks-lacquer-deep)]/95 backdrop-blur-md border-t border-[var(--ks-gold-hairline-strong)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col font-mono">
              <span className="text-xs text-[var(--ks-champagne)] font-bold">
                {cartCount} item{cartCount > 1 ? 's' : ''} added
              </span>
              <span className="text-sm font-extrabold text-[var(--ks-kinpaku)]">
                ₹{total} <span className="text-[10px] text-[var(--ks-text-muted)] font-normal">(incl. 5% GST)</span>
              </span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="ks-btn-primary py-2.5 px-5 text-xs rounded-[3px] flex items-center gap-2 font-mono font-bold shadow-lg shadow-[var(--ks-kinpaku)]/10"
            >
              <span>Review Order & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* 5. IN-STORE CHECKOUT DRAWER / MODAL                       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[12px] sm:rounded-[8px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline-strong)] p-5 space-y-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--ks-gold-hairline)] pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--ks-champagne)]">
                  <ShoppingBag className="w-4 h-4 text-[var(--ks-kinpaku)]" />
                  <span>Review Order & Checkout</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items Summary in Cart */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-[var(--ks-lacquer-black)] border border-[var(--ks-gold-hairline)]/50"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-[var(--ks-champagne)] block truncate">
                        {ci.item.name}
                      </span>
                      <span className="text-[11px] text-[var(--ks-kinpaku)]">
                        ₹{ci.item.price} each
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center gap-1.5 border border-[var(--ks-gold-hairline)] rounded px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                          className="p-0.5 hover:text-[var(--ks-kinpaku)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold min-w-[14px] text-center">{ci.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                          className="p-0.5 hover:text-[var(--ks-kinpaku)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-[var(--ks-champagne)] min-w-[50px] text-right">
                        ₹{ci.item.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kitchen Special Instructions */}
              <div>
                <label className="text-[11px] text-[var(--ks-text-muted)] block mb-1">
                  Kitchen Notes / Cooking Instructions (Optional):
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra crispy, less spice, pack ketchup"
                  className="w-full bg-[var(--ks-lacquer-black)] border border-[var(--ks-gold-hairline)] rounded-[3px] px-3 py-2 text-xs text-[var(--ks-champagne)] focus:outline-none focus:border-[var(--ks-kinpaku)]"
                />
              </div>

              {/* Customer Info Form */}
              <form onSubmit={handleStartPayment} className="space-y-3 pt-2 border-t border-[var(--ks-gold-hairline)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-[var(--ks-text-muted)] block mb-1">
                      Your Name <strong className="text-[var(--ks-kinpaku)]">*</strong>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full bg-[var(--ks-lacquer-black)] border border-[var(--ks-gold-hairline)] rounded-[3px] px-3 py-2 text-xs text-[var(--ks-champagne)] focus:outline-none focus:border-[var(--ks-kinpaku)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--ks-text-muted)] block mb-1">
                      10-Digit Mobile # <strong className="text-[var(--ks-kinpaku)]">*</strong>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      className="w-full bg-[var(--ks-lacquer-black)] border border-[var(--ks-gold-hairline)] rounded-[3px] px-3 py-2 text-xs text-[var(--ks-champagne)] focus:outline-none focus:border-[var(--ks-kinpaku)]"
                      required
                    />
                  </div>
                </div>

                {/* Order Type Choice (Dine-In / Takeaway) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[var(--ks-text-muted)] block">
                    Order Type:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine-in')}
                      className={`p-2.5 rounded-[3px] border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors ${
                        orderType === 'dine-in'
                          ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold border-[var(--ks-kinpaku)]'
                          : 'bg-[var(--ks-lacquer-black)] text-[var(--ks-text-muted)] border-[var(--ks-gold-hairline)] hover:text-[var(--ks-champagne)]'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Dine-In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`p-2.5 rounded-[3px] border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors ${
                        orderType === 'takeaway'
                          ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold border-[var(--ks-kinpaku)]'
                          : 'bg-[var(--ks-lacquer-black)] text-[var(--ks-text-muted)] border-[var(--ks-gold-hairline)] hover:text-[var(--ks-champagne)]'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Takeaway</span>
                    </button>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[var(--ks-text-muted)] block">
                    Choose Payment Option:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-2.5 rounded-[4px] border text-left flex flex-col justify-between transition-colors ${
                        paymentMethod === 'online'
                          ? 'bg-[var(--ks-lacquer-deep)] border-[var(--ks-kinpaku)] text-[var(--ks-champagne)]'
                          : 'bg-[var(--ks-lacquer-black)] border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)]'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5 text-[var(--ks-kinpaku)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Pay Online
                      </span>
                      <span className="text-[10px] text-[var(--ks-text-muted)] mt-1">
                        UPI, GPay, PhonePe, Cards
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2.5 rounded-[4px] border text-left flex flex-col justify-between transition-colors ${
                        paymentMethod === 'cash'
                          ? 'bg-[var(--ks-lacquer-deep)] border-[var(--ks-kinpaku)] text-[var(--ks-champagne)]'
                          : 'bg-[var(--ks-lacquer-black)] border-[var(--ks-gold-hairline)] text-[var(--ks-text-muted)]'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5 text-[var(--ks-champagne)]">
                        <Banknote className="w-3.5 h-3.5" />
                        Pay at Counter
                      </span>
                      <span className="text-[10px] text-[var(--ks-text-muted)] mt-1">
                        Cash or UPI upon arrival
                      </span>
                    </button>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="pt-2 border-t border-[var(--ks-gold-hairline)] space-y-1">
                  <div className="flex justify-between text-[var(--ks-text-muted)]">
                    <span>Item Total:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--ks-text-muted)]">
                    <span>GST (5% Included):</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[var(--ks-kinpaku)] pt-1 border-t border-[var(--ks-gold-hairline)]/50">
                    <span>Total Amount:</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full ks-btn-primary py-3 text-xs rounded-[3px] font-bold flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span>Processing Order & KOT...</span>
                  ) : paymentMethod === 'online' ? (
                    <span>Pay ₹{total} via Razorpay & Send to Kitchen →</span>
                  ) : (
                    <span>Confirm Order (Pay ₹{total} at Counter) →</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
