'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function OurStory() {
  return (
    <section id="story" className="py-20 sm:py-28 bg-[#0D0B0A] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#dd2023]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ebdd0b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Showcase with Neon Art */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#ebdd0b]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              <Image
                src="/images/interior/neon-chicken-wall.jpg"
                alt="Five Star Chicken Nelamangala Neon Wall"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-[#ebdd0b]/30 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#ebdd0b] font-bold">
                    Nelamangala Flagship
                  </p>
                  <p className="text-sm font-bold text-white">Modern Ambiance & Warm Hospitality</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#dd2023]/20 border border-[#dd2023] flex items-center justify-center text-[#dd2023]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Accent Decorative Tag */}
            <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1816] border border-[#ebdd0b]/40 shadow-xl text-xs font-bold text-[#ebdd0b]">
              <Award className="w-4 h-4 text-[#ebdd0b]" />
              <span>International Heritage</span>
            </div>
          </motion.div>

          {/* Right Column: Story Copy & Counters */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ebdd0b] mb-3">
              <HeartHandshake className="w-4 h-4" />
              <span>Our Culinary Craft & Philosophy</span>
            </div>

            <h2 className="font-serif-lux text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F3EE] leading-tight">
              A Legacy of <span className="text-fire-gradient">Passion</span> & Golden <span className="text-gold-gradient">Crunch</span>
            </h2>

            <p className="mt-5 text-sm sm:text-base text-[#A69F96] leading-relaxed">
              With a celebrated presence across more than 10 countries and 10,000+ restaurants worldwide, Five Star Chicken has perfected the art of fried chicken. At our Nelamangala branch, we bring this world-renowned recipe right to your neighborhood.
            </p>

            <p className="mt-3 text-sm sm:text-base text-[#A69F96] leading-relaxed">
              Every single piece is freshly marinated in our signature secret spices and cooked in specialized pressure fryers that lock in natural moisture while sealing a light, ultra-crisp crust without excess oil.
            </p>

            {/* Philosophy Triad */}
            <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#ebdd0b] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">100% Fresh Daily Cuts</h4>
                  <p className="text-xs text-[#A69F96]">Carefully sourced tender farm-fresh poultry, never frozen.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#dd2023] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Pressure-Fry Mastery</h4>
                  <p className="text-xs text-[#A69F96]">Precision high-pressure cooking locking in unmatched juiciness.</p>
                </div>
              </div>
            </div>

            {/* Animated Stat Counters */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              {siteConfig.stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="font-serif-lux text-2xl sm:text-3xl font-extrabold text-[#ebdd0b]">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-[#A69F96]">{stat.subtext}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
