'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface GalleryPhoto {
  src: string;
  title: string;
  subtitle: string;
}

interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, onClose, onNext, onPrev]);

  if (currentIndex === null) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ks-lacquer-deep)]/96"
        role="dialog"
        aria-modal="true"
        aria-label="Ambiance Image Viewer"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-[2px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-champagne)] transition-colors"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="absolute left-4 sm:left-8 z-50 p-2.5 rounded-[2px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] transition-colors"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="absolute right-4 sm:right-8 z-50 p-2.5 rounded-[2px] bg-[var(--ks-raised-lacquer)] border border-[var(--ks-gold-hairline)] hover:border-[var(--ks-kinpaku)] text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] transition-colors"
          aria-label="Next Photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Main Image Display */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl max-h-[85vh] w-full px-4 flex flex-col items-center"
        >
          <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-[4px] overflow-hidden border border-[var(--ks-gold-hairline-strong)] bg-[var(--ks-lacquer-black)]">
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.title}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Caption */}
          <div className="mt-4 text-center">
            <h3 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
              {currentPhoto.title}
            </h3>
            <p className="text-xs text-[var(--ks-text-muted)] mt-1 max-w-lg font-body">
              {currentPhoto.subtitle}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
