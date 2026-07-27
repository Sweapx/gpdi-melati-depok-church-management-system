import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { HeroSlide } from '../../types/index.ts';

export default function HeroSection() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Fetch slides from API
    fetch('/api/hero-slides')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const mappedSlides = data.data.map((s: any) => ({
            ...s,
            imageUrl: s.image_url || s.imageUrl,
            badge: s.badge || s.badge,
            title: s.title || s.title,
            subtitle: s.subtitle || s.subtitle,
            ctaText: s.cta_text || s.ctaText,
            ctaType: s.cta_type || s.ctaType,
            eventName: s.event_name || s.eventName,
            isActive: s.is_active !== undefined ? s.is_active : s.isActive,
            orderIndex: s.order_index !== undefined ? s.order_index : s.orderIndex
          }));
          setSlides(mappedSlides.filter((s: HeroSlide) => s.isActive).sort((a: HeroSlide, b: HeroSlide) => a.orderIndex - b.orderIndex));
        } else {
          setSlides([]);
        }
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-navy"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex flex-col justify-center">
            <div className="max-w-xl text-left">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-gold uppercase bg-gold/20 border border-gold/40 rounded-full"
              >
                {slides[currentIndex].badge}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 leading-tight italic"
              >
                {slides[currentIndex].title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/80 mb-8 max-w-lg"
              >
                {slides[currentIndex].subtitle}
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  if (slides[currentIndex].ctaType === 'schedule') {
                    document.getElementById('jadwal')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (slides[currentIndex].ctaType === 'event') {
                    document.getElementById('pengumuman')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (slides[currentIndex].ctaType === 'warta') {
                    navigate('/warta');
                  } else if (slides[currentIndex].ctaType === 'prayer') {
                    document.getElementById('warta')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group flex items-center gap-2 bg-white text-navy px-8 py-3.5 rounded-full font-bold hover:shadow-md transition-all shadow-sm uppercase tracking-wider text-xs"
              >
                {slides[currentIndex].ctaText}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute right-4 bottom-8 flex gap-2">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={clsx(
              "w-2.5 h-2.5 rounded-full transition-all",
              idx === currentIndex ? "bg-gold w-6" : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
