import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNexus } from '../context/NexusContext';
import { ClubEvent, Festival } from '../types/nexus';

interface EventCardProps {
  event: ClubEvent;
  festival?: Festival;
  showFestivalName?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  festival,
  showFestivalName = true,
}) => {
  const { navigate, getEventAvailability, festivals } = useNexus();
  const resolvedFestival =
    festival || festivals.find((f) => f.id === event.festivalId);
  const avail = getEventAvailability(event);

  const formatDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDeadline = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const statusColorClass =
    avail.effectiveStatus === 'Open'
      ? 'text-emerald-700'
      : avail.effectiveStatus === 'Closing Soon'
      ? 'text-amber-700'
      : 'text-red-700';

  return (
    <article
      onClick={() => navigate(`/events/${event.slug}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/events/${event.slug}`);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`${event.name} — ${avail.effectiveStatus}`}
      className="group bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl p-5 sm:p-6 transition-colors duration-150 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mb-2">
          <span className="font-medium text-zinc-700">{event.category}</span>
          {showFestivalName && resolvedFestival && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[200px]">{resolvedFestival.name}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className={`font-semibold ${statusColorClass}`}>
            {avail.effectiveStatus}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-zinc-950 group-hover:text-blue-700 transition-colors leading-snug">
            {event.name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-700 shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
          {event.shortSummary}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
          <div className="font-mono tabular-nums text-zinc-800">
            {formatDate(event.date)} · {event.startTime}–{event.endTime}
          </div>
          <div className="truncate max-w-[220px] text-zinc-500" title={event.venue}>
            {event.venue}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono tabular-nums text-zinc-700">
              <strong className="font-semibold text-zinc-950">{avail.registeredCount}</strong> /{' '}
              {avail.capacity} registered ·{' '}
              <span className="text-zinc-500">{avail.remainingSeats} seats left</span>
            </span>
            <span className="text-zinc-500 font-mono tabular-nums">
              Due {formatDeadline(event.registrationDeadline)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                avail.isFull
                  ? 'bg-red-600'
                  : avail.percentFilled >= 80
                  ? 'bg-amber-600'
                  : 'bg-zinc-900 group-hover:bg-blue-700'
              }`}
              style={{ width: `${avail.percentFilled}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
