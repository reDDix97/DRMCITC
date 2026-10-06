import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

interface RegisterEventPageProps {
  eventIdOrSlug: string;
}

export const RegisterEventPage: React.FC<RegisterEventPageProps> = ({ eventIdOrSlug }) => {
  const {
    navigate,
    getEventBySlug,
    festivals,
    currentUser,
    getEventAvailability,
    getScheduleConflicts,
    submitRegistration,
  } = useNexus();

  const event = getEventBySlug(eventIdOrSlug);
  const festival = event ? festivals.find((f) => f.id === event.festivalId) : undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [institution, setInstitution] = useState(
    currentUser?.institution || 'Dhaka Residential Model College'
  );
  const [classYear, setClassYear] = useState(
    currentUser?.department || 'Class XII · Science'
  );
  const [teamName, setTeamName] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-zinc-950">Event not found</h1>
        <p className="text-sm text-zinc-600">
          Unable to load registration form because the specified event does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/fests')}
          className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg cursor-pointer"
        >
          Browse Events
        </button>
      </div>
    );
  }

  const avail = getEventAvailability(event);
  const conflicts = getScheduleConflicts(event, email);

  const fillNewSampleParticipant = () => {
    const rand = Math.floor(100 + Math.random() * 899);
    setFullName(`Arian Hossain ${rand}`);
    setEmail(`arian.hossain.${rand}@drmc.edu.bd`);
    setPhone(`+880 1719-482${rand}`);
    setStudentId(`DRMC-26-${rand}`);
    setInstitution('Dhaka Residential Model College');
    setClassYear('Class XII · Science (Section B)');
    setTeamName(`Nexus Squad ${rand}`);
    setFieldErrors({});
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!agreedToRules) {
      setFormError('Please confirm that you agree to the event rules and code of conduct.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    setTimeout(() => {
      const result = submitRegistration({
        eventId: event.id,
        fullName,
        email,
        phone,
        studentId,
        institution,
        classYear,
        teamName,
        notes,
      });

      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.error || 'Registration could not be completed.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      if (result.registration) {
        navigate(`/registration/${result.registration.registrationCode}`);
      }
    }, 220);
  };

  if (!avail.canRegister) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/events/${event.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {event.name}</span>
        </button>

        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4">
          <p className="text-xs font-bold text-red-700">{avail.effectiveStatus}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950">
            {avail.isFull ? 'Event has reached full capacity' : 'Registration is closed'}
          </h1>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            {avail.statusReason}. New registrations can no longer be accepted for{' '}
            <strong>{event.name}</strong>.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/events/${event.slug}`)}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
            >
              View Event Details
            </button>
            <button
              type="button"
              onClick={() => navigate('/fests')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              Explore Other Open Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/events/${event.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {event.name}</span>
        </button>
        <span className="font-mono text-xs text-zinc-500 tabular-nums">
          Step {step} of 2
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{festival?.name || 'DRMC IT Club'}</span>
          <span aria-hidden="true">·</span>
          <span>{event.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-emerald-700 font-semibold">
            {avail.remainingSeats} seats remaining
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950">
          Register for {event.name}
        </h1>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
              step === 1
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-700 border-zinc-200'
            }`}
          >
            <p className="font-mono text-[11px] opacity-75">01</p>
            <p className="text-xs font-semibold mt-0.5">Event Summary & Eligibility</p>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
              step === 2
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-700 border-zinc-200'
            }`}
          >
            <p className="font-mono text-[11px] opacity-75">02</p>
            <p className="text-xs font-semibold mt-0.5">Participant Details & Pass</p>
          </button>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl font-bold text-zinc-950">
              01. Review Event Summary
            </h2>
            <p className="text-sm text-zinc-600">
              Confirm event timing, venue location, and participation requirements before entering
              your participant credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl">
            <div>
              <p className="text-xs text-zinc-500">Event</p>
              <p className="text-sm font-bold text-zinc-950 mt-0.5">{event.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Festival</p>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                {festival?.name || 'DRMC IT Club'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Date & Time</p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                {event.date} · {event.startTime}–{event.endTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Venue</p>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">{event.venue}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Current Capacity</p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                {avail.registeredCount} / {avail.capacity} registered ({avail.remainingSeats} left)
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Format</p>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                {event.teamSize || 'Individual'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-zinc-700">
              Mandatory Check-In & Participation Rules
            </h3>
            <ul className="space-y-2">
              {event.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/events/${event.slug}`)}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
            >
              <span>Continue to Participant Info</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950">
                02. Participant Information
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                Your details will be encoded onto your official NEXUS QR pass.
              </p>
            </div>

            <button
              type="button"
              onClick={fillNewSampleParticipant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fill New Test Participant</span>
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 font-medium"
            >
              {formError}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Note:</strong> This event overlaps in time with your existing registration
              for <strong>{conflicts.map((c) => c.name).join(', ')}</strong>.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tahmid Hasan"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none ${
                  fieldErrors.fullName
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@drmc.edu.bd"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none ${
                  fieldErrors.email
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +880 1711-000000"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg font-mono focus:outline-none ${
                  fieldErrors.phone
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-student-id"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Student ID / College Roll <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-student-id"
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. DRMC-26-1042"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg font-mono uppercase focus:outline-none ${
                  fieldErrors.studentId
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.studentId && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.studentId}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-institution"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Institution / College <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-institution"
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Dhaka Residential Model College"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none ${
                  fieldErrors.institution
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.institution && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.institution}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-class"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Class / Year / Department <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-class"
                type="text"
                required
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                placeholder="e.g. Class XII · Science"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none ${
                  fieldErrors.classYear
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-zinc-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.classYear && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.classYear}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-team"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                Team / Squad Name <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="reg-team"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Leave blank if registering as an individual"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-blue-700 focus:ring-blue-600"
              />
              <span>
                I confirm that the academic information provided above is accurate and I agree to
                abide by the {festival?.name || 'DRMC IT Club'} competition rules.
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
            >
              Back to Event Summary
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Generating Pass & Confirming...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
