import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  QrCode,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { QrCodeSvg } from '../components/QrCodeSvg';
import { useNexus } from '../context/NexusContext';
import { Registration } from '../types/nexus';
import { downloadEventIcs } from '../utils/qr';

export const MyRegistrationsPage: React.FC = () => {
  const {
    navigate,
    currentUser,
    registrations,
    events,
    festivals,
    updateRegistrationStatus,
    updateRegistrationDetails,
  } = useNexus();

  const [lookupQuery, setLookupQuery] = useState('');
  const [showAllDemoMode, setShowAllDemoMode] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);
  const [managingReg, setManagingReg] = useState<Registration | null>(null);

  const [editPhone, setEditPhone] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [manageFeedback, setManageFeedback] = useState<string | null>(null);

  const eventsMap = useMemo(() => {
    const m: Record<string, typeof events[0]> = {};
    events.forEach((e) => (m[e.id] = e));
    return m;
  }, [events]);

  const festivalsMap = useMemo(() => {
    const m: Record<string, typeof festivals[0]> = {};
    festivals.forEach((f) => (m[f.id] = f));
    return m;
  }, [festivals]);

  const displayedRegistrations = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    return registrations.filter((r) => {
      if (q) {
        return (
          r.registrationCode.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q)
        );
      }
      if (showAllDemoMode) return true;
      if (!currentUser) return false;
      return (
        r.userId === currentUser.id ||
        r.email.toLowerCase() === currentUser.email.toLowerCase() ||
        r.studentId.toUpperCase() === currentUser.studentId.toUpperCase()
      );
    });
  }, [registrations, currentUser, lookupQuery, showAllDemoMode]);

  const openManageModal = (reg: Registration) => {
    setManagingReg(reg);
    setEditPhone(reg.phone);
    setEditTeam(reg.teamName || '');
    setManageFeedback(null);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingReg) return;
    updateRegistrationDetails(managingReg.id, {
      phone: editPhone.trim(),
      teamName: editTeam.trim() || undefined,
    });
    setManageFeedback('Registration details updated.');
    setTimeout(() => {
      setManagingReg(null);
    }, 700);
  };

  const handleCancelRegistration = (reg: Registration) => {
    const res = updateRegistrationStatus(reg.id, 'Cancelled');
    if (res.ok) {
      setManagingReg(null);
    } else {
      setManageFeedback(res.error || 'Could not cancel registration.');
    }
  };

  const handleRestoreRegistration = (reg: Registration) => {
    const res = updateRegistrationStatus(reg.id, 'Confirmed');
    if (res.ok) {
      setManagingReg(null);
    } else {
      setManageFeedback(res.error || 'Could not restore registration.');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Participant Portal</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser ? currentUser.email : 'Pass Lookup'}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
            My Registrations
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl">
            Access your digital QR event passes, add events to your calendar, or manage your
            registration status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAllDemoMode((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showAllDemoMode
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {showAllDemoMode
              ? 'Showing All Recent Passes'
              : `My Passes Only (${currentUser?.fullName.split(' ')[0] || 'Guest'})`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Register for More Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="Lookup any registration by Pass ID (e.g. NEX-TC26-1042), Email, or Student ID..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>
        <span className="font-mono text-xs text-zinc-500 tabular-nums shrink-0">
          {displayedRegistrations.length}{' '}
          {displayedRegistrations.length === 1 ? 'registration' : 'registrations'}
        </span>
      </div>

      {displayedRegistrations.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <h2 className="font-display text-xl font-bold text-zinc-950">
            No registrations found
          </h2>
          <p className="text-sm text-zinc-600">
            {lookupQuery
              ? `No pass matched "${lookupQuery}". Try searching by your email or Pass ID.`
              : 'You have not registered for any events yet. Browse upcoming festivals to claim your seat.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {lookupQuery && (
              <button
                type="button"
                onClick={() => setLookupQuery('')}
                className="px-4 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 rounded-lg cursor-pointer"
              >
                Clear search
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/fests')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              Explore Events
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedRegistrations.map((reg) => {
            const ev = eventsMap[reg.eventId];
            const fest = festivalsMap[reg.festivalId];

            const statusColor =
              reg.status === 'Checked In' || reg.status === 'Confirmed'
                ? 'text-emerald-700'
                : reg.status === 'Registered'
                ? 'text-blue-700'
                : reg.status === 'Waitlisted'
                ? 'text-amber-700'
                : 'text-red-700';

            return (
              <article
                key={reg.id}
                className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                      <span className="font-mono font-semibold text-zinc-900">
                        {reg.registrationCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${statusColor}`}>
                        {reg.status}
                      </span>
                      {fest && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{fest.name}</span>
                        </>
                      )}
                    </div>

                    <h2
                      onClick={() => ev && navigate(`/events/${ev.slug}`)}
                      className="font-display text-xl font-bold text-zinc-950 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {ev?.name || 'Club Event'}
                    </h2>

                    <div className="space-y-1 text-xs text-zinc-600 pt-1">
                      <p>
                        <span className="text-zinc-400">Participant:</span>{' '}
                        <strong className="text-zinc-900">{reg.fullName}</strong> ({reg.studentId})
                      </p>
                      <p className="font-mono tabular-nums">
                        <span className="font-sans text-zinc-400">Schedule:</span>{' '}
                        {ev ? `${ev.date} · ${ev.startTime}–${ev.endTime}` : 'TBA'}
                      </p>
                      <p>
                        <span className="text-zinc-400">Venue:</span>{' '}
                        {ev?.venue || 'DRMC Campus'}
                      </p>
                      <p className="font-mono tabular-nums text-[11px] text-zinc-400">
                        Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                        {reg.checkedInAt &&
                          ` · Checked in ${new Date(reg.checkedInAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPass(reg)}
                    title="Enlarge QR Pass"
                    className="p-2.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-xl flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                  >
                    <QrCodeSvg payload={reg.qrPayload} size={92} />
                    <span className="text-[10px] font-mono text-zinc-500">Tap to enlarge</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/registration/${reg.registrationCode}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Open Pass</span>
                    </button>

                    {ev && (
                      <button
                        type="button"
                        onClick={() => downloadEventIcs(ev, fest, reg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openManageModal(reg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedPass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 space-y-5 text-center relative shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
              aria-label="Close QR dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-500">NEXUS Event Check-In QR</p>
              <h3 className="font-display text-lg font-bold text-zinc-950">
                {eventsMap[selectedPass.eventId]?.name}
              </h3>
              <p className="text-xs text-zinc-600">{selectedPass.fullName}</p>
            </div>

            <div className="flex justify-center p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <QrCodeSvg payload={selectedPass.qrPayload} size={210} />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-sm font-bold text-zinc-950">
                {selectedPass.registrationCode}
              </p>
              <p className="text-xs text-zinc-500">Status: {selectedPass.status}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const code = selectedPass.registrationCode;
                  setSelectedPass(null);
                  navigate(`/registration/${code}`);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-zinc-950 rounded-lg cursor-pointer"
              >
                Full Printable Pass
              </button>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {managingReg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-zinc-500">
                  {managingReg.registrationCode}
                </p>
                <h3 className="font-display text-xl font-bold text-zinc-950 mt-0.5">
                  Manage Registration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManagingReg(null)}
                className="p-1 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manageFeedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
                {manageFeedback}
              </div>
            )}

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Participant
                </label>
                <input
                  type="text"
                  disabled
                  value={`${managingReg.fullName} (${managingReg.studentId})`}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Team / Squad Name
                </label>
                <input
                  type="text"
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value)}
                  placeholder="Individual"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="text-xs text-zinc-600">
                Current Status: <strong className="text-zinc-900">{managingReg.status}</strong>
              </div>
              {managingReg.status !== 'Cancelled' && managingReg.status !== 'Checked In' ? (
                <button
                  type="button"
                  onClick={() => handleCancelRegistration(managingReg)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel Registration
                </button>
              ) : managingReg.status === 'Cancelled' ? (
                <button
                  type="button"
                  onClick={() => handleRestoreRegistration(managingReg)}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  Re-Activate Registration
                </button>
              ) : (
                <span className="text-xs text-emerald-700 font-semibold">
                  Verified Onsite Check-In
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
