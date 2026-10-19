'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Flame, Filter, Utensils } from 'lucide-react';
import { menuItems } from '@/data/menu';
import MenuTabs from '@/components/menu/MenuTabs';
import DishCard from '@/components/menu/DishCard';

export default function FullMenu() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Veg filter
      if (vegOnly && !item.isVeg) {
        return false;
      }
      // Spice filter
      if (selectedSpice !== 'all' && item.spiceLevel !== selectedSpice) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [activeCategory, vegOnly, selectedSpice, searchQuery]);

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setVegOnly(false);
    setSelectedSpice('all');
  };

  return (
    <section id="menu" className="py-20 sm:py-28 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dd2023] mb-3">
            <Utensils className="w-4 h-4" />
            <span>Feast Like Royalty</span>
          </div>
          <h2 className="font-serif-lux text-3xl sm:text-5xl font-black text-[#F7F3EE]">
            The Authentic <span className="text-gold-gradient">Menu</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A69F96]">
            Every recipe is freshly prepared to order using wholesome ingredients, secret herb marination, and time-honored pressure frying.
          </p>
        </div>

        {/* Filter Controls Row: Search + Veg Switch + Spice Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A69F96]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crispy buckets, burgers, rolls, drinks..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#141210] border border-white/10 text-xs text-[#F7F3EE] placeholder-[#6E675F] focus:border-[#ebdd0b] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A69F96] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Pure Veg Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                  vegOnly
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-[#141210] text-[#A69F96] border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-emerald-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>Pure Veg</span>
              </button>

              {/* Spice Filter Selector */}
              <div className="flex items-center gap-1 bg-[#141210] rounded-full border border-white/10 p-1 text-xs">
                <span className="px-2 text-[10px] uppercase font-bold text-[#6E675F]">Spice:</span>
                {(['all', 'mild', 'medium', 'hot', 'peri-peri'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedSpice(level)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                      selectedSpice === level
                        ? 'bg-[#ebdd0b] text-black font-bold shadow-sm'
                        : 'text-[#A69F96] hover:text-white'
                    }`}
                  >
                    {level === 'all' ? 'All' : level === 'peri-peri' ? 'Peri-Peri' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Category Tabs */}
          <MenuTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Results Count & Active Filters Indicator */}
        <div className="flex items-center justify-between text-xs text-[#A69F96] mb-6">
          <span>
            Showing <strong className="text-white">{filteredItems.length}</strong> delicious item
            {filteredItems.length === 1 ? '' : 's'}
          </span>
          {(vegOnly || selectedSpice !== 'all' || searchQuery || activeCategory !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[#ebdd0b] hover:underline flex items-center gap-1 font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Dish Grid */}
        {filteredItems.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <DishCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty Search Results */
          <div className="py-16 text-center glass-card rounded-2xl max-w-md mx-auto">
            <Utensils className="w-10 h-10 text-[#6E675F] mx-auto mb-3" />
            <h4 className="font-serif-lux text-xl font-bold text-white mb-2">
              No matching treats found
            </h4>
            <p className="text-xs text-[#A69F96] mb-4">
              Try adjusting your search terms or clearing your spice / diet filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gold-gradient shadow-md"
            >
              Show All Menu Items
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
