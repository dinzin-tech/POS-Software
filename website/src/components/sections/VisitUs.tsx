'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
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
    <section id="visit" className="py-20 sm:py-24 bg-[var(--ks-lacquer-black)] relative border-t border-[var(--ks-gold-hairline)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            Location, Hours & Compliance
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
            Conveniently situated on B.H. Road with comfortable family dine-in seating, modern ambiance, and rapid takeaway counters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Details Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {/* Live Open / Closed Status Tile */}
            <div className="ks-tile rounded-[6px] p-6 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono font-semibold text-[var(--ks-text-muted)] tracking-wider mb-1">
                  Operating Status
                </div>
                <div className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  {isOpenNow ? 'Kitchen Open & Serving' : 'Kitchen Closed'}
                </div>
              </div>

              <div>
                {isOpenNow ? (
                  <span className="ks-badge-patina">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ks-patina)]" />
                    <span>Open Till 11 PM</span>
                  </span>
                ) : (
                  <span className="ks-badge-warning">
                    <span>Opens at 11 AM</span>
                  </span>
                )}
              </div>
            </div>

            {/* Address & Legal Specifications */}
            <div className="ks-tile rounded-[6px] p-6 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--ks-kinpaku)] shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-title text-sm font-semibold text-[var(--ks-champagne)]">Restaurant Address</h3>
                  <p className="text-xs text-[var(--ks-text-muted)] leading-relaxed font-body">
                    {siteConfig.address}
                  </p>
                  <p className="text-xs text-[var(--ks-kinpaku)] font-mono">
                    Landmark: {siteConfig.landmark}
                  </p>
                </div>
              </div>

              {/* Regulatory Compliance: Flat Key-Value List with hairline dividers */}
              <div className="pt-3 border-t border-[var(--ks-gold-hairline)] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ks-text-muted)]">GSTIN:</span>
                  <span className="font-mono-num font-bold text-[var(--ks-kinpaku)] tracking-wider">{siteConfig.gstin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ks-text-muted)]">FSSAI Registration:</span>
                  <span className="font-mono-num font-semibold text-[var(--ks-champagne)] tracking-wider">{siteConfig.fssaiNumber}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[var(--ks-gold-hairline)] text-xs">
                  <span className="text-[var(--ks-text-muted)]">Trade Entity:</span>
                  <span className="text-[var(--ks-champagne)] font-medium">{siteConfig.tradeName}</span>
                </div>
              </div>

              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--ks-kinpaku)] hover:underline pt-1"
              >
                <span>Driving Directions (13.088689, 77.410901)</span>
                <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Contact & Hours */}
            <div className="ks-tile rounded-[6px] p-6 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--ks-text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--ks-kinpaku)]" />
                  <span>Restaurant Dine-In & Takeaway</span>
                </div>
                <p className="text-sm font-semibold text-[var(--ks-champagne)] font-mono-num">{siteConfig.openingHours.display}</p>
                <p className="text-xs text-[var(--ks-text-muted)] font-mono">{siteConfig.openingHours.days}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--ks-text-muted)]">
                  <Phone className="w-3.5 h-3.5 text-[var(--ks-patina)]" />
                  <span>Direct Hotline</span>
                </div>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="text-sm font-semibold text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] block font-mono-num transition-colors"
                >
                  {siteConfig.phone}
                </a>
                <p className="text-xs text-[var(--ks-text-muted)] font-mono">Counter & Online Orders</p>
              </div>
            </div>

            {/* Social Connect Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-text-muted)] hover:text-[var(--ks-kinpaku)] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-text-muted)] hover:text-[var(--ks-kinpaku)] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2.5 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-text-muted)] hover:text-[var(--ks-kinpaku)] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Google Map Embed */}
          <div className="lg:col-span-7 rounded-[6px] overflow-hidden border border-[var(--ks-gold-hairline)] min-h-[280px] sm:min-h-[380px] relative bg-[var(--ks-lacquer-deep)]">
            <iframe
              title="Five Star Chicken Nelamangala Location"
              src="https://maps.google.com/maps?q=13.088689750966637,77.41090161024658&hl=en&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
            {/* Map Header Floating Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto sm:left-3 bg-[var(--ks-lacquer-deep)]/95 px-3 py-2 rounded-[2px] border border-[var(--ks-gold-hairline)] text-xs font-mono max-w-[calc(100%-20px)] sm:max-w-md">
              <span className="font-semibold text-[var(--ks-champagne)] block truncate">Five Star Chicken Nelamangala</span>
              <span className="text-xs text-[var(--ks-text-muted)] block truncate">Binnamangala, Arasinakunte (13.088689, 77.410901)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
