'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Send, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ReserveWhatsApp() {
  const [guests, setGuests] = useState('4');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30');
  const [name, setName] = useState('');

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    const reservationText = `🍽️ *TABLE RESERVATION INQUIRY - FIVE STAR CHICKEN NELAMANGALA* 🍽️\n\n` +
      `*Guest Name:* ${name.trim() || 'Valued Guest'}\n` +
      `*Party Size:* ${guests} Guests\n` +
      `*Requested Date:* ${date || 'Today'}\n` +
      `*Requested Time:* ${time}\n\n` +
      `_Please confirm availability for our table._`;

    const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(reservationText)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-16 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#171412] via-[#1E1916] to-[#171412] border border-[#C9A24B]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Decorative Background Ring */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#C9A24B]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8C979]">
                <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                <span>Dine-In & Celebrations</span>
              </div>
              <h2 className="font-serif-lux text-2xl sm:text-4xl font-extrabold text-[#F7F3EE]">
                Reserve Your <span className="text-gold-gradient">Table</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#A69F96] leading-relaxed">
                Planning a family gathering, birthday treat, or highway meal stop? Reserve seats in advance and enjoy fast, VIP service.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleReserve}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
              >
                {/* Name */}
                <div className="p-2">
                  <label className="block text-[10px] uppercase font-bold text-[#A69F96] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full bg-transparent text-xs text-white placeholder-[#6E675F] focus:outline-none"
                  />
                </div>

                {/* Party Size */}
                <div className="p-2 border-t sm:border-t-0 sm:border-l border-white/10">
                  <label className="block text-[10px] uppercase font-bold text-[#A69F96] mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#C9A24B]" /> Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="1" className="bg-[#1A1816]">1 Guest</option>
                    <option value="2" className="bg-[#1A1816]">2 Guests</option>
                    <option value="4" className="bg-[#1A1816]">4 Guests</option>
                    <option value="6" className="bg-[#1A1816]">6 Guests</option>
                    <option value="8+" className="bg-[#1A1816]">8+ Party</option>
                  </select>
                </div>

                {/* Date */}
                <div className="p-2 border-t sm:border-t-0 sm:border-l border-white/10">
                  <label className="block text-[10px] uppercase font-bold text-[#A69F96] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C9A24B]" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Submit WhatsApp Button */}
                <div className="p-1 col-span-1 sm:col-span-2 lg:col-span-1 flex items-center">
                  <button
                    type="submit"
                    className="w-full h-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold-gradient hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-lg shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reserve</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
