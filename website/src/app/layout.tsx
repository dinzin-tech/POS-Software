import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
import CartDrawer from '@/components/cart/CartDrawer';
import CustomCursor from '@/components/layout/CustomCursor';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fivestarchicken-nelamangala.in'),
  title: `${siteConfig.name} | ${siteConfig.branch}`,
  description: `${siteConfig.tagline}. Authentic pressure-fried crispy chicken, gourmet burgers, loaded combos, and decadent treats in Nelamangala, Bengaluru. Order online directly via WhatsApp!`,
  keywords: [
    'Five Star Chicken Nelamangala',
    'Fried Chicken Nelamangala',
    'Crispy Chicken Bengaluru',
    'Chicken Burgers Nelamangala',
    'Online Chicken Delivery Nelamangala',
    'Five Star Restaurant NH48',
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.branch}`,
    description: siteConfig.description,
    url: 'https://fivestarchicken-nelamangala.in',
    siteName: siteConfig.name,
    images: [
      {
        url: '/images/menu/signature-chicken-bucket.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Signature Crispy Chicken Bucket`,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.branch}`,
    description: siteConfig.description,
    images: ['/images/menu/signature-chicken-bucket.jpg'],
  },
  icons: {
    icon: '/images/logo/five-star-emblem.png',
    apple: '/images/logo/five-star-emblem.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    image: ['/images/menu/signature-chicken-bucket.jpg', '/images/interior/dining-hall-world-map.jpg'],
    '@id': 'https://fivestarchicken-nelamangala.in',
    url: 'https://fivestarchicken-nelamangala.in',
    telephone: siteConfig.phone,
    menu: 'https://fivestarchicken-nelamangala.in/#menu',
    servesCuisine: ['Fried Chicken', 'Burgers', 'Fast Food', 'Snacks'],
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressLocality: 'Nelamangala',
      addressRegion: 'Karnataka',
      postalCode: '562123',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.coordinates.lat,
      longitude: siteConfig.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '11:00',
        closes: '23:00',
      },
    ],
  };

  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans-lux bg-[#080808] text-[#F7F3EE] min-h-screen selection:bg-[#ebdd0b]/30 selection:text-[#F7F3EE] relative">
        <div className="fixed inset-0 pointer-events-none grain-overlay z-50 opacity-40" />
        <CustomCursor />
        {children}
        <CartDrawer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
