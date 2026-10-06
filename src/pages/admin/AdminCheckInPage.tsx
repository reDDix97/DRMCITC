import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  QrCode,
  ScanLine,
  Search,
  ShieldAlert,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { QrCodeSvg } from '../../components/QrCodeSvg';
import { useNexus } from '../../context/NexusContext';
import { ClubEvent, Festival, Registration } from '../../types/nexus';
import { AdminLayout } from './AdminLayout';

export const AdminCheckInPage: React.FC = () => {
  const { verifyQrOrCode, confirmCheckIn, checkIns, registrations, events, currentPath } = useNexus();

  const [inputCode, setInputCode] = useState('');
  const [activeResult, setActiveResult] = useState<{
    found: boolean;
    registration?: Registration;
    event?: ClubEvent;
    festival?: Festival;
    error?: string;
  } | null>(null);

  const [checkInStatusMessage, setCheckInStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check URL query param ?code=...
  useEffect(() => {
    const params = new URLSearchParams(currentPath.split('?')[1] || '');
    const codeParam = params.get('code');
    if (codeParam) {
      setInputCode(codeParam);
      handleLookup(codeParam);
    }
  }, [currentPath]);

  const handleLookup = (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) {
      setActiveResult(null);
      setCheckInStatusMessage(null);
      return;
    }

    const result = verifyQrOrCode(trimmed);
    setActiveResult(result);
    setCheckInStatusMessage(null);
  };

  const handleExecuteCheckIn = () => {
    if (!activeResult?.registration) return;
    setIsProcessing(true);

    const res = confirmCheckIn(activeResult.registration.id, 'qr_scan');
    setIsProcessing(false);

    if (res.ok) {
      setCheckInStatusMessage('Participant verified and checked in successfully!');
      // Refresh lookup data
      handleLookup(activeResult.registration.registrationCode);
    } else {
      setCheckInStatusMessage(res.error || 'Failed to check in participant.');
    }
  };

  const handleSimulateScan = () => {
    // Pick an un-checked-in or confirmed registration to simulate camera feed detection
    const candidates = registrations.filter((r) => r.status === 'Confirmed' || r.status === 'Registered');
    const target = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : registrations[0];

    if (target) {
      setInputCode(target.registrationCode);
      handleLookup(target.registrationCode);
    }
  };

  return (
    <AdminLayout
      activeTab="checkin"
      title="Check-In Verification Desk"
      subtitle="Rapid QR code scanning, credential validation, and event day check-in dispatch"
      actionButton={
        <button
          type="button"
          onClick={handleSimulateScan}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>Simulate QR Scan</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scanner Input & Active Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scan / Input Station */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-zinc-900" />
                <h3 className="font-display text-base font-bold text-zinc-950">
                  Scan QR Pass or Enter Pass Code
                </h3>
              </div>
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                Scanner Online
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(inputCode);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Scan QR or enter pass code (e.g. NEX-TC26-9214)..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-300 rounded-xl font-mono uppercase focus:outline-none focus:border-zinc-950"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Verify Pass
              </button>
            </form>

            <p className="text-[11px] text-zinc-500">
              Compatible with 2D barcode scanners, phone camera readers, or manual entry.
            </p>
          </div>

          {/* Verification Result Card */}
          {activeResult && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
              {activeResult.found && activeResult.registration ? (
                <>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl flex items-center justify-between gap-3 ${
                      activeResult.registration.status === 'Checked In'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : activeResult.registration.status === 'Cancelled'
                        ? 'bg-red-50 border border-red-200 text-red-900'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {activeResult.registration.status === 'Checked In' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : activeResult.registration.status === 'Cancelled' ? (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {activeResult.registration.status === 'Checked In'
                            ? 'Already Checked In'
                            : activeResult.registration.status === 'Cancelled'
                            ? 'Invalid Registration (Cancelled)'
                            : 'Valid Pass — Ready For Entry'}
                        </p>
                        <p className="text-xs mt-0.5 opacity-90">
                          {activeResult.registration.status === 'Checked In'
                            ? `Checked in on ${activeResult.registration.checkedInAt ? new Date(activeResult.registration.checkedInAt).toLocaleString() : 'earlier today'}`
                            : activeResult.registration.status === 'Cancelled'
                            ? 'This registration was cancelled and cannot be admitted.'
                            : 'Participant credentials matched and confirmed in festival registry.'}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white/70 rounded-md shadow-2xs">
                      {activeResult.registration.status}
                    </span>
                  </div>

                  {checkInStatusMessage && (
                    <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs font-medium">
                      {checkInStatusMessage}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase font-semibold">Participant</p>
                      <p className="text-base font-bold text-zinc-950 mt-0.5">
                        {activeResult.registration.fullName}
                      </p>
                      <p className="text-xs text-zinc-600">{activeResult.registration.institution}</p>
                      <p className="font-mono text-xs text-zinc-500">
                        {activeResult.registration.studentId} · {activeResult.registration.classYear}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase font-semibold">Event Assignment</p>
                      <p className="text-base font-bold text-zinc-950 mt-0.5">
                        {activeResult.event?.name || 'Assigned Event'}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {activeResult.festival?.name || 'DRMC IT Club'}
                      </p>
                      <p className="font-mono text-xs text-zinc-500">
                        {activeResult.event?.venue} · {activeResult.event?.date}
                      </p>
                    </div>

                    <div className="border-t border-zinc-200/80 pt-3">
                      <p className="text-[11px] text-zinc-500 uppercase font-semibold">Contact</p>
                      <p className="text-xs text-zinc-900 mt-0.5">{activeResult.registration.email}</p>
                      <p className="font-mono text-xs text-zinc-500">{activeResult.registration.phone}</p>
                    </div>

                    <div className="border-t border-zinc-200/80 pt-3">
                      <p className="text-[11px] text-zinc-500 uppercase font-semibold">Pass Code</p>
                      <p className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
                        {activeResult.registration.registrationCode}
                      </p>
                      {activeResult.registration.teamName && (
                        <p className="text-xs text-zinc-600">
                          Team: <strong>{activeResult.registration.teamName}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveResult(null)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    >
                      Clear
                    </button>

                    {activeResult.registration.status !== 'Checked In' && activeResult.registration.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={handleExecuteCheckIn}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isProcessing ? 'Verifying...' : 'Admit & Check In'}</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <XCircle className="w-10 h-10 text-red-500 mx-auto" />
                  <h4 className="font-display text-base font-bold text-zinc-950">
                    No Matching Pass Found
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {activeResult.error || `No registered participant was found for code "${inputCode}". Verify the spelling or scan the QR directly.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Live Check-in Audit Stream */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-600" />
              <h3 className="font-display text-sm font-bold text-zinc-950">Recent Check-In Stream</h3>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {checkIns.length} Total
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {checkIns.map((ci) => {
              const reg = registrations.find((r) => r.id === ci.registrationId);
              const ev = events.find((e) => e.id === ci.eventId);
              const timeStr = new Date(ci.checkedInAt || ci.timestamp || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ci.id}
                  className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs space-y-1 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{reg?.fullName || 'Participant'}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 truncate">{ev?.name || 'Event'}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span className="font-mono">{reg?.registrationCode}</span>
                    <span className="text-emerald-700 font-semibold uppercase">{ci.method}</span>
                  </div>
                </div>
              );
            })}

            {checkIns.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-6">
                No check-ins recorded yet. Use the scanner above to begin event entry.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
