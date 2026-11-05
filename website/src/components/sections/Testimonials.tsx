'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { customerReviews } from '@/data/reviews';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % customerReviews.length);
    }, 6000);

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
    <section id="reviews" className="py-20 sm:py-24 bg-[var(--ks-lacquer-deep)] border-t border-[var(--ks-gold-hairline)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Direct H2 without kicker or gradient text */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            Patron Reviews & Community Praise
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
            Real feedback from local dining families and highway travelers stopping in Nelamangala.
          </p>
        </div>

        {/* Testimonial Bento Tile */}
        <div className="max-w-3xl mx-auto">
          <div className="ks-tile rounded-[6px] p-6 sm:p-10 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] min-h-[280px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 5 Stars in Kinpaku Gold */}
                <div className="flex items-center gap-1 text-[var(--ks-kinpaku)]">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--ks-kinpaku)]" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <blockquote className="font-body text-base sm:text-lg text-[var(--ks-champagne)] leading-relaxed italic">
                  &ldquo;{current.comment}&rdquo;
                </blockquote>

                {/* Author Details & Recommended Dish */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-[var(--ks-gold-hairline)]">
                  <div>
                    <h3 className="font-title text-sm font-semibold text-[var(--ks-champagne)]">
                      {current.author}
                    </h3>
                    <p className="text-xs text-[var(--ks-text-muted)] font-mono">{current.location} • {current.date}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] text-xs font-mono">
                    <span className="text-[var(--ks-text-muted)]">Favorite:</span>
                    <strong className="text-[var(--ks-kinpaku)] font-medium">{current.dishRecommended}</strong>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls: Hairline Stepper & Bars */}
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-[var(--ks-gold-hairline)]">
              {/* Stepper Indicators */}
              <div className="flex items-center gap-1.5">
                {customerReviews.map((rev, idx) => (
                  <button
                    key={rev.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-[2px] transition-all duration-200 ${
                      currentIndex === idx ? 'w-6 bg-[var(--ks-kinpaku)]' : 'w-2 bg-[var(--ks-graphite-2)] hover:bg-[var(--ks-text-muted)]'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-[2px] bg-[var(--ks-graphite)] hover:bg-[var(--ks-kinpaku)] hover:text-[var(--ks-dark-ink)] text-[var(--ks-champagne)] border border-[var(--ks-gold-hairline)] transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-[2px] bg-[var(--ks-graphite)] hover:bg-[var(--ks-kinpaku)] hover:text-[var(--ks-dark-ink)] text-[var(--ks-champagne)] border border-[var(--ks-gold-hairline)] transition-colors"
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
