'use client';

import { useState } from 'react';
import { Calendar, Users, Send } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ReserveWhatsApp() {
  const [guests, setGuests] = useState('4');
  const [date, setDate] = useState('');
  const time = '19:30';
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
    <section className="py-20 sm:py-24 bg-[var(--ks-lacquer-black)] relative border-t border-[var(--ks-gold-hairline)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ks-tile rounded-[6px] p-6 sm:p-10 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="font-headline text-2xl sm:text-4xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
                Table Reservations & Group Dining
              </h2>
              <p className="text-sm text-[var(--ks-text-muted)] font-body leading-relaxed">
                Planning a family gathering, birthday celebration, or highway meal stop? Reserve seats in advance for swift, guaranteed seating.
              </p>
            </div>

            {/* Right Form: Direct Inputs (No nested card containers) */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleReserve}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
              >
                {/* Name */}
                <div>
                  <label className="block text-xs uppercase font-mono font-semibold text-[var(--ks-text-muted)] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2.5 rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-xs text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none font-mono min-h-[42px]"
                  />
                </div>

                {/* Party Size */}
                <div>
                  <label className="block text-xs uppercase font-mono font-semibold text-[var(--ks-text-muted)] mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[var(--ks-kinpaku)]" /> Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-xs text-[var(--ks-champagne)] focus:border-[var(--ks-kinpaku)] focus:outline-none cursor-pointer font-mono min-h-[42px]"
                  >
                    <option value="1" className="bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)]">1 Guest</option>
                    <option value="2" className="bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)]">2 Guests</option>
                    <option value="4" className="bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)]">4 Guests</option>
                    <option value="6" className="bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)]">6 Guests</option>
                    <option value="8+" className="bg-[var(--ks-lacquer-deep)] text-[var(--ks-champagne)]">8+ Party</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs uppercase font-mono font-semibold text-[var(--ks-text-muted)] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--ks-kinpaku)]" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[2px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] text-xs text-[var(--ks-champagne)] focus:border-[var(--ks-kinpaku)] focus:outline-none font-mono min-h-[42px]"
                  />
                </div>

                {/* Submit WhatsApp Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full ks-btn-primary text-xs py-2.5 px-3 rounded-[2px] min-h-[42px] flex items-center justify-center gap-2"
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
