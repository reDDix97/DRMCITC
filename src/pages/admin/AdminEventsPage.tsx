import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, ExternalLink, Plus, Search, Trash2, Users } from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { ClubEvent, EventCategory, EventStatus } from '../../types/nexus';
import { AdminLayout } from './AdminLayout';

const CATEGORIES: EventCategory[] = [
  'Competition',
  'Hackathon',
  'Workshop',
  'Robotics',
  'Gaming',
  'Quiz',
];

export const AdminEventsPage: React.FC = () => {
  const {
    festivals,
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventAvailability,
    navigate,
    currentPath,
  } = useNexus();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [festivalFilter, setFestivalFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [festivalId, setFestivalId] = useState(festivals[0]?.id || '');
  const [category, setCategory] = useState<EventCategory>('Competition');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [venue, setVenue] = useState('Main Lab 1');
  const [capacity, setCapacity] = useState(60);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-10-13T23:59:59Z');
  const [status, setStatus] = useState<EventStatus>('Open');
  const [teamSize, setTeamSize] = useState('Individual');
  const [eligibility, setEligibility] = useState('Open to all registered high school and college students');
  const [rulesText, setRulesText] = useState(
    'Valid institution ID card required.\nBring personal laptop with development tools pre-installed.\nPlagiarism or unauthorized external communication results in immediate disqualification.'
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const festMatch = currentPath.match(/festivalId=([^&]+)/);
    const targetFestId = festMatch ? festMatch[1] : null;

    if (targetFestId) {
      setFestivalFilter(targetFestId);
    }

    if (currentPath.includes('action=new')) {
      handleOpenCreate(targetFestId || undefined);
    }
  }, [currentPath]);

  const handleOpenCreate = (preselectedFestivalId?: string) => {
    const festId = typeof preselectedFestivalId === 'string' ? preselectedFestivalId : undefined;
    setEditingId(null);
    setName('');
    setSlug('');
    setFestivalId(festId || (festivalFilter !== 'ALL' ? festivalFilter : festivals[0]?.id || ''));
    setCategory('Competition');
    setDescription('');
    setDate('2026-10-15');
    setStartTime('10:00 AM');
    setEndTime('01:00 PM');
    setVenue('Room 302, Science Complex');
    setCapacity(50);
    setRegistrationDeadline('2026-10-13T23:59:59Z');
    setStatus('Open');
    setTeamSize('Individual');
    setEligibility('Open to high school students');
    setRulesText(
      'Valid student ID is required at the entry check-in station.\nStandard academic integrity rules apply.\nArrival 15 minutes before scheduled start time.'
    );
    setFormError(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (ev: ClubEvent) => {
    setEditingId(ev.id);
    setName(ev.name);
    setSlug(ev.slug);
    setFestivalId(ev.festivalId);
    setCategory(ev.category);
    setDescription(ev.description);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setVenue(ev.venue);
    setCapacity(ev.capacity);
    setRegistrationDeadline(ev.registrationDeadline);
    setStatus(ev.status);
    setTeamSize(ev.teamSize || 'Individual');
    setEligibility(ev.eligibility || 'Open to all students');
    setRulesText(ev.rules.join('\n'));
    setFormError(null);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Event name is required');
      return;
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanSlug) {
      setFormError('Valid URL slug is required');
      return;
    }
    if (!festivalId) {
      setFormError('Please select a parent festival');
      return;
    }

    const rulesArray = rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingId) {
      const res = updateEvent(editingId, {
        name,
        slug: cleanSlug,
        festivalId,
        category,
        description,
        date,
        startTime,
        endTime,
        venue,
        capacity: Number(capacity),
        registrationDeadline,
        status,
        teamSize,
        eligibility,
        rules: rulesArray.length > 0 ? rulesArray : ['Standard competition rules apply.'],
      });
      if (!res.ok) {
        setFormError(res.error || 'Failed to update event');
        return;
      }
    } else {
      const res = createEvent({
        name,
        slug: cleanSlug,
        festivalId,
        category,
        shortSummary: description.slice(0, 140) || name,
        description,
        date,
        startTime,
        endTime,
        venue,
        capacity: Number(capacity),
        registrationDeadline,
        status,
        teamSize,
        eligibility,
        rules: rulesArray.length > 0 ? rulesArray : ['Standard competition rules apply.'],
        prizes: 'Certificates of Excellence · Official NEXUS Crest',
        organizerContact: 'events@drmcitclub.org',
        featured: false,
      });
      if (!res.ok) {
        setFormError(res.error || 'Failed to create event');
        return;
      }
    }

    setIsEditing(false);
  };

  const handleDelete = (id: string, _evName: string) => {
    deleteEvent(id);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchQuery =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFest = festivalFilter === 'ALL' || e.festivalId === festivalFilter;
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      return matchQuery && matchFest && matchCat;
    });
  }, [events, searchQuery, festivalFilter, categoryFilter]);

  return (
    <AdminLayout
      activeTab="events"
      title="Event Directory & Rules"
      subtitle="Manage event definitions, capacities, schedules, and eligibility requirements"
      actionButton={
        <button
          type="button"
          onClick={() => handleOpenCreate()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      }
    >
      {isEditing ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950">
                {editingId ? 'Edit Event Details' : 'Create New Event'}
              </h2>
              <p className="text-xs text-zinc-500">Configure schedule, seats, and rules</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. National Cyber Siege Hackathon"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. cyber-siege-hackathon"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Parent Festival *
                </label>
                <select
                  value={festivalId}
                  onChange={(e) => setFestivalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                >
                  {festivals.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.year || f.startDate.slice(0, 4)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of the competition or session..."
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="01:00 PM"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Science Complex Lab 4"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Seat Capacity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                >
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Registration Deadline (ISO or YYYY-MM-DDTHH:mm:ssZ)
                </label>
                <input
                  type="text"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Format / Team Size
                </label>
                <input
                  type="text"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="Individual / Team of 3"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Eligibility</label>
              <input
                type="text"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. Class IX–XII Students"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Rules & Code of Conduct (one per line)
              </label>
              <textarea
                rows={4}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
              />
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-zinc-200 rounded-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name or venue..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={festivalFilter}
                onChange={(e) => setFestivalFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="ALL">All Festivals</option>
                {festivals.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="py-3 px-4">Event & Festival</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Check-ins</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEvents.map((ev) => {
                    const fest = festivals.find((f) => f.id === ev.festivalId);
                    const avail = getEventAvailability(ev);
                    return (
                      <tr key={ev.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-950 text-sm">{ev.name}</p>
                          <p className="text-zinc-500 text-[11px]">{fest?.name || '—'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded">
                            {ev.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-mono text-zinc-800">{ev.date}</p>
                          <p className="font-mono text-zinc-500 text-[11px]">
                            {ev.startTime}–{ev.endTime}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                              avail.effectiveStatus === 'Open'
                                ? 'bg-emerald-100 text-emerald-800'
                                : avail.effectiveStatus === 'Full'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {avail.effectiveStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between font-mono text-[10px] text-zinc-600">
                              <span>{avail.registeredCount} / {avail.capacity}</span>
                              <span>{avail.percentFilled}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  avail.percentFilled >= 100
                                    ? 'bg-red-500'
                                    : avail.percentFilled >= 80
                                    ? 'bg-amber-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, avail.percentFilled)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {avail.checkedInCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/participants?eventId=${ev.id}`)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                              title="View registered participants"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/events/${ev.slug}`)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                              title="Public Event Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ev)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                              title="Edit Event"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(ev.id, ev.name)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500">
                        No events match your current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
