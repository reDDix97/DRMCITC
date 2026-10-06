import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Download } from 'lucide-react';
import { REFERENCE_NOW, useNexus } from '../context/NexusContext';
import { downloadEventIcs } from '../utils/qr';

interface EventDetailPageProps {
  slug: string;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ slug }) => {
  const {
    navigate,
    getEventBySlug,
    festivals,
    registrations,
    currentUser,
    getEventAvailability,
    getScheduleConflicts,
  } = useNexus();

  const event = getEventBySlug(slug);
  const festival = useMemo(
    () => (event ? festivals.find((f) => f.id === event.festivalId) : undefined),
    [event, festivals]
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!event) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-zinc-950">Event not found</h1>
        <p className="text-sm text-zinc-600">
          The event you requested does not exist or may have been removed.
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

  const avail = getEventAvailability(event);
  const conflicts = getScheduleConflicts(event);

  const existingUserReg = currentUser
    ? registrations.find(
        (r) =>
          r.eventId === event.id &&
          r.status !== 'Cancelled' &&
          (r.email.toLowerCase() === currentUser.email.toLowerCase() ||
            r.studentId.toUpperCase() === currentUser.studentId.toUpperCase())
      )
    : undefined;

  const deadlineMs = new Date(event.registrationDeadline).getTime();
  const currentSimulatedMs = REFERENCE_NOW.getTime() + elapsedSeconds * 1000;
  const diffMs = Math.max(0, deadlineMs - currentSimulatedMs);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const formatDateLong = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDeadlineFull = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor =
    avail.effectiveStatus === 'Open'
      ? 'text-emerald-700'
      : avail.effectiveStatus === 'Closing Soon'
      ? 'text-amber-700'
      : 'text-red-700';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <button
          type="button"
          onClick={() => navigate('/fests')}
          className="inline-flex items-center gap-1 font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Events</span>
        </button>
        {festival && (
          <>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => navigate(`/fests/${festival.slug}`)}
              className="hover:text-zinc-950 cursor-pointer"
            >
              {festival.name}
            </button>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-zinc-900 font-medium truncate">{event.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Detailed Event Information */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-900">{event.category}</span>
                {festival && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/fests/${festival.slug}`)}
                      className="text-blue-700 hover:underline font-medium cursor-pointer"
                    >
                      {festival.name}
                    </button>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className={`font-semibold ${statusColor}`}>
                  {avail.effectiveStatus}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
                {event.name}
              </h1>

              <p className="text-base text-zinc-600 leading-relaxed">
                {event.shortSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
              <div>
                <p className="text-xs text-zinc-500">Date</p>
                <p className="text-sm font-semibold text-zinc-950 mt-0.5">
                  {formatDateLong(event.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Time</p>
                <p className="font-mono text-sm font-semibold text-zinc-950 tabular-nums mt-0.5">
                  {event.startTime} – {event.endTime} (BST)
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Venue</p>
                <p className="text-sm font-semibold text-zinc-950 mt-0.5">
                  {event.venue}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Participation Format</p>
                <p className="text-sm font-semibold text-zinc-950 mt-0.5">
                  {event.teamSize || 'Individual Participation'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950">
                About This Event
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {event.prizes && (
              <div className="pt-6 border-t border-zinc-100">
                <h3 className="text-xs font-semibold text-zinc-500">
                  Awards & Recognition
                </h3>
                <p className="text-sm font-semibold text-zinc-950 mt-1">
                  {event.prizes}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-zinc-100">
              <h2 className="font-display text-xl font-bold text-zinc-950 mb-4">
                Rules & Eligibility
              </h2>
              <ol className="space-y-3">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700">
                    <span className="font-mono text-xs font-semibold text-zinc-400 tabular-nums mt-0.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">Organized by</p>
                <p className="text-sm font-semibold text-zinc-950 mt-0.5">
                  {festival?.organizerName || 'DRMC IT Club'} · Inquiries:{' '}
                  <a
                    href={`mailto:${event.organizerContact}`}
                    className="text-blue-700 hover:underline"
                  >
                    {event.organizerContact}
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadEventIcs(event, festival)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Calendar (.ics)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Registration & Live Capacity Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-500">Registration Status</span>
              <span className={`text-xs font-bold ${statusColor}`}>
                {avail.effectiveStatus}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-zinc-950 tabular-nums">
                  {avail.registeredCount} / {avail.capacity}{' '}
                  <span className="text-sm font-normal font-sans text-zinc-500">registered</span>
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-700 tabular-nums">
                  {avail.percentFilled}% filled
                </span>
              </div>

              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    avail.isFull
                      ? 'bg-red-600'
                      : avail.percentFilled >= 80
                      ? 'bg-amber-600'
                      : 'bg-blue-700'
                  }`}
                  style={{ width: `${avail.percentFilled}%` }}
                />
              </div>

              <p className="text-xs font-medium text-zinc-600">
                {avail.isFull ? (
                  <span className="text-red-700 font-semibold">0 seats remaining — Event is full</span>
                ) : (
                  <span>
                    <strong className="font-mono text-zinc-950 tabular-nums">
                      {avail.remainingSeats}
                    </strong>{' '}
                    seats remaining
                  </span>
                )}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <div>
                <p className="text-xs text-zinc-500">Registration Deadline</p>
                <p className="font-mono text-xs font-semibold text-zinc-900 tabular-nums mt-0.5">
                  {formatDeadlineFull(event.registrationDeadline)}
                </p>
              </div>

              {!avail.isDeadlinePassed && avail.canRegister && (
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3">
                  <p className="text-[11px] font-medium text-zinc-500 mb-2">
                    Time remaining until registration closes
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
                    <div>
                      <p className="text-lg font-bold text-zinc-950">
                        {String(days).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] font-sans text-zinc-500">Days</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-950">
                        {String(hours).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] font-sans text-zinc-500">Hours</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-950">
                        {String(minutes).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] font-sans text-zinc-500">Min</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-700">
                        {String(seconds).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] font-sans text-zinc-500">Sec</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {conflicts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Schedule Overlap Detected</p>
                <p>
                  This event overlaps with your registration for{' '}
                  <strong>{conflicts.map((c) => c.name).join(', ')}</strong> on {event.date}.
                </p>
              </div>
            )}

            {existingUserReg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
                <p className="font-semibold">
                  You are registered ({existingUserReg.registrationCode})
                </p>
                <p className="text-emerald-800">
                  Status: <strong>{existingUserReg.status}</strong>. You can view your digital QR
                  pass or register another participant below.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/registration/${existingUserReg.registrationCode}`)
                  }
                  className="w-full py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  View Digital Event Pass
                </button>
              </div>
            )}

            <div className="pt-2">
              {avail.isDeadlinePassed || event.status === 'Closed' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-5 text-sm font-semibold text-zinc-500 bg-zinc-200 rounded-xl cursor-not-allowed"
                >
                  Registration closed
                </button>
              ) : avail.isFull || event.status === 'Full' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-5 text-sm font-semibold text-zinc-500 bg-zinc-200 rounded-xl cursor-not-allowed"
                >
                  Event full
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/register/${event.id}`)}
                  className="w-full py-3.5 px-5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Register now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              Instant QR pass generated upon confirmation · Free for verified students
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>Save event schedule</span>
            </div>
            <button
              type="button"
              onClick={() => downloadEventIcs(event, festival)}
              className="font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
