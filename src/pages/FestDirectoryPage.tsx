import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { ResilientImage } from '../components/QrCodeSvg';
import { useNexus } from '../context/NexusContext';
import { EventCategory } from '../types/nexus';

const CATEGORIES: Array<'All' | EventCategory> = [
  'All',
  'Competition',
  'Hackathon',
  'Workshop',
  'Robotics',
  'Gaming',
  'Quiz',
];

export const FestDirectoryPage: React.FC = () => {
  const {
    currentPath,
    navigate,
    festivals,
    events,
    getEventAvailability,
  } = useNexus();

  const isFestivalsDefault = currentPath.includes('tab=festivals');
  const [activeTab, setActiveTab] = useState<'events' | 'festivals'>(
    isFestivalsDefault ? 'festivals' : 'events'
  );

  useEffect(() => {
    setActiveTab(currentPath.includes('tab=festivals') ? 'festivals' : 'events');
  }, [currentPath]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('ALL');
  const [selectedDateMonth, setSelectedDateMonth] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const visibleFestivals = useMemo(
    () => festivals.filter((f) => f.status !== 'Archived' && f.status !== 'Draft'),
    [festivals]
  );

  const visibleEvents = useMemo(
    () => events.filter((e) => e.status !== 'Archived' && e.status !== 'Draft'),
    [events]
  );

  const festivalsMap = useMemo(() => {
    const map: Record<string, typeof festivals[0]> = {};
    festivals.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [festivals]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visibleEvents.filter((ev) => {
      const fest = festivalsMap[ev.festivalId];
      const avail = getEventAvailability(ev);

      if (q) {
        const matchesSearch =
          ev.name.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.shortSummary.toLowerCase().includes(q) ||
          (fest && fest.name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }

      if (selectedFestivalId !== 'ALL' && ev.festivalId !== selectedFestivalId) {
        return false;
      }

      if (selectedDateMonth !== 'ALL' && !ev.date.startsWith(selectedDateMonth)) {
        return false;
      }

      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'OPEN_ANY') {
          if (!avail.canRegister) return false;
        } else if (avail.effectiveStatus !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [
    visibleEvents,
    festivalsMap,
    searchQuery,
    selectedCategory,
    selectedFestivalId,
    selectedDateMonth,
    selectedStatus,
    getEventAvailability,
  ]);

  const filteredFestivals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visibleFestivals;
    return visibleFestivals.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [visibleFestivals, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFestivalId('ALL');
    setSelectedDateMonth('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedFestivalId !== 'ALL' ||
    selectedDateMonth !== 'ALL' ||
    selectedStatus !== 'ALL';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>DRMC IT Club</span>
            <span aria-hidden="true">·</span>
            <span>Festival & Event Directory</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
            Explore events
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl">
            Find competitions, workshops, challenges and activities happening across the
            organization.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex items-center p-1 bg-zinc-100 rounded-lg self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('events');
              navigate('/fests');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            All Events ({visibleEvents.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('festivals');
              navigate('/fests?tab=festivals');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'festivals'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Festivals ({visibleFestivals.length})
          </button>
        </div>
      </div>

      {activeTab === 'festivals' ? (
        <section className="space-y-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search festivals by name or venue..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {filteredFestivals.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-3">
              <p className="font-display text-lg font-bold text-zinc-900">No festivals found</p>
              <p className="text-sm text-zinc-600">
                Try adjusting your search query to view available club festivals.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-lg cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredFestivals.map((fest) => {
                const festEvents = visibleEvents.filter((e) => e.festivalId === fest.id);
                return (
                  <div
                    key={fest.id}
                    className="bg-white border border-zinc-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                  >
                    <div
                      onClick={() => navigate(`/fests/${fest.slug}`)}
                      className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto bg-zinc-950 cursor-pointer overflow-hidden group"
                    >
                      <ResilientImage
                        src={fest.coverImage}
                        alt={fest.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-xs font-mono text-emerald-300">{fest.status}</p>
                        <p className="font-display text-xl font-bold mt-0.5">{fest.name}</p>
                      </div>
                    </div>

                    <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono tabular-nums">
                          <span>
                            {fest.startDate} to {fest.endDate}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans">{fest.location}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-900 font-semibold">
                            {festEvents.length} Events
                          </span>
                        </div>

                        <h2
                          onClick={() => navigate(`/fests/${fest.slug}`)}
                          className="font-display text-2xl font-bold text-zinc-950 hover:text-blue-700 cursor-pointer transition-colors"
                        >
                          {fest.name}
                        </h2>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {fest.description}
                        </p>

                        <div className="pt-2">
                          <p className="text-xs font-semibold text-zinc-500 mb-2">
                            Events in {fest.name}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {festEvents.map((ev) => (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => navigate(`/events/${ev.slug}`)}
                                className="px-3 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                              >
                                {ev.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          Organized by {fest.organizerName}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/fests/${fest.slug}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Open Festival Directory</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Quick Festival Cards Strip */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-500">
                Browse by Festival ({visibleFestivals.length})
              </h2>
              {selectedFestivalId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedFestivalId('ALL')}
                  className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                >
                  Show all festivals
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleFestivals.map((fest) => {
                const count = visibleEvents.filter((e) => e.festivalId === fest.id).length;
                const isSelected = selectedFestivalId === fest.id;
                return (
                  <div
                    key={fest.id}
                    className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={
                            isSelected ? 'text-emerald-300 font-medium' : 'text-emerald-700 font-medium'
                          }
                        >
                          {fest.status}
                        </span>
                        <span
                          className={`font-mono tabular-nums ${
                            isSelected ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {count} events
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold">{fest.name}</h3>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-500'
                        }`}
                      >
                        {fest.startDate} · {fest.location}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/20 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFestivalId(isSelected ? 'ALL' : fest.id)
                        }
                        className={`font-semibold cursor-pointer ${
                          isSelected
                            ? 'text-blue-300 hover:text-white'
                            : 'text-blue-700 hover:text-blue-800'
                        }`}
                      >
                        {isSelected ? 'Filtering events ✓' : 'Filter events'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/fests/${fest.slug}`)}
                        className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                          isSelected
                            ? 'text-zinc-300 hover:text-white'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <span>Festival page</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Search & Multi-Axis Filter Bar */}
          <section className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by event name, category, festival, or venue..."
                  aria-label="Search events"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label="Filter by Festival"
                  value={selectedFestivalId}
                  onChange={(e) => setSelectedFestivalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Festivals</option>
                  {visibleFestivals.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  aria-label="Filter by Date"
                  value={selectedDateMonth}
                  onChange={(e) => setSelectedDateMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Dates</option>
                  <option value="2026-10">Oct 2026</option>
                  <option value="2026-12">Dec 2026</option>
                  <option value="2027-01">Jan 2027</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  aria-label="Filter by Registration Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN_ANY">Open for Registration</option>
                  <option value="Open">Open</option>
                  <option value="Closing Soon">Closing Soon</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-zinc-400 mr-1 inline-flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Category:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-zinc-950 text-white font-semibold'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="font-mono tabular-nums">
                  Showing <strong className="text-zinc-900">{filteredEvents.length}</strong> of{' '}
                  {visibleEvents.length} events
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center max-w-lg mx-auto my-8 space-y-3">
              <h3 className="font-display text-xl font-bold text-zinc-950">No events found</h3>
              <p className="text-sm text-zinc-600">
                Try adjusting your search or filters to discover available competitions and
                workshops.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  festival={festivalsMap[ev.festivalId]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
