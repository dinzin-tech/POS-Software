'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Heart } from 'lucide-react';
import { customerReviews } from '@/data/reviews';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % customerReviews.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % customerReviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + customerReviews.length) % customerReviews.length);
  };

  const current = customerReviews[currentIndex];

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#0D0B0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ebdd0b] mb-3">
            <Heart className="w-4 h-4 fill-[#dd2023] text-[#dd2023]" />
            <span>Community Love</span>
          </div>
          <h2 className="font-serif-lux text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F3EE]">
            Nelamangala's <span className="text-gold-gradient">Favorites</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A69F96]">
            Real stories from our patrons, family feasts, and highway travelers.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#ebdd0b]/30 relative shadow-2xl overflow-hidden min-h-[320px] flex flex-col justify-between">
            {/* Background Giant Quote Watermark */}
            <Quote className="absolute top-6 right-8 w-24 h-24 text-[#ebdd0b]/10 pointer-events-none rotate-180" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1.5 text-[#ebdd0b]">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ebdd0b]" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <blockquote className="font-serif-lux text-lg sm:text-2xl text-[#F7F3EE] leading-relaxed italic">
                  "{current.comment}"
                </blockquote>

                {/* Author Details & Recommended Dish */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <div>
                    <h3 className="font-bold text-white text-base">{current.author}</h3>
                    <p className="text-xs text-[#A69F96]">{current.location} • {current.date}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1816] border border-[#ebdd0b]/20 text-xs">
                    <span className="text-[#A69F96]">Favorite:</span>
                    <strong className="text-[#ebdd0b] font-medium">{current.dishRecommended}</strong>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {customerReviews.map((rev, idx) => (
                  <button
                    key={rev.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'w-8 bg-[#ebdd0b]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-white/5 hover:bg-[#ebdd0b] hover:text-black text-white border border-white/10 transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-white/5 hover:bg-[#ebdd0b] hover:text-black text-white border border-white/10 transition-colors"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
