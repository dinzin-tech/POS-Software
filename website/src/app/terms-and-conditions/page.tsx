import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { siteConfig } from '@/config/site';
import { ShieldCheck, ArrowLeft, CheckCircle2, Scale, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.name} (${siteConfig.tradeName})`,
  description: `Terms and Conditions for ${siteConfig.name} operated by ${siteConfig.tradeName} (GSTIN: ${siteConfig.gstin}, FSSAI: ${siteConfig.fssaiNumber}) in Nelamangala, Bengaluru Rural.`,
};

export default function TermsAndConditionsPage() {
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
            <Scale className="w-3.5 h-3.5 text-[var(--ks-patina)]" />
            <span>Legal Agreement & Terms of Service</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl font-light text-[var(--ks-champagne)] uppercase tracking-wide">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[var(--ks-text-muted)] max-w-2xl leading-relaxed font-body">
            Please read these Terms and Conditions carefully before ordering food, reserving tables, or utilizing services provided by <strong className="text-[var(--ks-champagne)]">{siteConfig.tradeName}</strong> ({siteConfig.name}, Nelamangala Branch).
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[var(--ks-text-muted)] font-mono">
            <span><strong>Effective Date:</strong> July 20, 2026</span>
            <span>•</span>
            <span><strong>Entity:</strong> {siteConfig.tradeName}</span>
            <span>•</span>
            <span><strong>Proprietor:</strong> {siteConfig.legalName}</span>
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
                  <span>Business Verification</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Registered Trade Name</span>
                    <strong className="text-[var(--ks-champagne)] text-sm">{siteConfig.tradeName}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Constitution</span>
                    <span className="text-[var(--ks-champagne)]">{siteConfig.constitution}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Legal Proprietor</span>
                    <span className="text-[var(--ks-champagne)]">{siteConfig.legalName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">GST Number</span>
                    <span className="font-mono-num text-[var(--ks-kinpaku)] font-bold text-sm">{siteConfig.gstin}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">FSSAI License</span>
                    <span className="font-mono-num text-[var(--ks-champagne)]">{siteConfig.fssaiNumber}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Store Phone</span>
                    <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="text-[var(--ks-champagne)] hover:text-[var(--ks-kinpaku)] font-mono-num">
                      {siteConfig.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[var(--ks-text-muted)] block text-xs uppercase">Physical Premises</span>
                    <span className="text-[var(--ks-text-muted)] leading-relaxed text-xs block font-body">
                      {siteConfig.address}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--ks-gold-hairline)] space-y-1.5 text-xs font-mono">
                  <div className="text-[var(--ks-patina)] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ks-patina)] shrink-0" />
                    <span>100% Halal Cut Poultry Certified</span>
                  </div>
                  <div className="text-[var(--ks-text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--ks-kinpaku)] shrink-0" />
                    <span>Open Daily: 11:00 AM – 11:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Articles */}
            <div className="lg:col-span-8 order-1 lg:order-2 space-y-8 text-sm leading-relaxed text-[var(--ks-text-muted)] font-body">
              {/* Article 1 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By visiting our restaurant, accessing our website, placing food orders, or requesting table reservations, you agree to be legally bound by these Terms and Conditions. These terms constitute a valid and enforceable agreement between you and <strong className="text-[var(--ks-champagne)]">{siteConfig.tradeName}</strong>.
                </p>
              </div>

              {/* Article 2 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  2. 100% Halal Cut Poultry & Quality Standards
                </h2>
                <p>
                  Every piece of poultry processed and cooked in our kitchen is strictly 100% Halal cut chicken sourced from certified hygienic poultry providers. Operations strictly adhere to regulations established by the Food Safety and Standards Authority of India (FSSAI Reg No: {siteConfig.fssaiNumber}).
                </p>
              </div>

              {/* Article 3 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  3. Menu Pricing, Taxes & GST Billing
                </h2>
                <p>
                  All prices displayed are in Indian Rupees (₹ INR). Applicable Goods and Services Tax (GST) is levied as per Government of India restaurant tax notifications under GSTIN: {siteConfig.gstin}. GST-compliant retail tax invoices are generated for all orders.
                </p>
              </div>

              {/* Article 4 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  4. Ordering, Pickup & Home Delivery
                </h2>
                <p>
                  Orders submitted through the website bridge are acknowledged and printed directly in our kitchen POS. Delivery is provided within Nelamangala and nearby areas. Takeaway orders should be collected promptly to enjoy maximum crispness.
                </p>
              </div>

              {/* Article 5 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  5. Cancellation & Replacement Policy
                </h2>
                <p>
                  Since all food items are perishable and prepared freshly upon order receipt, orders cannot be canceled once kitchen preparation has begun. In the rare case of any discrepancies or missing items, contact our hotline ({siteConfig.phone}) within 30 minutes for an immediate replacement.
                </p>
              </div>

              {/* Article 6 */}
              <div className="space-y-2.5">
                <h2 className="font-title text-base sm:text-lg font-semibold text-[var(--ks-champagne)]">
                  6. Jurisdiction
                </h2>
                <p>
                  These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the competent courts in Nelamangala / Bengaluru Rural, Karnataka.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
