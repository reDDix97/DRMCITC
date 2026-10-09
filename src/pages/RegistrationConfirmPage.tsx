import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Printer,
  QrCode,
} from 'lucide-react';
import { QrCodeSvg } from '../components/QrCodeSvg';
import { useNexus } from '../context/NexusContext';
import { downloadEventIcs } from '../utils/qr';

interface RegistrationConfirmPageProps {
  registrationIdOrCode: string;
}

export const RegistrationConfirmPage: React.FC<RegistrationConfirmPageProps> = ({
  registrationIdOrCode,
}) => {
  const { navigate, registrations, events, festivals, organization } = useNexus();
  const [copied, setCopied] = useState(false);

  const registration = registrations.find(
    (r) =>
      r.registrationCode.toLowerCase() === registrationIdOrCode.toLowerCase() ||
      r.id.toLowerCase() === registrationIdOrCode.toLowerCase()
  );

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-zinc-950">
          Registration pass not found
        </h1>
        <p className="text-sm text-zinc-600">
          We could not find a registration matching code{' '}
          <span className="font-mono font-semibold">{registrationIdOrCode}</span>.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-registrations')}
            className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg cursor-pointer"
          >
            View My Registrations
          </button>
          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 rounded-lg cursor-pointer"
          >
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  const event = events.find((e) => e.id === registration.eventId);
  const festival = festivals.find((f) => f.id === registration.festivalId);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(registration.registrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Top Confirmation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Official Digital Pass Issued</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
            Registration confirmed
          </h1>
          <p className="text-sm text-zinc-600">
            Present this pass at the venue entrance for instant QR check-in.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied {registration.registrationCode}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>{registration.registrationCode}</span>
            </>
          )}
        </button>
      </div>

      {/* PREMIUM DIGITAL EVENT PASS */}
      <section
        aria-label="Digital Event Pass"
        className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="bg-zinc-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-display font-bold text-white tracking-tight">NEXUS</span>
              <span aria-hidden="true">·</span>
              <span>{organization.name}</span>
              <span aria-hidden="true">·</span>
              <span>Official Entry Credential</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {event?.name || 'Registered Event'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              {festival?.name || 'Club Festival'} · {event?.category || 'Competition'}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] text-zinc-400">Registration ID</p>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              {registration.registrationCode}
            </p>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              Status: {registration.status}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-zinc-500">Participant Name</p>
                <p className="text-base font-bold text-zinc-950 mt-0.5">
                  {registration.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Student ID</p>
                <p className="font-mono text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                  {registration.studentId}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Institution & Class</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-800 mt-0.5">
                  {registration.institution} · {registration.classYear}
                </p>
              </div>
              {registration.teamName && (
                <div>
                  <p className="text-xs text-zinc-500">Squad / Team</p>
                  <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                    {registration.teamName}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Date</p>
                <p className="font-mono text-sm font-semibold text-zinc-950 tabular-nums mt-0.5">
                  {event?.date || 'TBA'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Time</p>
                <p className="font-mono text-sm font-semibold text-zinc-950 tabular-nums mt-0.5">
                  {event ? `${event.startTime} – ${event.endTime}` : 'TBA'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Venue</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-950 mt-0.5">
                  {event?.venue || 'DRMC Campus'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <span>Email: {registration.email}</span>
              <span className="font-mono tabular-nums">
                Issued {new Date(registration.registeredAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs">
              <QrCodeSvg payload={registration.qrPayload} size={172} />
            </div>
            <div className="text-center">
              <p className="font-mono text-xs font-bold text-zinc-900 tabular-nums">
                {registration.registrationCode}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Scan at {organization.shortName} Check-In Terminal
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          {event && (
            <button
              type="button"
              onClick={() => downloadEventIcs(event, festival, registration)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Add to calendar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / download pass</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my-registrations')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-zinc-900 hover:text-blue-700 transition-colors cursor-pointer"
        >
          <span>View my registrations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
