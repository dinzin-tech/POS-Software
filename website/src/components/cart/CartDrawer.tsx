'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Send,
  CheckCircle2,
  Store,
  UtensilsCrossed,
  ArrowRight,
  Zap,
  Banknote,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '@/store/useCartStore';
import { siteConfig } from '@/config/site';
import DishPlaceholder from '@/components/ui/DishPlaceholder';

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

function CartItemThumbnail({ item }: { item: { name: string; category?: string; isVeg?: boolean; image?: string } }) {
  const [imgError, setImgError] = useState(false);

  if (!item.image || item.image.trim() === '' || imgError) {
    return (
      <DishPlaceholder
        name={item.name}
        category={item.category}
        isVeg={item.isVeg}
      />
    );
  }

  return (
    <Image
      src={item.image}
      alt={item.name}
      fill
      sizes="48px"
      onError={() => setImgError(true)}
      className="object-cover"
    />
  );
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    specialInstructions,
    setSpecialInstructions,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getTotal,
    clearCart,
  } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedBillNumber, setConfirmedBillNumber] = useState('');
  const [confirmedPaymentId, setConfirmedPaymentId] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const defaultApiUrl = siteConfig.menuApiUrl || '/dashboard/api.php';
  const candidateUrls = Array.from(new Set([
    defaultApiUrl,
    '/dashboard/api.php',
    '/sharedhost-mobile/api.php',
  ]));

  const submitOrderToBackend = async (paymentData: {
    payment_status: 'paid' | 'unpaid';
    payment_method: string;
    payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {

      const orderPayload = {
        name: customerName.trim(),
        customer_name: customerName.trim(),
        phone: customerPhone.trim(),
        customer_phone: customerPhone.trim(),
        order_type: orderType,
        table_number: '',
        delivery_address: deliveryAddress.trim(),
        special_instructions: specialInstructions.trim(),
        notes: specialInstructions.trim(),
        items: items.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          instructions: ci.instructions || '',
        })),
        subtotal,
        tax_amount: tax,
        delivery_fee: deliveryFee,
        total,
        payment_status: paymentData.payment_status,
        payment_method: paymentData.payment_method,
        payment_id: paymentData.payment_id || '',
        paid_amount: paymentData.payment_status === 'paid' ? total : 0,
        razorpay_order_id: paymentData.razorpay_order_id || '',
        razorpay_signature: paymentData.razorpay_signature || '',
      };

      let submittedData: any = null;
      let lastError = 'Failed to place order. Please try again.';

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

      const generatedId = submittedData.order_id || submittedData.order_number || `TOK-${Date.now().toString().slice(-4)}`;
      setConfirmedOrderId(generatedId);
      if (submittedData.bill_number) {
        setConfirmedBillNumber(submittedData.bill_number);
      }
      setConfirmedPaymentId(paymentData.payment_id || '');
      setIsPaid(paymentData.payment_status === 'paid');

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f5c542', '#38b2ac', '#d93829'],
        });
      } catch {
        // ignore
      }

      setIsSubmitted(true);
      clearCart();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error?.message || 'Could not place order. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll order status to receive POS official Bill Number as soon as POS confirms order
  useEffect(() => {
    if (!isSubmitted || !confirmedOrderId) return;
    if (confirmedBillNumber) return;

    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      try {
        for (const apiUrl of candidateUrls) {
          const statusUrl = apiUrl.includes('?') 
            ? `${apiUrl}&action=order_status&order_id=${encodeURIComponent(confirmedOrderId)}` 
            : `${apiUrl}?action=order_status&order_id=${encodeURIComponent(confirmedOrderId)}`;
          const res = await fetch(statusUrl);
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data?.bill_number && typeof data.bill_number === 'string') {
              setConfirmedBillNumber(data.bill_number);
              clearInterval(interval);
              break;
            }
          }
        }
      } catch {
        // ignore polling error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSubmitted, confirmedOrderId, confirmedBillNumber]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    // Check if any cart item is out of stock
    const outOfStockItem = items.find((ci) => ci.item.stockStatus === 'out_of_stock');
    if (outOfStockItem) {
      setErrorMsg(`"${outOfStockItem.item.name}" is currently sold out. Please remove it from your cart.`);
      return;
    }

    if (paymentMethod === 'online') {
      setIsSubmitting(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
        setIsSubmitting(false);
        setErrorMsg('Razorpay payment gateway could not be loaded. Please check your internet or choose "Pay Later"');
        return;
      }

      let razorpayKey = siteConfig.razorpayKeyId || 'rzp_test_5StarNelamangala';
      for (const apiUrl of candidateUrls) {
        try {
          const configUrl = apiUrl.includes('?') ? `${apiUrl}&action=payment_config` : `${apiUrl}?action=payment_config`;
          const cfgRes = await fetch(configUrl, { cache: 'no-store' });
          if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            if (cfg?.razorpay_key_id && typeof cfg.razorpay_key_id === 'string' && cfg.razorpay_key_id.trim() !== '') {
              razorpayKey = cfg.razorpay_key_id.trim();
              break;
            }
          }
        } catch {
          // fallback
        }
      }
      try {
        const options = {
          key: razorpayKey,
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          name: siteConfig.name,
          description: `${items.length} item(s) • ${orderType.toUpperCase()}`,
          image: '/images/logo/five-star-emblem.png',
          prefill: {
            name: customerName.trim(),
            contact: customerPhone.trim(),
          },
          notes: {
            order_type: orderType,
            instructions: specialInstructions.trim(),
          },
          theme: {
            color: '#d93829', // Five Star brand red
          },
          handler: async function (response: any) {
            await submitOrderToBackend({
              payment_status: 'paid',
              payment_method: 'online',
              payment_id: response.razorpay_payment_id || `PAY-${Date.now().toString().slice(-6)}`,
              razorpay_order_id: response.razorpay_order_id || '',
              razorpay_signature: response.razorpay_signature || '',
            });
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setIsSubmitting(false);
          setErrorMsg(resp?.error?.description || 'Payment was cancelled or failed. You can retry or choose Pay at Counter.');
        });
        rzp.open();
      } catch (rzpErr: any) {
        setIsSubmitting(false);
        setErrorMsg(rzpErr?.message || 'Error opening Razorpay payment window.');
      }
    } else {
      await submitOrderToBackend({
        payment_status: 'unpaid',
        payment_method: 'cash',
      });
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setConfirmedOrderId('');
    setConfirmedPaymentId('');
    setIsPaid(false);
    clearCart();
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: 'var(--ks-raised-lacquer)' }}
            className="absolute inset-y-0 right-0 w-full max-w-md bg-neutral-950 border-l border-[var(--ks-gold-hairline)] shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ks-gold-hairline)] bg-[var(--ks-lacquer-deep)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] text-[var(--ks-kinpaku)]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-title text-sm sm:text-base font-semibold text-[var(--ks-champagne)]">
                    Your Order
                  </h2>
                  <p className="text-xs text-[var(--ks-text-muted)] font-mono">
                    {items.length === 0 ? 'Cart is empty' : `${items.length} item(s) selected`}
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-1.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] hover:border-[var(--ks-gold-hairline-strong)]"
                aria-label="Close Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State View */}
            {isSubmitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-[4px] bg-[oklch(70%_0.12_188_/_0.15)] border border-[var(--ks-patina)] flex items-center justify-center text-[var(--ks-patina)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[oklch(85%_0.16_85_/_0.15)] border border-[var(--ks-kinpaku)]">
                    <span className="font-mono text-sm font-bold tracking-wider text-[var(--ks-kinpaku)]">
                      Order Token: #{confirmedOrderId}
                    </span>
                  </div>
                  {confirmedBillNumber ? (
                    <div className="font-mono text-xs text-[var(--ks-champagne)]">
                      POS Invoice #: <strong className="text-[var(--ks-patina)] font-bold">{confirmedBillNumber}</strong>
                    </div>
                  ) : (
                    <div className="font-mono text-[11px] text-[var(--ks-text-muted)] flex items-center justify-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--ks-patina)]" />
                      <span>Syncing POS Invoice Number...</span>
                    </div>
                  )}
                  <h3 className="font-headline text-2xl font-light text-[var(--ks-champagne)] pt-0.5">
                    Order Received by Kitchen
                  </h3>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-xs text-[var(--ks-text-muted)] space-y-2 text-left w-full font-mono">
                  <div className="flex justify-between items-center pb-1.5 border-b border-[var(--ks-gold-hairline)]">
                    <span className="text-[var(--ks-text-muted)]">Order Token:</span>
                    <span className="font-bold text-[var(--ks-kinpaku)] text-sm">{confirmedOrderId}</span>
                  </div>
                  {confirmedBillNumber && (
                    <div className="flex justify-between items-center pb-1.5 border-b border-[var(--ks-gold-hairline)]">
                      <span className="text-[var(--ks-text-muted)]">Official Bill #:</span>
                      <span className="font-bold text-[var(--ks-patina)] text-sm">{confirmedBillNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[var(--ks-patina)] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[var(--ks-patina)]" />
                    <span>Synchronized with POS Backend</span>
                  </div>
                  {isPaid ? (
                    <div className="flex items-center gap-2 text-[var(--ks-kinpaku)] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Payment Settled via Razorpay ({confirmedPaymentId || 'Online'})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[var(--ks-champagne)]">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Payment Due: ₹{total} (Pay upon arrival)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[var(--ks-champagne)]">
                    <span>Kitchen Order Ticket (KOT) Generated & Routed</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--ks-text-muted)]">
                    <span>Receipt dispatching to WhatsApp</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--ks-text-muted)] leading-relaxed font-body">
                  Our chef is preparing your meal freshly. Updates and your official POS receipt will arrive via WhatsApp ({customerPhone}).
                </p>
                <div className="pt-2 flex flex-col gap-2 w-full">
                  <a
                    href={`/bill.php?id=${encodeURIComponent(confirmedOrderId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full ks-btn-primary py-2.5 text-xs rounded-[2px] flex items-center justify-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View / Print Official Bill ({confirmedOrderId}{confirmedBillNumber ? ` • ${confirmedBillNumber}` : ''})</span>
                  </a>
                  <button
                    onClick={() => {
                      const msg = `Hi Five Star Chicken, I placed online order #${confirmedOrderId}. Customer: ${customerName}.`;
                      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full ks-btn-secondary py-2 text-xs rounded-[2px] flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Message on WhatsApp</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-1.5 text-xs rounded-[2px] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] font-mono"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-[4px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] flex items-center justify-center text-[var(--ks-text-muted)]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-xl font-light text-[var(--ks-champagne)]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[var(--ks-text-muted)] max-w-xs leading-relaxed font-body">
                  Select crispy chicken buckets, burgers, or loaded combos from our authentic menu to start.
                </p>
                <button
                  onClick={closeCart}
                  className="ks-btn-primary text-xs py-2 px-5 rounded-[2px] mt-2"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              /* Populated Cart & Checkout Form */
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Order Type Toggle (Takeaway / Dine-In) */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ks-text-muted)] mb-1.5">
                    Order Fulfillment
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--ks-graphite)] rounded-[4px] border border-[var(--ks-gold-hairline)]">
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-[2px] text-xs font-mono transition-colors ${
                        orderType === 'takeaway'
                          ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-semibold'
                          : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Takeaway / Pickup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('dine-in')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-[2px] text-xs font-mono transition-colors ${
                        orderType === 'dine-in'
                          ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-semibold'
                          : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Dine-In</span>
                    </button>
                  </div>
                </div>

                {/* Selected Items List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ks-text-muted)]">
                    Order Items ({items.length})
                  </h4>
                  <div className="space-y-2">
                    {items.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center gap-2.5 p-2 rounded-[4px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)]"
                      >
                        <div className="relative w-12 h-12 rounded-[2px] overflow-hidden shrink-0 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)]">
                          <CartItemThumbnail item={cartItem.item} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-[var(--ks-champagne)] truncate font-title">
                            {cartItem.item.name}
                          </h5>
                          <p className="font-mono-num text-xs font-bold text-[var(--ks-kinpaku)] mt-0.5">
                            ₹{cartItem.item.price * cartItem.quantity}
                          </p>
                        </div>
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-[var(--ks-graphite)] rounded-[2px] p-0.5 border border-[var(--ks-gold-hairline)] shrink-0">
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="p-1 rounded-[2px] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono-num text-xs font-semibold text-[var(--ks-champagne)] w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="p-1 rounded-[2px] text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(cartItem.item.id)}
                            className="p-1 ml-0.5 text-[var(--ks-vermilion)] hover:opacity-80"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-[var(--ks-text-muted)] mb-1">
                    Special Preparation Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra peri peri spice, no ice in drink"
                    className="w-full px-2.5 py-1.5 text-xs rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none"
                  />
                </div>

                {/* Customer Checkout Form */}
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-2.5 pt-2 border-t border-[var(--ks-gold-hairline)]">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ks-champagne)]">
                    Guest & Contact Details
                  </h4>

                  {errorMsg && (
                    <div className="p-2 rounded-[2px] bg-[oklch(58%_0.15_35_/_0.15)] border border-[oklch(58%_0.15_35_/_0.4)] text-[var(--ks-vermilion)] text-xs font-mono">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-mono text-[var(--ks-text-muted)] mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-2.5 py-1.5 text-xs rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[var(--ks-text-muted)] mb-1">WhatsApp Mobile *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full px-2.5 py-1.5 text-xs rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2 border-t border-[var(--ks-gold-hairline)] space-y-1.5">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ks-champagne)]">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-2.5 rounded-[4px] border text-left flex flex-col justify-between transition-all ${
                          paymentMethod === 'online'
                            ? 'bg-[var(--ks-lacquer-deep)] border-[var(--ks-kinpaku)] ring-1 ring-[var(--ks-kinpaku)]/30'
                            : 'bg-[var(--ks-raised-lacquer)] border-[var(--ks-gold-hairline)] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Zap className={`w-3.5 h-3.5 ${paymentMethod === 'online' ? 'text-[var(--ks-kinpaku)]' : 'text-[var(--ks-text-muted)]'}`} />
                            <span className="text-xs font-bold text-[var(--ks-champagne)]">Pay Online</span>
                          </div>
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[oklch(70%_0.12_188_/_0.2)] text-[var(--ks-patina)] font-mono font-bold">
                            Razorpay
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--ks-text-muted)] leading-tight">
                          UPI (GPay / PhonePe / Paytm), Cards, NetBanking
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-2.5 rounded-[4px] border text-left flex flex-col justify-between transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-[var(--ks-lacquer-deep)] border-[var(--ks-kinpaku)] ring-1 ring-[var(--ks-kinpaku)]/30'
                            : 'bg-[var(--ks-raised-lacquer)] border-[var(--ks-gold-hairline)] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Banknote className={`w-3.5 h-3.5 ${paymentMethod === 'cash' ? 'text-[var(--ks-kinpaku)]' : 'text-[var(--ks-text-muted)]'}`} />
                            <span className="text-xs font-bold text-[var(--ks-champagne)]">Pay at Counter</span>
                          </div>
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] font-mono">
                            Cash / UPI
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--ks-text-muted)] leading-tight">
                          Pay upon collection at the counter or when dining in
                        </p>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Price Breakdown */}
                <div className="p-3 rounded-[4px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] space-y-1.5 text-xs text-[var(--ks-text-muted)] font-mono">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-mono-num text-[var(--ks-champagne)] font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>GST (5% Included)</span>
                    <span className="font-mono-num text-[var(--ks-champagne)] font-medium">₹{tax}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--ks-gold-hairline)] text-sm font-bold text-[var(--ks-champagne)]">
                    <span>Total Amount</span>
                    <span className="font-mono-num text-base text-[var(--ks-kinpaku)] font-bold">₹{total}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Drawer Footer with Submit CTA */}
            {!isSubmitted && items.length > 0 && (
              <div className="p-4 bg-[var(--ks-lacquer-deep)] border-t border-[var(--ks-gold-hairline)]">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full ks-btn-primary py-3 px-4 rounded-[2px] text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{paymentMethod === 'online' ? 'Opening Razorpay Gateway...' : 'Sending Order to POS...'}</span>
                    </>
                  ) : paymentMethod === 'online' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[var(--ks-dark-ink)]" />
                      <span>Pay ₹{total} via Razorpay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>{orderType === 'dine-in' ? 'Confirm Dine-In Order (Pay at Counter)' : 'Confirm Takeaway Order (Pay at Counter)'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-[var(--ks-text-muted)] mt-1.5 font-mono">
                  {paymentMethod === 'online'
                    ? '🔒 256-bit Encrypted Razorpay Gateway • Auto KOT & Instant Bill'
                    : '⚡ Auto KOT generated in kitchen POS & WhatsApp receipt link sent'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
