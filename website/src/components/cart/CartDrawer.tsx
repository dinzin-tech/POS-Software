'use client';

import { useState } from 'react';
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
  Bike,
  Store,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '@/store/useCartStore';
import { siteConfig } from '@/config/site';
import { OrderType } from '@/types';

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Please enter your delivery address in Nelamangala.');
      return;
    }
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      setErrorMsg('Please specify your Dine-in Table number.');
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D32314', '#C9A24B', '#E8C979', '#ffffff'],
      });
    } catch {
      // ignore
    }

    // Generate formatted WhatsApp Order Text
    let orderText = `🍗 *NEW ORDER - FIVE STAR CHICKEN (NELAMANGALA)* 🍗\n\n`;
    orderText += `*Order Type:* ${orderType.toUpperCase()}\n`;
    orderText += `*Customer:* ${customerName.trim()}\n`;
    orderText += `*Phone:* ${customerPhone.trim()}\n`;

    if (orderType === 'delivery') {
      orderText += `*Delivery Address:* ${deliveryAddress.trim()}\n`;
    } else if (orderType === 'dine-in') {
      orderText += `*Table Number:* Table ${tableNumber.trim()}\n`;
    } else {
      orderText += `*Pickup:* Self Takeaway from Nelamangala Branch\n`;
    }

    orderText += `\n*─── ORDER ITEMS ───*\n`;
    items.forEach((ci, idx) => {
      orderText += `${idx + 1}. ${ci.item.name} x ${ci.quantity} = ₹${ci.item.price * ci.quantity}\n`;
      if (ci.instructions) {
        orderText += `   ↳ Note: ${ci.instructions}\n`;
      }
    });

    orderText += `\n*─── BILLING BREAKDOWN ───*\n`;
    orderText += `Subtotal: ₹${subtotal}\n`;
    orderText += `GST (5%): ₹${tax}\n`;
    if (orderType === 'delivery') {
      orderText += `Delivery Fee: ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}\n`;
    }
    orderText += `*TOTAL AMOUNT: ₹${total}*\n`;

    if (specialInstructions.trim()) {
      orderText += `\n*Special Instructions:* ${specialInstructions.trim()}\n`;
    }

    orderText += `\n_Placed via Five Star Chicken Website_`;

    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(orderText)}`;

    // Show success view and redirect to WhatsApp
    setIsSubmitted(true);

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
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
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 w-full max-w-md bg-[#0F0E0D] border-l border-[#C9A24B]/20 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161412]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-[#C9A24B]/10 text-[#E8C979]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-lux text-lg font-bold text-[#F7F3EE]">Your Feast Order</h2>
                  <p className="text-xs text-[#A69F96]">
                    {items.length === 0 ? 'Cart is empty' : `${items.length} item(s) selected`}
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#A69F96] hover:text-[#F7F3EE] transition-colors"
                aria-label="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State View */}
            {isSubmitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center text-[#25D366]"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h3 className="font-serif-lux text-2xl font-bold text-[#F7F3EE]">
                  Order Ready for WhatsApp!
                </h3>
                <p className="text-sm text-[#A69F96] leading-relaxed">
                  Your order summary has been formatted. If WhatsApp did not open automatically, click the button below to send your order directly to our Nelamangala branch counter.
                </p>
                <div className="pt-4 flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" /> Open WhatsApp Chat
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 text-xs text-[#A69F96] hover:text-white"
                  >
                    Start a New Order
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1A1816] border border-white/5 flex items-center justify-center text-[#6E675F]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif-lux text-xl font-semibold text-[#F7F3EE]">Your cart is hungry!</h3>
                <p className="text-xs text-[#A69F96] max-w-xs leading-relaxed">
                  Explore our crispy fried chicken buckets, sizzling burgers, and loaded snacks to build your feast.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-gold-gradient shadow-md hover:opacity-90"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              /* Populated Cart & Checkout Form */
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Order Type Toggle (Delivery / Pickup / Dine-in) */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#C9A24B] mb-2">
                    Select Order Fulfillment
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#1A1816] rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        orderType === 'delivery'
                          ? 'bg-gold-gradient text-[#0A0A0A] font-bold shadow-md'
                          : 'text-[#A69F96] hover:text-[#F7F3EE]'
                      }`}
                    >
                      <Bike className="w-4 h-4 mb-1" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        orderType === 'pickup'
                          ? 'bg-gold-gradient text-[#0A0A0A] font-bold shadow-md'
                          : 'text-[#A69F96] hover:text-[#F7F3EE]'
                      }`}
                    >
                      <Store className="w-4 h-4 mb-1" />
                      <span>Takeaway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('dine-in')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        orderType === 'dine-in'
                          ? 'bg-gold-gradient text-[#0A0A0A] font-bold shadow-md'
                          : 'text-[#A69F96] hover:text-[#F7F3EE]'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 mb-1" />
                      <span>Dine-In</span>
                    </button>
                  </div>
                </div>

                {/* Selected Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A69F96]">
                    Items in Order ({items.length})
                  </h4>
                  <div className="space-y-2.5">
                    {items.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161412] border border-white/5 hover:border-[#C9A24B]/30 transition-colors"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <Image
                            src={cartItem.item.image}
                            alt={cartItem.item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-[#F7F3EE] truncate">
                            {cartItem.item.name}
                          </h5>
                          <p className="text-xs font-bold text-[#E8C979] mt-0.5">
                            ₹{cartItem.item.price * cartItem.quantity}
                          </p>
                        </div>
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-[#25221F] rounded-lg p-1 border border-white/10 shrink-0">
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="p-1 rounded text-[#A69F96] hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="p-1 rounded text-[#A69F96] hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(cartItem.item.id)}
                            className="p-1 ml-1 text-red-400 hover:text-red-300"
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
                  <label className="block text-xs text-[#A69F96] mb-1">
                    Special Preparation Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra spicy peri peri, less ice in drink"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#161412] border border-white/10 text-[#F7F3EE] focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>

                {/* Customer Checkout Form */}
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">
                    Contact & Delivery Information
                  </h4>

                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-900/30 border border-red-500/50 text-red-200 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-[#A69F96] mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#161412] border border-white/10 text-[#F7F3EE] focus:border-[#C9A24B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A69F96] mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit Mobile"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#161412] border border-white/10 text-[#F7F3EE] focus:border-[#C9A24B] focus:outline-none"
                      />
                    </div>
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-[11px] text-[#A69F96] mb-1">
                        Delivery Address in Nelamangala *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Flat No, Street, Landmark, Nelamangala"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#161412] border border-white/10 text-[#F7F3EE] focus:border-[#C9A24B] focus:outline-none resize-none"
                      />
                    </div>
                  )}

                  {orderType === 'dine-in' && (
                    <div>
                      <label className="block text-[11px] text-[#A69F96] mb-1">Table Number *</label>
                      <input
                        type="text"
                        required
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 4"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#161412] border border-white/10 text-[#F7F3EE] focus:border-[#C9A24B] focus:outline-none"
                      />
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-[#A69F96]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="text-white font-medium">₹{tax}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="text-white font-medium">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-400 font-semibold">FREE (Above ₹499)</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-[#F7F3EE]">
                    <span>Total Amount</span>
                    <span className="text-[#E8C979] font-serif-lux text-base">₹{total}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Drawer Footer with Submit CTA */}
            {!isSubmitted && items.length > 0 && (
              <div className="p-4 bg-[#141210] border-t border-white/10">
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold tracking-wider uppercase text-white bg-fire-gradient hover:bg-fire-gradient-hover shadow-[0_0_20px_rgba(211,35,20,0.4)] flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <span>Send Order via WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-[#6E675F] mt-2">
                  Instant confirmation directly with Nelamangala branch counter
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
