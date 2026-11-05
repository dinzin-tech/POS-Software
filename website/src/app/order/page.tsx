import { Suspense } from 'react';
import type { Metadata } from 'next';
import OrderPageClient from './OrderPageClient';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `In-Store QR Order & Live Token | ${siteConfig.name}`,
  description: `Scan and order directly at Five Star Chicken, Nelamangala Flagship. Instant KOT routing, live order tokens, and secure digital bills.`,
};

function OrderPageLoading() {
  return (
    <div className="min-h-screen bg-[var(--ks-lacquer-black)] text-[var(--ks-text-warm)] flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-12 h-12 rounded-[2px] border-2 border-[var(--ks-kinpaku)] border-t-transparent animate-spin mb-4" />
      <span className="text-sm text-[var(--ks-champagne)]">Loading In-Store Menu...</span>
      <span className="text-xs text-[var(--ks-text-muted)] mt-1">Five Star Chicken • Nelamangala Flagship</span>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageLoading />}>
      <OrderPageClient />
    </Suspense>
  );
}
