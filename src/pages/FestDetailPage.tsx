import React, { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw, Search } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { ResilientImage } from '../components/QrCodeSvg';
import { useNexus } from '../context/NexusContext';
import { EventCategory } from '../types/nexus';

interface FestDetailPageProps {
  slug: string;
}

const CATEGORIES: Array<'All' | EventCategory> = [
  'All',
  'Competition',
  'Hackathon',
  'Workshop',
  'Robotics',
  'Gaming',
  'Quiz',
];

export const FestDetailPage: React.FC<FestDetailPageProps> = ({ slug }) => {
  const {
    navigate,
    getFestivalBySlug,
    events,
    getEventAvailability,
  } = useNexus();

  const festival = getFestivalBySlug(slug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  const festEvents = useMemo(() => {
    if (!festival) return [];
    return events.filter(
      (e) =>
        e.festivalId === festival.id &&
        e.status !== 'Draft' &&
        e.status !== 'Archived'
    );
  }, [events, festival]);

  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    festEvents.forEach((e) => set.add(e.date));
    return Array.from(set).sort();
  }, [festEvents]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return festEvents.filter((ev) => {
      if (q) {
        const match =
          ev.name.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.shortSummary.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }
      if (selectedDate !== 'ALL' && ev.date !== selectedDate) {
        return false;
      }
      return true;
    });
  }, [festEvents, searchQuery, selectedCategory, selectedDate]);

  if (!festival) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-zinc-950">Festival not found</h1>
        <p className="text-sm text-zinc-600">
          The festival you are looking for may have been moved or archived.
        </p>
        <button
          type="button"
          onClick={() => navigate('/fests')}
          className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const totalCapacity = festEvents.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = festEvents.reduce(
    (sum, e) => sum + getEventAvailability(e).registeredCount,
    0
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div>
        <button
          type="button"
          onClick={() => navigate('/fests')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Festival & Event Directory</span>
        </button>
      </div>

      <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto bg-zinc-950">
            <ResilientImage
              src={festival.coverImage}
              alt={festival.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-300">{festival.status}</span>
                <span aria-hidden="true">·</span>
                <span>{festival.organizerName}</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 font-mono tabular-nums">
                {festival.startDate} to {festival.endDate}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-900">{festival.organizerName}</span>
                <span aria-hidden="true">·</span>
                <span>{festival.location}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700">{festival.status}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
                {festival.name}
              </h1>

              <p className="text-sm font-medium text-zinc-800">{festival.tagline}</p>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {festival.description}
              </p>
            </div>

            <div className="pt-6 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Dates</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                  {festival.startDate} → {festival.endDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Events</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                  {festEvents.length} Official Tracks
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Registrations</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                  {totalRegistered} / {totalCapacity} Seats
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Organizer</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 mt-0.5">
                  {festival.organizerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-zinc-950">
              Events in this festival
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Select any competition or workshop below to inspect rules, check seat availability, and
              register.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-500 tabular-nums">
            Showing {filteredEvents.length} of {festEvents.length} events
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search events in ${festival.name}...`}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-950 text-white font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                }`}
              >
                {cat}
              </button>
            ))}

            <select
              aria-label="Filter by Event Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800"
            >
              <option value="ALL">All Dates</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center space-y-3">
            <p className="font-display text-lg font-bold text-zinc-900">
              No matching events in {festival.name}
            </p>
            <p className="text-sm text-zinc-600">
              Try clearing your category or date filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDate('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                festival={festival}
                showFestivalName={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
