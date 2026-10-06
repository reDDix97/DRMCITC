import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { ResilientImage } from '../components/QrCodeSvg';
import { useNexus } from '../context/NexusContext';
import { HERO_IMAGE_URL } from '../data/seed';

export const LandingPage: React.FC = () => {
  const {
    navigate,
    organization,
    festivals,
    events,
    registrations,
    checkIns,
    getEventAvailability,
  } = useNexus();

  const visibleFestivals = festivals.filter((f) => f.status !== 'Archived');
  const visibleEvents = events.filter(
    (e) => e.status !== 'Draft' && e.status !== 'Archived'
  );
  const featuredEvents = visibleEvents.filter((e) => e.featured).slice(0, 6);

  const activeRegistrations = registrations.filter((r) => r.status !== 'Cancelled');
  const totalCapacity = visibleEvents.reduce((sum, e) => sum + e.capacity, 0);

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eStr = e.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${sStr} – ${eStr}`;
  };

  return (
    <div className="space-y-20 sm:space-y-24 pb-8">
      {/* HERO SECTION */}
      <section className="pt-8 sm:pt-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span className="text-zinc-900 font-semibold">{organization.name}</span>
                <span aria-hidden="true">·</span>
                <span>{organization.subtitle}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">2026–2027 Season</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-zinc-950 leading-[1.06]">
                Every event. One place.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Discover festivals, register for events, and manage your participation — all from
                one smart club platform.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/fests')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-900 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Organizer Dashboard</span>
                </button>
              </div>

              {/* Quantitative metrics strip */}
              <div className="pt-6 border-t border-zinc-200 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
                    {visibleFestivals.length}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Active & Upcoming Fests</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
                    {visibleEvents.length}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Live Competitions & Labs</p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
                    {activeRegistrations.length}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Verified Registrations</p>
                </div>
              </div>
            </div>

            {/* Right Visual Carrier */}
            <div className="lg:col-span-6">
              <div
                onClick={() => navigate('/fests/tech-carnival-2026')}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/fests/tech-carnival-2026');
                }}
                className="group relative aspect-16/10 w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 cursor-pointer"
              >
                <ResilientImage
                  src={HERO_IMAGE_URL}
                  alt="DRMC IT Club National Technology Symposium"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="text-emerald-400 font-semibold">Registration Open</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Oct 24 – Oct 26, 2026</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                      Tech Carnival 2026
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                      DRMC Main Auditorium & Innovation Complex · 4 Flagship Events
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-blue-300 whitespace-nowrap">
                    <span>Open Festival</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING FESTIVALS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">01. Flagship Programs</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Upcoming Festivals
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Explore seasonal symposiums, hackathons, and onboarding olympiads hosted by{' '}
              {organization.name}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/fests?tab=festivals')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>View all festivals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleFestivals.map((fest) => {
            const festEvents = visibleEvents.filter((e) => e.festivalId === fest.id);
            const totalSeats = festEvents.reduce((acc, e) => acc + e.capacity, 0);
            const totalBooked = festEvents.reduce(
              (acc, e) => acc + getEventAvailability(e).registeredCount,
              0
            );

            return (
              <article
                key={fest.id}
                onClick={() => navigate(`/fests/${fest.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/fests/${fest.slug}`);
                  }
                }}
                tabIndex={0}
                role="link"
                className="group bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div>
                  <div className="relative aspect-16/9 w-full bg-zinc-900 overflow-hidden">
                    <ResilientImage
                      src={fest.coverImage}
                      alt={fest.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="font-mono tabular-nums">
                        {formatDateRange(fest.startDate, fest.endDate)}
                      </span>
                      <span className="font-semibold text-emerald-300">{fest.status}</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
                      <span className="font-mono tabular-nums font-semibold text-zinc-800">
                        {festEvents.length} {festEvents.length === 1 ? 'event' : 'events'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{fest.location}</span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-zinc-950 group-hover:text-blue-700 transition-colors">
                      {fest.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                      {fest.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-zinc-600">
                    {totalBooked} / {totalSeats} total seats claimed
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-zinc-900 group-hover:text-blue-700">
                    <span>View festival</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">02. Open Competitions & Workshops</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Featured Events
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Live capacity tracking, clear deadlines, and instant digital QR pass issuance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Browse all {visibleEvents.length} events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-zinc-200 py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-blue-700 mb-1">03. Operational Workflow</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              How NEXUS Works
            </h2>
            <p className="text-sm text-zinc-600 mt-1.5">
              From discovering an event to scanning your QR pass at the venue door in under two
              minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Discover',
                description:
                  'Filter competitions, hackathons, robotics challenges, and workshops across upcoming club festivals with live seat counts.',
              },
              {
                step: '02',
                title: 'Register',
                description:
                  'Complete a validated registration form with automatic duplicate detection, schedule conflict checks, and deadline enforcement.',
              },
              {
                step: '03',
                title: 'Get your pass',
                description:
                  'Receive an instant NEXUS registration code and scannable QR pass ready to print, save, or add directly to your calendar.',
              },
              {
                step: '04',
                title: 'Show up',
                description:
                  'Present your pass at the venue gate. Organizers verify your QR code in one scan and update live attendance telemetry.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border-t-2 border-zinc-900 pt-5 space-y-2.5"
              >
                <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-bold text-zinc-950">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORGANIZATION OVERVIEW & FINAL CTA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 text-white rounded-2xl p-8 sm:p-12 border border-zinc-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-semibold text-white">{organization.name}</span>
                <span aria-hidden="true">·</span>
                <span>Est. {organization.foundedYear}</span>
                <span aria-hidden="true">·</span>
                <span>Dhaka, Bangladesh</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered for high-velocity student club operations.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                {organization.description}
              </p>
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/fests')}
                  className="px-6 py-3 text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Browse Festival Directory
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-registrations')}
                  className="px-6 py-3 text-sm font-semibold text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  View My Registrations
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-800 lg:pl-10">
              <div>
                <p className="font-mono text-3xl font-bold text-white tabular-nums">
                  {visibleFestivals.length}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Active & Upcoming Festivals</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-white tabular-nums">
                  {visibleEvents.length}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Scheduled Events</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-white tabular-nums">
                  {activeRegistrations.length} / {totalCapacity}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Seats Claimed Across Campus</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                  {checkIns.length}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Verified QR Check-Ins</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
