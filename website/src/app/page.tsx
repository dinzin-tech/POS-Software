import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import SignatureDishes from '@/components/sections/SignatureDishes';
import FullMenu from '@/components/sections/FullMenu';
import OurStory from '@/components/sections/OurStory';
import AmbianceGallery from '@/components/sections/AmbianceGallery';
import Testimonials from '@/components/sections/Testimonials';
import ReserveWhatsApp from '@/components/sections/ReserveWhatsApp';
import VisitUs from '@/components/sections/VisitUs';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#F7F3EE]">
      <Navbar />
      <Hero />
      <SignatureDishes />
      <FullMenu />
      <OurStory />
      <AmbianceGallery />
      <Testimonials />
      <ReserveWhatsApp />
      <VisitUs />
      <Footer />
    </main>
  );
}
