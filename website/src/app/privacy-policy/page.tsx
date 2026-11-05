import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { siteConfig } from '@/config/site';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name} (${siteConfig.tradeName})`,
  description: `Privacy Policy for ${siteConfig.name} operated by ${siteConfig.tradeName} (GSTIN: ${siteConfig.gstin}, FSSAI: ${siteConfig.fssaiNumber}) in Nelamangala, Bengaluru Rural.`,
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--ks-lacquer-black)] text-[var(--ks-text-warm)]">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-[var(--ks-lacquer-deep)] border-b border-[var(--ks-gold-hairline)] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--ks-text-muted)] hover:text-[var(--ks-kinpaku)] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="ks-badge-patina mb-3">
            <Lock className="w-3.5 h-3.5 text-[var(--ks-patina)]" />
            <span>Data Protection & Privacy Standards</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] max-w-2xl leading-relaxed font-body">
            This Privacy Policy describes how <strong className="text-[var(--ks-champagne)]">{siteConfig.tradeName}</strong> (operating {siteConfig.name}, Nelamangala Branch) handles customer information when you browse our website, place online orders, or dine at our premises.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[var(--ks-text-muted)] font-mono">
            <span><strong>Effective Date:</strong> July 20, 2026</span>
            <span>•</span>
            <span><strong>Entity:</strong> {siteConfig.tradeName} (Prop. {siteConfig.legalName})</span>
            <span>•</span>
            <span><strong>GSTIN:</strong> {siteConfig.gstin}</span>
            <span>•</span>
            <span><strong>FSSAI Lic:</strong> {siteConfig.fssaiNumber}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Quick Entity Card */}
            <div className="lg:col-span-4 order-2 lg:order-1 space-y-4">
              <div className="ks-tile rounded-[6px] p-5 border border-[var(--ks-gold-hairline)] bg-[var(--ks-raised-lacquer)] space-y-3.5 sticky top-28">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ks-kinpaku)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--ks-kinpaku)]" />
                  <span>Licensed Enterprise</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Trade Name</span>
                    <strong className="text-[var(--ks-champagne)] text-sm">{siteConfig.tradeName}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Sole Proprietor</span>
                    <span className="text-[var(--ks-champagne)]">{siteConfig.legalName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">GSTIN</span>
                    <span className="font-mono-num text-[var(--ks-kinpaku)] font-bold">{siteConfig.gstin}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">FSSAI Registration</span>
                    <span className="font-mono-num text-[var(--ks-champagne)]">{siteConfig.fssaiNumber}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Store Phone</span>
                    <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] font-mono-num">
                      {siteConfig.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Operating Premises</span>
                    <span className="text-[var(--ks-text-muted)] leading-relaxed text-xs block font-body">
                      {siteConfig.address}
                    </span>
                  </div>
                </div>

                <div className="ks-badge-patina w-full justify-center py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ks-patina)] shrink-0" />
                  <span>100% Halal Cut Certified</span>
                </div>
              </div>
            </div>

            {/* Policy Clauses */}
            <div className="lg:col-span-8 order-1 lg:order-2 space-y-8 text-sm leading-relaxed text-[var(--ks-text-muted)] font-body">
              {/* Clause 1 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  1. Information We Collect
                </h2>
                <p>
                  When you use our website, place takeaway orders, request home delivery, or make dine-in table reservations, we may collect the following categories of personal information:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
                  <li><strong className="text-[var(--ks-champagne)]">Contact Data:</strong> Full name, 10-digit mobile phone number.</li>
                  <li><strong className="text-[var(--ks-champagne)]">Delivery Address:</strong> Street, building, and landmarks in Nelamangala.</li>
                  <li><strong className="text-[var(--ks-champagne)]">Order Items:</strong> Selected dishes, spice preference, and notes.</li>
                  <li><strong className="text-[var(--ks-champagne)]">Dine-In Info:</strong> Table number and guest count.</li>
                </ul>
              </div>

              {/* Clause 2 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  2. Purpose of Information Processing
                </h2>
                <p>
                  We process data strictly to prepare fresh orders, execute takeaway/delivery, print kitchen tickets (KOT), issue statutory tax invoices (GSTIN: {siteConfig.gstin}), and communicate status via WhatsApp.
                </p>
              </div>

              {/* Clause 3 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  3. Direct WhatsApp Channel
                </h2>
                <p>
                  Order updates and digital bill receipts are sent directly through your provided WhatsApp phone number. We do not use your phone number for unsolicited marketing or automated robocalls.
                </p>
              </div>

              {/* Clause 4 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  4. Non-Disclosure & Security
                </h2>
                <p>
                  <strong className="text-[var(--ks-champagne)]">{siteConfig.tradeName}</strong> does not sell, rent, or trade customer information to third-party advertising brokers. Data is accessed only by store operators and delivery personnel fulfilling your order.
                </p>
              </div>

              {/* Clause 5 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  5. Contact & Grievances
                </h2>
                <div className="p-4 rounded-[4px] bg-[var(--ks-lacquer-deep)] border border-[var(--ks-gold-hairline)] space-y-1 text-xs font-mono">
                  <p><strong className="text-[var(--ks-champagne)]">Grievance Officer:</strong> {siteConfig.legalName} (Proprietor)</p>
                  <p><strong className="text-[var(--ks-champagne)]">Enterprise:</strong> {siteConfig.tradeName}</p>
                  <p><strong className="text-[var(--ks-champagne)]">Phone / WhatsApp:</strong> {siteConfig.phone}</p>
                  <p><strong className="text-[var(--ks-champagne)]">Address:</strong> {siteConfig.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
