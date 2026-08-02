import { motion } from 'motion/react';
import HeroSection from '../components/home/HeroSection.tsx';
import SimpleScheduleSection from '../components/home/SimpleScheduleSection.tsx';
import AnnouncementSection from '../components/home/AnnouncementSection.tsx';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      <HeroSection />
      
      <div id="jadwal" className="max-w-7xl mx-auto px-4 w-full">
        <SimpleScheduleSection />
      </div>
      
      <div id="pengumuman" className="max-w-7xl mx-auto px-4 w-full">
        <AnnouncementSection />
      </div>
    </div>
  );
}
