import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Plus,
  Tag,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { FestivalImageEditor } from '../../components/FestivalImageEditor';
import { ResilientImage } from '../../components/QrCodeSvg';
import { useNexus } from '../../context/NexusContext';
import { SEED_ORGANIZATION } from '../../data/seed';
import {
  ClubEvent,
  EventCategory,
  EventStatus,
  Festival,
  FestivalStatus,
} from '../../types/nexus';
import { BANNER_PRESETS } from '../../utils/imagePresets';
import { AdminLayout } from './AdminLayout';

const CATEGORIES: EventCategory[] = [
  'Competition',
  'Hackathon',
  'Workshop',
  'Robotics',
  'Gaming',
  'Quiz',
];

interface DraftEventItem {
  draftId: string;
  name: string;
  slug: string;
  category: EventCategory;
  shortSummary: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  registrationDeadline: string;
  status: EventStatus;
  teamSize: string;
  eligibility: string;
  rules: string[];
  prizes: string;
  organizerContact: string;
  featured: boolean;
}

export const AdminFestsPage: React.FC = () => {
  const {
    festivals,
    events,
    createFestival,
    updateFestival,
    deleteFestival,
    createEvent,
    updateEvent,
    deleteEvent,
    navigate,
    currentPath,
  } = useNexus();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick image editor modal state
  const [quickImageFest, setQuickImageFest] = useState<Festival | null>(null);
  const [quickCoverImage, setQuickCoverImage] = useState<string>('');
  const [quickThumbnailImage, setQuickThumbnailImage] = useState<string | undefined>(undefined);
  const [quickImageSaved, setQuickImageSaved] = useState(false);

  // Full form state for Festival
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(2026);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-17');
  const [venue, setVenue] = useState('DRMC Main Auditorium & Science Complex');
  const [status, setStatus] = useState<FestivalStatus>('Active');
  const [coverImage, setCoverImage] = useState(BANNER_PRESETS[0].dataUrl);
  const [thumbnailImage, setThumbnailImage] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  // Draft events when creating a new festival
  const [draftEvents, setDraftEvents] = useState<DraftEventItem[]>([]);

  // Event modal state (for adding/editing events inside festival)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null); // existing event id or draftId
  const [isDraftEditing, setIsDraftEditing] = useState(false);

  // Event form fields inside modal
  const [evName, setEvName] = useState('');
  const [evSlug, setEvSlug] = useState('');
  const [evCategory, setEvCategory] = useState<EventCategory>('Competition');
  const [evShortSummary, setEvShortSummary] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evDate, setEvDate] = useState('2026-10-15');
  const [evStartTime, setEvStartTime] = useState('10:00 AM');
  const [evEndTime, setEvEndTime] = useState('01:00 PM');
  const [evVenue, setEvVenue] = useState('Main Lab 1');
  const [evCapacity, setEvCapacity] = useState(50);
  const [evRegistrationDeadline, setEvRegistrationDeadline] = useState('2026-10-13T23:59:59Z');
  const [evStatus, setEvStatus] = useState<EventStatus>('Open');
  const [evTeamSize, setEvTeamSize] = useState('Individual');
  const [evEligibility, setEvEligibility] = useState('Open to all registered high school and college students');
  const [evRulesText, setEvRulesText] = useState(
    'Valid institution ID card required.\nBring personal laptop with development tools pre-installed.\nAcademic integrity strictly monitored.'
  );
  const [evPrizes, setEvPrizes] = useState('Certificates of Excellence · Champion Trophy');
  const [evOrganizerContact, setEvOrganizerContact] = useState('events@drmcitclub.org');
  const [evFeatured, setEvFeatured] = useState(false);
  const [evModalError, setEvModalError] = useState<string | null>(null);
  const [eventFeedback, setEventFeedback] = useState<string | null>(null);

  // Parse deep link query actions
  useEffect(() => {
    if (currentPath.includes('action=new')) {
      handleOpenCreate();
    } else if (currentPath.includes('edit=')) {
      const match = currentPath.match(/edit=([^&]+)/);
      if (match && match[1]) {
        const fest = festivals.find((f) => f.id === match[1] || f.slug === match[1]);
        if (fest) {
          handleOpenEdit(fest);
          if (currentPath.includes('action=add-event')) {
            setTimeout(() => {
              handleOpenAddEvent(fest);
            }, 100);
          }
        }
      }
    }
  }, [currentPath, festivals]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setTagline('');
    setDescription('');
    setYear(2026);
    setStartDate('2026-11-01');
    setEndDate('2026-11-03');
    setVenue('DRMC Main Auditorium');
    setStatus('Active');
    setCoverImage(BANNER_PRESETS[0].dataUrl);
    setThumbnailImage(undefined);
    setFormError(null);
    setDraftEvents([]);
    setIsEditing(true);
  };

  const handleOpenEdit = (fest: Festival) => {
    setEditingId(fest.id);
    setName(fest.name);
    setSlug(fest.slug);
    setTagline(fest.tagline);
    setDescription(fest.description);
    setYear(fest.year || Number(fest.startDate.slice(0, 4)) || 2026);
    setStartDate(fest.startDate);
    setEndDate(fest.endDate);
    setVenue(fest.location || fest.venue || 'DRMC Main Campus');
    setStatus(fest.status);
    setCoverImage(fest.coverImage || BANNER_PRESETS[0].dataUrl);
    setThumbnailImage(fest.thumbnailImage);
    setFormError(null);
    setDraftEvents([]);
    setIsEditing(true);
  };

  // Open the Add Event modal inside this festival
  const handleOpenAddEvent = (targetFest?: Festival) => {
    const currentFestStartDate = targetFest?.startDate || startDate || '2026-10-15';
    const currentFestVenue = targetFest?.location || targetFest?.venue || venue || 'Main Campus';

    setEditingEventId(null);
    setIsDraftEditing(false);
    setEvName('');
    setEvSlug('');
    setEvCategory('Competition');
    setEvShortSummary('');
    setEvDescription('');
    setEvDate(currentFestStartDate);
    setEvStartTime('10:00 AM');
    setEvEndTime('01:00 PM');
    setEvVenue(currentFestVenue);
    setEvCapacity(50);
    setEvRegistrationDeadline(`${currentFestStartDate}T23:59:59Z`);
    setEvStatus('Open');
    setEvTeamSize('Individual');
    setEvEligibility('Open to all registered high school and college students');
    setEvRulesText(
      'Valid institution ID card required.\nBring personal laptop with development tools pre-installed.\nAcademic integrity strictly monitored.'
    );
    setEvPrizes('Certificates of Excellence · Champion Trophy');
    setEvOrganizerContact('events@drmcitclub.org');
    setEvFeatured(false);
    setEvModalError(null);
    setIsEventModalOpen(true);
  };

  // Edit an existing event inside the festival
  const handleOpenEditExistingEvent = (ev: ClubEvent) => {
    setEditingEventId(ev.id);
    setIsDraftEditing(false);
    setEvName(ev.name);
    setEvSlug(ev.slug);
    setEvCategory(ev.category);
    setEvShortSummary(ev.shortSummary);
    setEvDescription(ev.description);
    setEvDate(ev.date);
    setEvStartTime(ev.startTime);
    setEvEndTime(ev.endTime);
    setEvVenue(ev.venue);
    setEvCapacity(ev.capacity);
    setEvRegistrationDeadline(ev.registrationDeadline);
    setEvStatus(ev.status);
    setEvTeamSize(ev.teamSize || 'Individual');
    setEvEligibility(ev.eligibility || 'Open to all students');
    setEvRulesText(ev.rules.join('\n'));
    setEvPrizes(ev.prizes || 'Certificates of Excellence · Champion Trophy');
    setEvOrganizerContact(ev.organizerContact || 'events@drmcitclub.org');
    setEvFeatured(Boolean(ev.featured));
    setEvModalError(null);
    setIsEventModalOpen(true);
  };

  // Edit a draft event created while making a new festival
  const handleOpenEditDraftEvent = (draft: DraftEventItem) => {
    setEditingEventId(draft.draftId);
    setIsDraftEditing(true);
    setEvName(draft.name);
    setEvSlug(draft.slug);
    setEvCategory(draft.category);
    setEvShortSummary(draft.shortSummary);
    setEvDescription(draft.description);
    setEvDate(draft.date);
    setEvStartTime(draft.startTime);
    setEvEndTime(draft.endTime);
    setEvVenue(draft.venue);
    setEvCapacity(draft.capacity);
    setEvRegistrationDeadline(draft.registrationDeadline);
    setEvStatus(draft.status);
    setEvTeamSize(draft.teamSize);
    setEvEligibility(draft.eligibility);
    setEvRulesText(draft.rules.join('\n'));
    setEvPrizes(draft.prizes);
    setEvOrganizerContact(draft.organizerContact);
    setEvFeatured(draft.featured);
    setEvModalError(null);
    setIsEventModalOpen(true);
  };

  // Save event modal (handles both Edit Mode and Create Mode)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setEvModalError(null);

    if (!evName.trim()) {
      setEvModalError('Event name is required');
      return;
    }

    const cleanSlug = evSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') ||
      evName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!cleanSlug) {
      setEvModalError('Valid event slug is required');
      return;
    }

    const rulesArray = evRulesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const eventPayload = {
      name: evName.trim(),
      slug: cleanSlug,
      category: evCategory,
      shortSummary: evShortSummary.trim() || evDescription.slice(0, 140) || evName.trim(),
      description: evDescription.trim() || evName.trim(),
      date: evDate,
      startTime: evStartTime,
      endTime: evEndTime,
      venue: evVenue.trim() || 'DRMC Main Campus',
      capacity: Number(evCapacity) || 50,
      registrationDeadline: evRegistrationDeadline,
      status: evStatus,
      teamSize: evTeamSize,
      eligibility: evEligibility,
      rules: rulesArray.length > 0 ? rulesArray : ['Standard competition rules apply.'],
      prizes: evPrizes,
      organizerContact: evOrganizerContact,
      featured: evFeatured,
    };

    if (editingId) {
      // We are editing an existing festival
      if (editingEventId && !isDraftEditing) {
        // Update existing event
        const res = updateEvent(editingEventId, {
          ...eventPayload,
          festivalId: editingId,
        });
        if (!res.ok) {
          setEvModalError(res.error || 'Failed to update event');
          return;
        }
        setEventFeedback(`Event "${eventPayload.name}" updated successfully.`);
      } else {
        // Create new event inside this festival
        const res = createEvent({
          ...eventPayload,
          festivalId: editingId,
        });
        if (!res.ok) {
          setEvModalError(res.error || 'Failed to create event');
          return;
        }
        setEventFeedback(`Event "${eventPayload.name}" added to festival.`);
      }
    } else {
      // We are creating a new festival: manage draft events
      if (editingEventId && isDraftEditing) {
        setDraftEvents((prev) =>
          prev.map((d) =>
            d.draftId === editingEventId
              ? { ...eventPayload, draftId: editingEventId }
              : d
          )
        );
        setEventFeedback(`Draft event "${eventPayload.name}" updated.`);
      } else {
        const newDraftItem: DraftEventItem = {
          ...eventPayload,
          draftId: `draft-evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };
        setDraftEvents((prev) => [...prev, newDraftItem]);
        setEventFeedback(`Event "${eventPayload.name}" added to draft list.`);
      }
    }

    setTimeout(() => setEventFeedback(null), 4000);
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string, eventName: string) => {
    if (window.confirm(`Are you sure you want to delete event "${eventName}" from this festival?`)) {
      deleteEvent(id);
      setEventFeedback(`Event "${eventName}" deleted.`);
      setTimeout(() => setEventFeedback(null), 3000);
    }
  };

  const handleRemoveDraftEvent = (draftId: string) => {
    setDraftEvents((prev) => prev.filter((d) => d.draftId !== draftId));
  };

  // Main Festival Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Festival name is required');
      return;
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanSlug) {
      setFormError('Valid URL slug is required');
      return;
    }

    if (editingId) {
      const res = updateFestival(editingId, {
        name,
        slug: cleanSlug,
        tagline,
        description,
        year: Number(year),
        startDate,
        endDate,
        location: venue,
        venue,
        status,
        coverImage,
        thumbnailImage,
      });
      if (!res.ok) {
        setFormError(res.error || 'Failed to update festival');
        return;
      }
    } else {
      const res = createFestival({
        name,
        slug: cleanSlug,
        tagline,
        description,
        year: Number(year),
        startDate,
        endDate,
        location: venue,
        venue,
        organizerName: SEED_ORGANIZATION.name,
        status,
        coverImage,
        thumbnailImage,
        featured: false,
      });
      if (!res.ok || !res.festival) {
        setFormError(res.error || 'Failed to create festival');
        return;
      }

      // If draft events were added during festival creation, create them now with festivalId
      if (draftEvents.length > 0 && res.festival) {
        for (const draft of draftEvents) {
          const { draftId: _, ...eventData } = draft;
          createEvent({
            ...eventData,
            festivalId: res.festival.id,
          });
        }
      }
    }

    setIsEditing(false);
    setDraftEvents([]);
  };

  const handleDelete = (id: string, festName: string) => {
    if (window.confirm(`Are you sure you want to delete "${festName}"?`)) {
      const res = deleteFestival(id);
      if (!res.ok) {
        alert(res.error || 'Cannot delete festival with active events.');
      }
    }
  };

  // Quick image manager modal handlers
  const handleOpenQuickImageModal = (fest: Festival) => {
    setQuickImageFest(fest);
    setQuickCoverImage(fest.coverImage);
    setQuickThumbnailImage(fest.thumbnailImage);
    setQuickImageSaved(false);
  };

  const handleSaveQuickImages = () => {
    if (!quickImageFest) return;
    updateFestival(quickImageFest.id, {
      coverImage: quickCoverImage,
      thumbnailImage: quickThumbnailImage,
    });
    setQuickImageSaved(true);
    setTimeout(() => {
      setQuickImageFest(null);
      setQuickImageSaved(false);
    }, 800);
  };

  // Existing events for current edited festival
  const currentFestivalEvents = editingId
    ? events.filter((e) => e.festivalId === editingId)
    : [];

  return (
    <AdminLayout
      activeTab="fests"
      title="Festival Management"
      subtitle="Create, brand, configure, and monitor flagship club tech carnivals and symposia"
      actionButton={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Festival</span>
        </button>
      }
    >
      {/* Toast Feedback */}
      {eventFeedback && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{eventFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setEventFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-8 max-w-4xl shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl font-bold text-zinc-950">
                  {editingId ? 'Edit Festival' : 'New Festival'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure public festival details, branding images, and events
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDraftEvents([]);
              }}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Festival Name *
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
                  placeholder="e.g. National Tech Carnival 2026"
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
                  placeholder="e.g. tech-carnival-2026"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. The Premier Interschool Technology Symposium"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Festival overview, themes, and collegiate participation scope..."
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* DEDICATED BANNER & THUMBNAIL IMAGE MANAGER */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-900">
                Festival Branding Images (Banner & Thumbnail)
              </label>
              <FestivalImageEditor
                coverImage={coverImage}
                thumbnailImage={thumbnailImage}
                festivalName={name || 'New Festival'}
                onChange={({ coverImage: newCover, thumbnailImage: newThumb }) => {
                  setCoverImage(newCover);
                  setThumbnailImage(newThumb);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Campus Venue"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FestivalStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Concluded">Concluded</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* ========================================================= */}
            {/* EVENTS INSIDE THIS FESTIVAL SECTION (EDIT & CREATE MODES) */}
            {/* ========================================================= */}
            <div className="pt-6 border-t border-zinc-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-zinc-950">
                      Events inside this Festival
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">
                      {editingId ? currentFestivalEvents.length : draftEvents.length} {
                        (editingId ? currentFestivalEvents.length : draftEvents.length) === 1
                          ? 'Event'
                          : 'Events'
                      }
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    {editingId
                      ? 'Add, edit, and organize competitions, hackathons, or workshops in this festival'
                      : 'Add events now — they will be created and linked automatically when you save this festival'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddEvent()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event to Festival</span>
                </button>
              </div>

              {/* In Edit Festival mode: Show existing events */}
              {editingId && (
                <div>
                  {currentFestivalEvents.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                      <p className="text-sm font-semibold text-zinc-800">No events in this festival yet</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Add events like programming contests, gaming tournaments, or robotics challenges to this festival.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddEvent()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Event</span>
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      {currentFestivalEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-sm text-zinc-950 truncate">
                                {ev.name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                                {ev.category}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                  ev.status === 'Open'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ev.status === 'Draft'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-zinc-100 text-zinc-700'
                                }`}
                              >
                                {ev.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="font-mono tabular-nums">{ev.date}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{ev.startTime} - {ev.endTime}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="truncate max-w-[160px]">{ev.venue}</span>
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Users className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Cap: {ev.capacity}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditExistingEvent(ev)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer transition-colors"
                              title="Edit event details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/events/${ev.slug}`)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
                              title="View event in public portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id, ev.name)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete event from festival"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* In Create Festival mode: Show draft events queued for creation */}
              {!editingId && (
                <div>
                  {draftEvents.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                      <p className="text-sm font-semibold text-zinc-800">No events drafted yet</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        You can add events now! They will be created and assigned to this festival when you click "Create Festival".
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddEvent()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Event to this Festival</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Queued events to be created with this festival:</span>
                      </p>
                      <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        {draftEvents.map((draft, idx) => (
                          <div
                            key={draft.draftId}
                            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-blue-700 font-bold">
                                  #{idx + 1}
                                </span>
                                <span className="font-semibold text-sm text-zinc-950 truncate">
                                  {draft.name}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                                  {draft.category}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800">
                                  {draft.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                  <span className="font-mono tabular-nums">{draft.date}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>{draft.startTime} - {draft.endTime}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                  <span className="truncate max-w-[160px]">{draft.venue}</span>
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Cap: {draft.capacity}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenEditDraftEvent(draft)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftEvent(draft.draftId)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Remove draft event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-zinc-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDraftEvents([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {editingId
                  ? 'Save Festival Changes'
                  : draftEvents.length > 0
                  ? `Create Festival & ${draftEvents.length} Events`
                  : 'Create Festival'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* FESTIVALS LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((fest) => {
            const festEvents = events.filter((e) => e.festivalId === fest.id);
            const hasCustomThumbnail =
              Boolean(fest.thumbnailImage) && fest.thumbnailImage !== fest.coverImage;

            return (
              <div
                key={fest.id}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Festival Banner Showcase */}
                  <div className="relative h-48 bg-zinc-900 group">
                    <ResilientImage
                      src={fest.coverImage}
                      alt={fest.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    {/* Top Status & Emblem badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {hasCustomThumbnail && (
                        <div
                          className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/90 shadow-md bg-zinc-950 shrink-0"
                          title="Custom Festival Thumbnail Emblem"
                        >
                          <ResilientImage
                            src={fest.thumbnailImage!}
                            alt="Emblem"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <span
                        className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-xs ml-auto ${
                          fest.status === 'Active'
                            ? 'bg-emerald-500 text-white'
                            : fest.status === 'Upcoming'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        {fest.status}
                      </span>
                    </div>

                    {/* Bottom Title on Banner */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-mono text-xs text-zinc-300">
                        {fest.year || fest.startDate.slice(0, 4)}
                      </p>
                      <h3 className="font-display text-lg font-bold text-white leading-snug">
                        {fest.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-600 line-clamp-2">{fest.tagline}</p>

                    <div className="space-y-1.5 text-xs text-zinc-500 border-t border-zinc-100 pt-3">
                      <div className="flex justify-between">
                        <span>Dates:</span>
                        <span className="font-mono text-zinc-700 font-medium">
                          {fest.startDate} to {fest.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Events:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-900 font-bold">
                            {festEvents.length} events
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEdit(fest);
                              setTimeout(() => handleOpenAddEvent(fest), 100);
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                            title="Add event directly to this festival"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="text-zinc-700 truncate max-w-[180px]">
                          {fest.location || fest.venue}
                        </span>
                      </div>

                      {/* Event Chips Preview */}
                      {festEvents.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100">
                          <p className="text-[11px] font-semibold text-zinc-700 mb-1">
                            Included Events:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {festEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-700 truncate max-w-[160px]"
                              >
                                {e.name}
                              </span>
                            ))}
                            {festEvents.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-500 font-mono">
                                +{festEvents.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickImageModal(fest)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                      title="Quickly change banner or thumbnail image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Banner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/fests/${fest.slug}`)}
                      className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 rounded cursor-pointer transition-colors"
                      title="Public Festival View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(fest)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 rounded-md cursor-pointer transition-colors"
                      title="Edit festival details and events"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit & Events</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(fest.id, fest.name)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition-colors"
                      title="Delete festival"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT EVENT MODAL (INSIDE FESTIVAL CONTEXT)          */}
      {/* ========================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-zinc-950">
                  {editingEventId
                    ? 'Edit Event'
                    : editingId
                    ? `Add Event to "${name || 'Festival'}"`
                    : 'Add Event to New Festival'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {editingId
                    ? `Linked to festival: ${name}`
                    : 'This event will be added to this festival upon creation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evModalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{evModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={evName}
                    onChange={(e) => {
                      setEvName(e.target.value);
                      if (!editingEventId) {
                        setEvSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. National Cyber Hackathon"
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
                    value={evSlug}
                    onChange={(e) => setEvSlug(e.target.value)}
                    placeholder="e.g. national-cyber-hackathon"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Category *
                  </label>
                  <select
                    value={evCategory}
                    onChange={(e) => setEvCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Status *
                  </label>
                  <select
                    value={evStatus}
                    onChange={(e) => setEvStatus(e.target.value as EventStatus)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  >
                    <option value="Open">Open (Registration Active)</option>
                    <option value="Draft">Draft</option>
                    <option value="Closing Soon">Closing Soon</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={evStartTime}
                    onChange={(e) => setEvStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={evEndTime}
                    onChange={(e) => setEvEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={evVenue}
                    onChange={(e) => setEvVenue(e.target.value)}
                    placeholder="Main Lab 1 / Auditorium"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Max Capacity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={evCapacity}
                    onChange={(e) => setEvCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Team Format
                  </label>
                  <select
                    value={evTeamSize}
                    onChange={(e) => setEvTeamSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Team of 2">Team of 2</option>
                    <option value="Team of 2–3">Team of 2–3</option>
                    <option value="Team of 2–4">Team of 2–4</option>
                    <option value="Team of 3–5">Team of 3–5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={evShortSummary}
                  onChange={(e) => setEvShortSummary(e.target.value)}
                  placeholder="One sentence summary of the challenge..."
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  value={evDescription}
                  onChange={(e) => setEvDescription(e.target.value)}
                  placeholder="Detailed guidelines, problem statement scope, and judging criteria..."
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Prizes & Honors
                </label>
                <input
                  type="text"
                  value={evPrizes}
                  onChange={(e) => setEvPrizes(e.target.value)}
                  placeholder="Certificates of Excellence · Champion Trophy · BDT 15,000 Pool"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Rules (one per line)
                </label>
                <textarea
                  rows={3}
                  value={evRulesText}
                  onChange={(e) => setEvRulesText(e.target.value)}
                  placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-zinc-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEventId ? 'Save Event Changes' : 'Add Event to Festival'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK BANNER & THUMBNAIL MODAL */}
      {quickImageFest && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-display text-base font-bold text-zinc-950">
                  Update Images — {quickImageFest.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Select a new banner or thumbnail from presets, file upload, or web link
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickImageFest(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickImageSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Images updated successfully!</span>
              </div>
            )}

            <FestivalImageEditor
              coverImage={quickCoverImage}
              thumbnailImage={quickThumbnailImage}
              festivalName={quickImageFest.name}
              onChange={({ coverImage: c, thumbnailImage: t }) => {
                setQuickCoverImage(c);
                setQuickThumbnailImage(t);
              }}
            />

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuickImageFest(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickImages}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save Festival Images</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
