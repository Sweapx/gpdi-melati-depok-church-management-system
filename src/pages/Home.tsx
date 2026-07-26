import { motion } from 'motion/react';
import HeroSection from '../components/home/HeroSection.tsx';
import QuickAccessCards from '../components/home/QuickAccessCards.tsx';
import InteractiveSchedule from '../components/home/InteractiveSchedule.tsx';
import AnnouncementSection from '../components/home/AnnouncementSection.tsx';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 w-full">
        <QuickAccessCards />
      </div>
      
      <div id="jadwal" className="bg-white py-16 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <InteractiveSchedule />
        </div>
      </div>
      
      <div id="pengumuman" className="max-w-7xl mx-auto px-4 w-full">
        <AnnouncementSection />
      </div>
    </div>
  );
}
