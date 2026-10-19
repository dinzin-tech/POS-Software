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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Ambiance Image Viewer"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="absolute left-4 sm:left-8 z-50 p-3 rounded-full bg-black/60 hover:bg-[#C9A24B] hover:text-black text-white border border-white/20 transition-all"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="absolute right-4 sm:right-8 z-50 p-3 rounded-full bg-black/60 hover:bg-[#C9A24B] hover:text-black text-white border border-white/20 transition-all"
          aria-label="Next Photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main Image Display */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-5xl max-h-[85vh] w-full px-4 flex flex-col items-center"
        >
          <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.title}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Caption & Counter */}
          <div className="mt-4 text-center">
            <h3 className="font-serif-lux text-lg sm:text-xl font-bold text-white">
              {currentPhoto.title}
            </h3>
            <p className="text-xs text-[#A69F96] mt-0.5">{currentPhoto.subtitle}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold text-[#E8C979] bg-white/5 border border-white/10">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
