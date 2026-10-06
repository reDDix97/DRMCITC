import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { ResilientImage } from '../../components/QrCodeSvg';
import { useNexus } from '../../context/NexusContext';
import { SEED_ORGANIZATION } from '../../data/seed';
import { Festival, FestivalStatus } from '../../types/nexus';
import { AdminLayout } from './AdminLayout';

export const AdminFestsPage: React.FC = () => {
  const { festivals, events, createFestival, updateFestival, deleteFestival, navigate, currentPath } =
    useNexus();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(2026);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-17');
  const [venue, setVenue] = useState('DRMC Main Auditorium & Science Complex');
  const [status, setStatus] = useState<FestivalStatus>('Active');
  const [coverImage, setCoverImage] = useState('/src/assets/images/fest_tech_carnival_1791225914054.jpg');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (currentPath.includes('action=new')) {
      handleOpenCreate();
    }
  }, [currentPath]);

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
    setCoverImage('/src/assets/images/fest_tech_carnival_1791225914054.jpg');
    setFormError(null);
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
    setCoverImage(fest.coverImage);
    setFormError(null);
    setIsEditing(true);
  };

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
        organizerName: 'DRMC IT Club',
        status,
        coverImage,
        featured: false,
      });
      if (!res.ok) {
        setFormError(res.error || 'Failed to create festival');
        return;
      }
    }

    setIsEditing(false);
  };

  const handleDelete = (id: string, _festName: string) => {
    deleteFestival(id);
  };

  return (
    <AdminLayout
      activeTab="fests"
      title="Festival Management"
      subtitle="Create, configure, and monitor flagship club tech carnivals and symposia"
      actionButton={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Festival</span>
        </button>
      }
    >
      {isEditing ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950">
                {editingId ? 'Edit Festival' : 'New Festival'}
              </h2>
              <p className="text-xs text-zinc-500">Configure public listing details and dates</p>
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
                placeholder="Festival overview and mission..."
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                {editingId ? 'Save Changes' : 'Create Festival'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((fest) => {
            const festEvents = events.filter((e) => e.festivalId === fest.id);
            return (
              <div
                key={fest.id}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-zinc-900">
                    <ResilientImage
                      src={fest.coverImage}
                      alt={fest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <span
                      className={`absolute top-3 right-3 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-xs ${
                        fest.status === 'Active'
                          ? 'bg-emerald-500 text-white'
                          : fest.status === 'Upcoming'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {fest.status}
                    </span>
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
                      <div className="flex justify-between">
                        <span>Events:</span>
                        <span className="font-mono text-zinc-700 font-bold">
                          {festEvents.length} events
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="text-zinc-700 truncate max-w-[180px]">
                          {fest.location || fest.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/fests/${fest.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(fest)}
                      className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 rounded cursor-pointer transition-colors"
                      title="Edit festival"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
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
    </AdminLayout>
  );
};
