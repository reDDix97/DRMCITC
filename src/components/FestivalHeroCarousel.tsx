import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ClubEvent, Festival } from '../types/nexus';
import { ResilientImage } from './QrCodeSvg';

interface FestivalHeroCarouselProps {
  festivals: Festival[];
  events: ClubEvent[];
  onNavigate: (path: string) => void;
  formatDateRange: (start: string, end: string) => string;
}

export const FestivalHeroCarousel: React.FC<FestivalHeroCarouselProps> = ({
  festivals,
  events,
  onNavigate,
  formatDateRange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = festivals.length;

  // Auto-play timer (5 seconds) with pause on mouse hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [total, isPaused]);

  // Wrap index safely if list changes
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  if (total === 0) {
    return (
      <div className="aspect-16/10 w-full rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
        No active festivals found.
      </div>
    );
  }

  const currentFest = festivals[currentIndex];
  const festEvents = events.filter((e) => e.festivalId === currentFest.id);

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'Enter') {
      onNavigate(`/fests/${currentFest.slug}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    if (deltaX > 45) {
      prevSlide();
    } else if (deltaX < -45) {
      nextSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div className="space-y-3">
      {/* Main Carousel Screen */}
      <div
        role="region"
        aria-label="Festivals Carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => onNavigate(`/fests/${currentFest.slug}`)}
        className="group relative aspect-16/10 w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 cursor-pointer shadow-xl select-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Sliding Track for Festival Banner Images */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {festivals.map((fest) => {
            const bannerSrc = fest.coverImage || fest.thumbnailImage || '';
            return (
              <div key={fest.id} className="relative h-full w-full shrink-0 overflow-hidden bg-zinc-950">
                <ResilientImage
                  src={bannerSrc}
                  alt={`${fest.name} Banner`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            );
          })}
        </div>

        {/* Ambient Top Vignette */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Deep Bottom Contrast Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

        {/* Top Badges & Controls Header */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                currentFest.status === 'Active'
                  ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
                  : 'bg-blue-950/70 border-blue-500/30 text-blue-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentFest.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                }`}
              />
              <span>{currentFest.status === 'Active' ? 'Registration Open' : 'Upcoming Festival'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 bg-black/40 backdrop-blur-md border border-white/10">
              {currentFest.year || currentFest.startDate.slice(0, 4)} Edition
            </span>
          </div>

          {/* Slide Progress Counter */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
              <span className="text-white font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Arrow Controls (Glassmorphic) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Festival"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Festival"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Bottom Festival Content & CTA */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 min-w-0 pr-2">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="tabular-nums font-sans">
                  {formatDateRange(currentFest.startDate, currentFest.endDate)}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                {currentFest.name}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300/90 line-clamp-1 max-w-lg">
                {currentFest.tagline || currentFest.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 truncate max-w-[240px]">
                  <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{currentFest.location}</span>
                </span>
                {festEvents.length > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Trophy className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{festEvents.length} Competitive Events</span>
                  </span>
                )}
              </div>
            </div>

            {/* Open Festival Call To Action */}
            <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white hover:text-zinc-950 backdrop-blur-md border border-white/20 rounded-xl transition-all shadow-md group-hover:bg-white group-hover:text-zinc-950">
                <span>Open Festival</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Dot Indicators */}
          {total > 1 && (
            <div
              className="flex items-center gap-1.5 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              {festivals.map((fest, idx) => (
                <button
                  key={fest.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${fest.name}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-7 bg-white shadow-xs'
                      : 'w-2 bg-white/35 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Festival Selector Strip (Thumbnail Chips) */}
      {total > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {festivals.map((fest, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={fest.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer truncate ${
                  isActive
                    ? 'bg-zinc-950 text-white border-zinc-800 shadow-sm'
                    : 'bg-white text-zinc-700 border-zinc-200/90 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isActive ? 'text-blue-400' : 'text-zinc-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                      fest.status === 'Active'
                        ? isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-emerald-50 text-emerald-700'
                        : isActive
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {fest.status}
                  </span>
                </div>
                <p className="text-xs font-semibold truncate leading-tight">{fest.name}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
