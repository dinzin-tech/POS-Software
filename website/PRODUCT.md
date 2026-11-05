# Product: Five Star Chicken Restaurant (Nelamangala Flagship)

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Local residents, families, and highway travelers along B.H. Road / NH48 in Nelamangala, Bengaluru seeking authentic pressure-fried chicken, gourmet burgers, snacks, and combo meals. They visit to inspect the live menu, check kitchen hours and certification, order online for pickup/delivery, or reserve seats.

## Product Purpose

Deliver a fast, authoritative, high-craft restaurant web experience. The website syncs live with the FloCafe POS backend for menu availability and stock status, processes takeaway/dine-in/delivery orders via direct bridge API, and provides instant WhatsApp table reservations with zero friction.

## Positioning

An upgraded full-service dine-in restaurant edition by Five Star Chicken. Rather than a standard express takeaway kiosk or outlet, this Nelamangala flagship is a spacious, modern restaurant featuring family dining seating, an expanded chef menu (crispy buckets, artisan burgers, rice bowls, beverages, and sizzling desserts), table reservations, and express takeaway counters—all backed by Five Star Chicken's 40-year global heritage across 10,000+ locations. Rooted in Impeccable's "Neo Kinpaku" design system with deep Japanese lacquer surfaces, authentic kinpaku gold accents, and structured architectural layouts.

## Operating Context

- Modern Next.js 16 (React 19) frontend with Tailwind CSS.
- Real-time live synchronization with FloCafe local POS and shared-host bridge API (`sharedhost-mobile/api.php`).
- Accessible to both desktop patrons and mobile diners ordering inside or on the road.

## Brand Commitments

1. **Neo Kinpaku Visual Authority:** Warm mineral lacquer surfaces (`oklch(7% 0.006 95)`), refined kinpaku gold leaf (`oklch(84% 0.19 80.46)`), and verdigris patina (`oklch(70% 0.12 188)`). Never generic AI black (`#000000`), never purple-to-blue gradients, never nested cards.
2. **Typography Discipline:** Alumni Sans for condensed, architectural headlines (weight inversion: H1 weight 100, H2 weight 300); Albert Sans for legible body copy; JetBrains Mono for prices, times, and tabular data.
3. **No Unnecessary Visual Effects:** No gimmicky custom cursors, no fake noise/grain overlays, no decorative glass blur halos, no bouncy springs. Precision linear and subtle cubic bezier motion only.
4. **Editorial Integrity:** Verifiable facts only (FSSAI registered, GSTIN compliant, 100% Halal cut certified, real menu items).

## Accessibility & Standards

- Contrast ratios: Body text ≥ 4.5:1, large display ≥ 3:1.
- Semantic HTML and ARIA labels on all interactive controls.
- Tabular figures (`font-mono tabular-nums`) for currency and pricing.
- Respect `prefers-reduced-motion`.
