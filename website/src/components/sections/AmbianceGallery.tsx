'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import Lightbox, { GalleryPhoto } from './Lightbox';

const photos: GalleryPhoto[] = [
  {
    src: '/images/interior/dining-hall-world-map.jpg',
    title: 'Contemporary Dining & World Map Neon',
    subtitle: 'Warm pendant lighting celebrating our international presence across 10+ countries.',
  },
  {
    src: '/images/interior/neon-chicken-wall.jpg',
    title: 'Chef Chicken Neon Installation',
    subtitle: 'Signature architectural corrugated wall with glowing mascot insignia.',
  },
  {
    src: '/images/interior/service-counter-front.jpg',
    title: 'Order & Express Collection Counter',
    subtitle: 'Modern digital menu display with rapid takeaway and POS integration.',
  },
  {
    src: '/images/interior/order-station-angle.jpg',
    title: 'Family & Group Seating Space',
    subtitle: 'Comfortable, spotless dining area configured for families and travelers.',
  },
];

export default function AmbianceGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section id="gallery" className="py-20 sm:py-24 bg-[var(--ks-lacquer-black)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Direct headline without kicker or gradient text */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            Store Experience & Dining Atmosphere
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
            Step inside our dining room on B.H. Road or collect piping hot orders directly at our express takeaway counter.
          </p>
        </div>

        {/* Gallery Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {photos.map((photo, idx) => (
            <div
              key={photo.src}
              onClick={() => setLightboxIndex(idx)}
              className="ks-tile group relative aspect-[16/10] rounded-[6px] overflow-hidden cursor-pointer"
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ks-lacquer-black)]/90 via-black/25 to-transparent transition-opacity duration-200" />

              {/* Overlay Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)] group-hover:text-[var(--ks-kinpaku)] transition-colors">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-[var(--ks-text-muted)] mt-1 line-clamp-1 font-body">
                      {photo.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] flex items-center justify-center text-[var(--ks-champagne)] group-hover:bg-[var(--ks-kinpaku)] group-hover:text-[var(--ks-dark-ink)] transition-colors shrink-0 ml-3">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </section>
  );
}
