'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function VisitUs() {
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsOpenNow(hour >= siteConfig.openingHours.openHour && hour < siteConfig.openingHours.closeHour);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="visit" className="py-20 sm:py-28 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D32314] mb-3">
            <MapPin className="w-4 h-4" />
            <span>Store Location & Hours</span>
          </div>
          <h2 className="font-serif-lux text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F3EE]">
            Visit <span className="text-gold-gradient">Nelamangala</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A69F96]">
            Conveniently located on B.H. Road with ample parking and rapid takeaway counters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Details Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Live Open / Closed Status Pill */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-[#A69F96] tracking-wider mb-1">
                  Operating Status
                </div>
                <div className="font-serif-lux text-xl font-bold text-white">
                  {isOpenNow ? 'Welcome In!' : 'See You Soon!'}
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                  isOpenNow
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isOpenNow ? 'Open Now (Till 11 PM)' : 'Closed (Opens at 11 AM)'}</span>
              </div>
            </div>

            {/* Address & Landmark */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D32314] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-base">Address</h3>
                  <p className="text-sm text-[#A69F96] leading-relaxed mt-1">
                    {siteConfig.address}
                  </p>
                  <p className="text-xs text-[#E8C979] mt-1">
                    Landmark: {siteConfig.landmark}
                  </p>
                </div>
              </div>

              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8C979] hover:underline pt-2"
              >
                <span>Get Driving Directions</span>
                <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Contact & Hours */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A69F96]">
                  <Clock className="w-4 h-4 text-[#C9A24B]" />
                  <span>Dine-in & Delivery</span>
                </div>
                <p className="text-sm font-semibold text-white">{siteConfig.openingHours.display}</p>
                <p className="text-[11px] text-[#6E675F]">{siteConfig.openingHours.days}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A69F96]">
                  <Phone className="w-4 h-4 text-[#D32314]" />
                  <span>Direct Hotline</span>
                </div>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="text-sm font-semibold text-white hover:text-[#E8C979] block transition-colors"
                >
                  {siteConfig.phone}
                </a>
                <p className="text-[11px] text-[#6E675F]">Counter & WhatsApp Orders</p>
              </div>
            </div>

            {/* Social Connect Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-3 rounded-full bg-[#1A1816] border border-white/10 hover:border-[#C9A24B] text-[#A69F96] hover:text-[#E8C979] transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-3 rounded-full bg-[#1A1816] border border-white/10 hover:border-[#C9A24B] text-[#A69F96] hover:text-[#E8C979] transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-3 rounded-full bg-[#1A1816] border border-white/10 hover:border-[#C9A24B] text-[#A69F96] hover:text-[#E8C979] transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Google Map Embed */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/10 min-h-[380px] relative shadow-2xl">
            <iframe
              title="Five Star Chicken Nelamangala Location"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15543.518884976451!2d77.3878!3d13.0988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae24d62b1b3695%3A0xb3e1c668b556b6c1!2sNelamangala%20Town%2C%20Karnataka%20562123!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
            {/* Map Header Floating Overlay */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs">
              <span className="font-bold text-white">Five Star Chicken Nelamangala</span>
              <span className="block text-[10px] text-[#A69F96]">B.H. Road, Bengaluru Rural</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
