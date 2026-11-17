'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Utensils, CircleAlert, Sparkles } from 'lucide-react';
import { useLiveMenu } from '@/lib/useLiveMenu';
import MenuTabs from '@/components/menu/MenuTabs';
import DishCard from '@/components/menu/DishCard';

export default function FullMenu() {
  const { items: menuItems, categories, storeStatus, isLive } = useLiveMenu();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter (match by id or slug or category name)
      if (activeCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const activeCat = activeCategory.toLowerCase();
        if (itemCat !== activeCat && item.categoryName?.toLowerCase() !== activeCat) {
          return false;
        }
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
  }, [menuItems, activeCategory, vegOnly, selectedSpice, searchQuery]);

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setVegOnly(false);
    setSelectedSpice('all');
  };

  return (
    <section id="menu" className="py-20 sm:py-24 bg-[var(--ks-lacquer-black)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Direct Headline, no kicker eyebrow, no gradient text */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            The Authentic Menu
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] font-body leading-relaxed">
            Every recipe is freshly prepared to order using wholesome farm ingredients, secret herb marination, and time-honored pressure frying.
          </p>

          {isLive && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(84%_0.19_80.46_/_0.1)] border border-[var(--ks-gold-hairline-strong)] text-xs font-semibold text-[var(--ks-kinpaku)] font-mono">
                <Sparkles className="w-3 h-3 text-[var(--ks-kinpaku)]" />
                <span>Live POS Sync</span>
              </div>
            </div>
          )}

          {/* Restaurant Live Operating Status Banner */}
          <div className="mt-5">
            {storeStatus.isOpen ? (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[oklch(70%_0.12_188_/_0.4)] text-xs font-medium text-[var(--ks-champagne)]">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ks-patina)]"></span>
                </span>
                <span>{storeStatus.statusText} • Kitchen Active & Accepting Orders</span>
                {storeStatus.openingHours?.display && (
                  <span className="text-[var(--ks-text-muted)] font-mono hidden sm:inline">
                    ({storeStatus.openingHours.display})
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-[4px] bg-[var(--ks-raised-lacquer)] border border-[oklch(58%_0.15_35_/_0.5)] text-xs font-medium text-[var(--ks-champagne)] max-w-xl mx-auto">
                <CircleAlert className="w-4 h-4 text-[var(--ks-vermilion)] shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-[var(--ks-vermilion)]">{storeStatus.statusText}: {storeStatus.message || 'Online order booking is paused.'}</p>
                  <p className="text-xs text-[var(--ks-text-muted)] mt-0.5 font-mono">
                    Kitchen hours: {storeStatus.openingHours?.display || '11:00 AM – 11:00 PM'}. You can still browse our menu below.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls: Sticky Search + Veg Switch + Spice Filter + Categories */}
        <div className="sticky top-[56px] sm:top-[64px] z-30 bg-[var(--ks-lacquer-black)]/95 backdrop-blur-md pt-2 pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--ks-gold-hairline)] mb-6 space-y-2.5 shadow-lg">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ks-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, burgers, combos, rolls..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-[var(--ks-graphite)] border border-[var(--ks-gold-hairline)] text-xs sm:text-sm text-[var(--ks-champagne)] placeholder-[var(--ks-text-muted)] focus:border-[var(--ks-kinpaku)] focus:outline-none transition-colors min-h-[38px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex items-center flex-wrap gap-2 max-w-full">
              {/* Pure Veg Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all shrink-0 min-h-[34px] ${
                  vegOnly
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500 shadow-sm'
                    : 'bg-[var(--ks-graphite)] text-[var(--ks-text-muted)] border-[var(--ks-gold-hairline)] hover:border-[var(--ks-gold-hairline-strong)]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-500 bg-[var(--ks-lacquer-deep)] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>Veg Only</span>
              </button>

              {/* Spice Filter Selector with horizontal scroll on narrow mobile screens */}
              <div className="overflow-x-auto no-scrollbar max-w-full">
                <div className="flex items-center gap-1 bg-[var(--ks-graphite)] rounded-full border border-[var(--ks-gold-hairline)] p-0.5 text-xs whitespace-nowrap shrink-0">
                  <span className="px-2 text-[10px] uppercase font-mono font-bold text-[var(--ks-text-muted)]">Spice:</span>
                  {(['all', 'mild', 'medium', 'hot', 'peri-peri'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedSpice(level)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors min-h-[30px] ${
                        selectedSpice === level
                          ? 'bg-[var(--ks-kinpaku)] text-[var(--ks-dark-ink)] font-bold'
                          : 'text-[var(--ks-text-muted)] hover:text-[var(--ks-champagne)]'
                      }`}
                    >
                      {level === 'all' ? 'All' : level === 'peri-peri' ? 'Peri-Peri' : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Category Tabs (Live from POS or Default) */}
          <MenuTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            categories={categories}
          />
        </div>

        {/* Results Count & Active Category Header (Swiggy / Zomato style) */}
        <div className="flex items-center justify-between text-xs text-[var(--ks-text-muted)] mb-4 font-mono">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[var(--ks-champagne)] font-title">
              {categories.find((c) => c.id === activeCategory)?.name || (activeCategory === 'all' ? 'All Items' : activeCategory)}
            </span>
            <span className="font-mono text-xs text-[var(--ks-text-muted)]">
              ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          {(vegOnly || selectedSpice !== 'all' || searchQuery || activeCategory !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[var(--ks-kinpaku)] hover:underline flex items-center gap-1 font-semibold text-xs"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Dish Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-28">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DishCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty Search Results */
          <div className="py-16 text-center ks-tile max-w-md mx-auto p-8">
            <Utensils className="w-8 h-8 text-[var(--ks-text-muted)] mx-auto mb-3" />
            <h4 className="font-headline text-2xl font-light text-[var(--ks-champagne)] mb-2">
              No matching items found
            </h4>
            <p className="text-xs text-[var(--ks-text-muted)] mb-5 font-body">
              Try adjusting your search terms or clearing your spice and diet filters.
            </p>
            <button
              onClick={resetFilters}
              className="ks-btn-primary text-xs py-2 px-5"
            >
              Show All Menu Items
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
