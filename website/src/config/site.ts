import { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'Five Star Chicken Restaurant',
  shortName: 'Five Star',
  branch: 'Nelamangala Branch',
  tagline: 'Crispy. Juicy. Legendary.',
  description: 'Experience authentic five-star pressure-fried crispy chicken, gourmet burgers, loaded combos, and decadent treats crafted with our secret international marinade.',
  city: 'Nelamangala, Bengaluru',
  address: 'B.H. Road, Near BMTC Bus Terminal, Nelamangala Town, Bengaluru Rural, Karnataka 562123',
  landmark: 'Opposite Town Municipal Council, NH 48 Junction',
  phone: '+91 98765 43210',
  // Digits only with country code for wa.me links
  whatsappNumber: '919876543210',
  email: 'orders.nelamangala@fivestarchicken.in',
  coordinates: {
    lat: 13.0988,
    lng: 77.3878,
  },
  googleMapsUrl: 'https://maps.google.com/?q=Five+Star+Chicken+Nelamangala+Bengaluru',
  openingHours: {
    display: '11:00 AM – 11:00 PM',
    openHour: 11,
    closeHour: 23,
    days: 'Monday – Sunday (All 7 Days)',
  },
  stats: [
    { label: 'Global Presence', value: '10,000+', subtext: 'Stores Across the World' },
    { label: 'Countries Served', value: '10+', subtext: 'International Excellence' },
    { label: 'Heritage', value: '40+', subtext: 'Years of Culinary Mastery' },
    { label: 'Customer Love', value: '4.9 ★', subtext: 'Based on 5,000+ Reviews' },
  ],
  social: {
    instagram: 'https://instagram.com/fivestarchicken_in',
    facebook: 'https://facebook.com/fivestarchicken',
    youtube: 'https://youtube.com/@fivestarindia',
  },
};
