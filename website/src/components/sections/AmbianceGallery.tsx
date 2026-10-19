'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Maximize2, Camera } from 'lucide-react';
import Lightbox, { GalleryPhoto } from './Lightbox';

const photos: GalleryPhoto[] = [
  {
    src: '/images/interior/dining-hall-world-map.jpg',
    title: 'Contemporary Dining & World Map Neon',
    subtitle: 'Warm pendant ambiance celebrating our global presence in 10+ countries.',
  },
  {
    src: '/images/interior/neon-chicken-wall.jpg',
    title: 'Iconic Chef Chicken Neon Installation',
    subtitle: 'Signature red corrugated wall with glowing mascot insignia.',
  },
  {
    src: '/images/interior/service-counter-front.jpg',
    title: 'Order & Express Collection Counter',
    subtitle: 'Modern digital menu display with quick takeaway service.',
  },
  {
    src: '/images/interior/order-station-angle.jpg',
    title: 'Family & Group Seating Space',
    subtitle: 'Comfortable, spotless dining area designed for family gatherings.',
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
    <section id="gallery" className="py-20 sm:py-28 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A24B] mb-3">
            <Camera className="w-4 h-4" />
            <span>Store Experience</span>
          </div>
          <h2 className="font-serif-lux text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F3EE]">
            Nelamangala <span className="text-gold-gradient">Ambiance</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A69F96]">
            Step inside our dining room or pick up piping hot fried chicken at our express counter.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => setLightboxIndex(idx)}
              className="group relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#C9A24B]/50 transition-all duration-300 shadow-xl"
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Overlay Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-serif-lux text-lg sm:text-xl font-bold text-white group-hover:text-[#E8C979] transition-colors">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-[#A69F96] mt-1 line-clamp-1">
                      {photo.subtitle}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#C9A24B] group-hover:text-black transition-colors shrink-0 ml-4">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
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
