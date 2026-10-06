import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    festivals,
    events,
    navigate,
    getEventAvailability,
  } = useNexus();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events.slice(0, 5);
    return events
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [events, query]);

  const filteredFestivals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return festivals;
    return festivals.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.tagline.toLowerCase().includes(q)
    );
  }, [festivals, query]);

  if (!commandPaletteOpen) return null;

  const go = (path: string) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Command & Search"
    >
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any event, festival, or organizer tool..."
            className="w-full text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {filteredEvents.length > 0 && (
            <div>
              <p className="px-2.5 pb-1.5 text-xs font-semibold text-zinc-400">
                Events
              </p>
              <div className="space-y-0.5">
                {filteredEvents.map((ev) => {
                  const avail = getEventAvailability(ev);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => go(`/events/${ev.slug}`)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-zinc-100 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-blue-700">
                          {ev.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {ev.category} · {ev.date} · {ev.venue}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-zinc-500">
                        <span>
                          {avail.registeredCount}/{avail.capacity}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredFestivals.length > 0 && (
            <div>
              <p className="px-2.5 pb-1.5 text-xs font-semibold text-zinc-400">
                Festivals
              </p>
              <div className="space-y-0.5">
                {filteredFestivals.map((fest) => (
                  <button
                    key={fest.id}
                    type="button"
                    onClick={() => go(`/fests/${fest.slug}`)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-zinc-100 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {fest.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {fest.startDate} to {fest.endDate} · {fest.location}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="px-2.5 pb-1.5 text-xs font-semibold text-zinc-400">
              Quick Navigation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                { label: 'Explore All Events', path: '/fests' },
                { label: 'My Event Registrations', path: '/my-registrations' },
                { label: 'Organizer Dashboard', path: '/admin' },
                { label: 'QR Check-In Mode', path: '/admin/check-in' },
                { label: 'Participant Roster', path: '/admin/participants' },
                { label: 'Organizer Analytics', path: '/admin/analytics' },
              ].map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => go(item.path)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
