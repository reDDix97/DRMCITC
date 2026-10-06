import React, { useMemo, useState } from 'react';
import { Download, QrCode, RotateCcw, Search, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useNexus, VALID_STATUS_TRANSITIONS } from '../../context/NexusContext';
import { RegistrationStatus } from '../../types/nexus';
import { exportRegistrationsCsv } from '../../utils/qr';
import { AdminLayout } from './AdminLayout';

export const AdminParticipantsPage: React.FC = () => {
  const {
    registrations,
    events,
    festivals,
    updateRegistrationStatus,
    confirmCheckIn,
    navigate,
    currentPath,
  } = useNexus();

  // URL query params initialization (e.g. ?eventId=...)
  const queryEventId = useMemo(() => {
    const params = new URLSearchParams(currentPath.split('?')[1] || '');
    return params.get('eventId') || 'ALL';
  }, [currentPath]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFestival, setSelectedFestival] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(queryEventId);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const eventsMap = useMemo(() => {
    const map: Record<string, (typeof events)[0]> = {};
    events.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [events]);

  const festivalsMap = useMemo(() => {
    const map: Record<string, (typeof festivals)[0]> = {};
    festivals.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [festivals]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.registrationCode.toLowerCase().includes(q) ||
        (r.teamName && r.teamName.toLowerCase().includes(q));

      const matchFest = selectedFestival === 'ALL' || r.festivalId === selectedFestival;
      const matchEvent = selectedEvent === 'ALL' || r.eventId === selectedEvent;
      const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchQuery && matchFest && matchEvent && matchStatus;
    });
  }, [registrations, searchQuery, selectedFestival, selectedEvent, selectedStatus]);

  const handleStatusChange = (registrationId: string, currentStatus: RegistrationStatus, newStatus: RegistrationStatus) => {
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      setStatusFeedback(`Cannot transition status from "${currentStatus}" to "${newStatus}". Allowed: ${allowed?.join(', ')}`);
      setTimeout(() => setStatusFeedback(null), 4000);
      return;
    }

    const res = updateRegistrationStatus(registrationId, newStatus);
    if (!res.ok) {
      setStatusFeedback(res.error || 'Failed to update status');
      setTimeout(() => setStatusFeedback(null), 4000);
    } else {
      setStatusFeedback(`Status updated to ${newStatus}`);
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  const handleQuickCheckIn = (registrationId: string) => {
    const res = confirmCheckIn(registrationId, 'manual_code');
    if (!res.ok) {
      setStatusFeedback(res.error || 'Check-in failed');
      setTimeout(() => setStatusFeedback(null), 4000);
    } else {
      setStatusFeedback('Participant checked in successfully!');
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  const handleExport = () => {
    exportRegistrationsCsv(filteredRegistrations, eventsMap, festivalsMap);
  };

  return (
    <AdminLayout
      activeTab="participants"
      title="Participant Management & Roster"
      subtitle="Search, filter, update registration status, and export participant directories"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Export CSV ({filteredRegistrations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/checkin')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Check-In Desk</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toast / Feedback Banner */}
        {statusFeedback && (
          <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs flex items-center justify-between shadow-md">
            <span>{statusFeedback}</span>
            <button
              type="button"
              onClick={() => setStatusFeedback(null)}
              className="text-zinc-400 hover:text-white cursor-pointer ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name, email, student ID, or pass code (e.g. NEX-)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Filter Festival
              </label>
              <select
                value={selectedFestival}
                onChange={(e) => setSelectedFestival(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="ALL">All Festivals</option>
                {festivals.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Filter Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="ALL">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Filter Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="ALL">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked In">Checked In</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>
            Showing <strong className="text-zinc-950 font-bold">{filteredRegistrations.length}</strong> participants
          </span>
          {(searchQuery || selectedFestival !== 'ALL' || selectedEvent !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFestival('ALL');
                setSelectedEvent('ALL');
                setSelectedStatus('ALL');
              }}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Participants Table */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                  <th className="py-3 px-4">Participant Details</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Registered Event</th>
                  <th className="py-3 px-4">Pass Code</th>
                  <th className="py-3 px-4">Status & Transition</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRegistrations.map((reg) => {
                  const ev = eventsMap[reg.eventId];
                  const fest = festivalsMap[reg.festivalId];
                  const allowedTransitions = VALID_STATUS_TRANSITIONS[reg.status] || [];

                  return (
                    <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-950">{reg.fullName}</p>
                        <p className="text-[11px] text-zinc-500">{reg.institution}</p>
                        <p className="font-mono text-[10px] text-zinc-400">
                          {reg.studentId} · {reg.classYear}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-zinc-900">{reg.email}</p>
                        <p className="font-mono text-[11px] text-zinc-500">{reg.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900">{ev?.name || reg.eventId}</p>
                        <p className="text-[11px] text-zinc-500">{fest?.name || '—'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
                            {reg.registrationCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/registration/${reg.registrationCode}`)}
                            className="p-1 text-zinc-500 hover:text-zinc-950 rounded cursor-pointer"
                            title="View Participant Pass"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              reg.status === 'Checked In'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.status === 'Confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : reg.status === 'Waitlisted'
                                ? 'bg-amber-100 text-amber-800'
                                : reg.status === 'Cancelled'
                                ? 'bg-zinc-200 text-zinc-600 line-through'
                                : 'bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            {reg.status}
                          </span>

                          {allowedTransitions.length > 0 && (
                            <select
                              value={reg.status}
                              onChange={(e) =>
                                handleStatusChange(reg.id, reg.status, e.target.value as RegistrationStatus)
                              }
                              className="block text-[11px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-700 cursor-pointer"
                            >
                              <option value={reg.status} disabled>
                                Change status...
                              </option>
                              {allowedTransitions.map((next) => (
                                <option key={next} value={next}>
                                  → {next}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {reg.status !== 'Checked In' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickCheckIn(reg.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Check-In</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-emerald-600 font-semibold">
                            ✓ {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      No registrations found matching the specified search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
