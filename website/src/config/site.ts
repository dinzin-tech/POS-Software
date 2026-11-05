import { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'Five Star Chicken Restaurant',
  shortName: 'Five Star Restaurant',
  branch: 'Nelamangala Flagship',
  tagline: 'The Upgraded Dine-In Restaurant by Five Star Chicken',
  description: 'An upgraded full-service dine-in restaurant by Five Star Chicken in Nelamangala. Featuring authentic pressure-fried crispy chicken, gourmet burgers, rice bowls, beverages, and desserts in a contemporary family dining atmosphere.',
  legalName: 'Radhamma N',
  tradeName: 'CHANDU ENTERPRISES',
  constitution: 'Proprietorship',
  gstin: '29CVIPR3058J1ZY',
  fssaiNumber: '21226014000693',
  fssaiValidity: '13-07-2027',
  city: 'Nelamangala, Bengaluru',
  address: 'Ground Floor, No. 131, Kasaba Hobali, Binnamangala, Arasinakunte, Nelamangala, Bengaluru Rural, Karnataka - 562123',
  landmark: 'Near Binnamangala, Nelamangala',
  phone: '+91 98864 38778',
  // Digits only with country code for wa.me links
  whatsappNumber: '919886438778',
  email: 'orders.nelamangala@fivestarchicken.in',
  coordinates: {
    lat: 13.088689750966637,
    lng: 77.41090161024658,
  },
  googleMapsUrl: 'https://www.google.com/maps?q=13.088689750966637,77.41090161024658',
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
  menuApiUrl: process.env.NEXT_PUBLIC_MENU_API_URL || '/dashboard/api.php',
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_5StarNelamangala',
};
