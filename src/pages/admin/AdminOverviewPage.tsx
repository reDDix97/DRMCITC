import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Plus,
  QrCode,
  Users,
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { AdminLayout } from './AdminLayout';

export const AdminOverviewPage: React.FC = () => {
  const { festivals, events, registrations, checkIns, navigate, getEventAvailability } = useNexus();

  const activeFestivals = useMemo(
    () => festivals.filter((f) => f.status === 'Active' || f.status === 'Upcoming'),
    [festivals]
  );

  const publishedEvents = useMemo(
    () => events.filter((e) => e.status !== 'Draft' && e.status !== 'Archived'),
    [events]
  );

  const validRegistrations = useMemo(
    () =>
      registrations.filter(
        (r) => r.status === 'Registered' || r.status === 'Confirmed' || r.status === 'Checked In'
      ),
    [registrations]
  );

  const checkedInCount = useMemo(
    () => registrations.filter((r) => r.status === 'Checked In').length,
    [registrations]
  );

  const totalCapacity = useMemo(
    () => publishedEvents.reduce((sum, e) => sum + e.capacity, 0),
    [publishedEvents]
  );

  const overallFillPercent = totalCapacity > 0
    ? Math.round((validRegistrations.length / totalCapacity) * 100)
    : 0;

  const checkInPercent = validRegistrations.length > 0
    ? Math.round((checkedInCount / validRegistrations.length) * 100)
    : 0;

  // Timeline / Daily registration mock activity
  const activityData = useMemo(() => {
    const dates = ['Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04', 'Oct 05'];
    const counts = [4, 7, 6, 12, 18, 22, 29, 36];
    return dates.map((date, i) => ({
      date,
      registrations: counts[i] || 0,
      checkIns: i >= 5 ? (i - 4) * 3 : 0,
    }));
  }, []);

  return (
    <AdminLayout
      activeTab="overview"
      title="Club Operations Overview"
      subtitle="Real-time festival metrics, capacity tracking, and participant check-in flow"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/checkin')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Check-In Desk</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/events?action=new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Festivals</span>
              <Calendar className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {festivals.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              <strong className="text-emerald-700 font-semibold">{activeFestivals.length} active</strong> in cycle
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Events</span>
              <FolderKanban className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {events.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalCapacity} total seat capacity
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
              <Users className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {validRegistrations.length}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
              <span>{overallFillPercent}% seat fill rate</span>
              <span className="font-mono text-[11px] text-zinc-600">({registrations.length} total)</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Checked In</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-emerald-700 mt-2">
              {checkedInCount}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {checkInPercent}% of confirmed participants
            </p>
          </div>
        </div>

        {/* Chart & Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-zinc-950">Registration Activity</h3>
                <p className="text-xs text-zinc-500">Cumulative participant sign-ups leading to Tech Carnival 2026</p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md font-medium">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      color: '#fafafa',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#regGrad)"
                    name="Registrations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Operations panel */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-zinc-950">Operations Shortcuts</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Rapid dispatch tools for club executives</p>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/admin/participants')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Manage Roster</p>
                    <p className="text-[11px] text-zinc-500">Filter, edit status, or export CSV</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/fests?action=new')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Add New Festival</p>
                    <p className="text-[11px] text-zinc-500">Launch a new tech carnival or hackathon</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Executive Report</p>
                    <p className="text-[11px] text-zinc-500">Department breakdowns & seat yield</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-bold text-blue-900">Desk Status: Online</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                QR scanner and live participant lookup are ready for event day check-in.
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Utilization Monitor */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-zinc-950">
                Live Event Capacity Monitor
              </h3>
              <p className="text-xs text-zinc-500">
                Tracking seat allocations, waitlists, and closed deadlines
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer self-start sm:self-auto"
            >
              Manage all {events.length} events →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Festival</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Capacity</th>
                  <th className="pb-3 font-semibold">Checked In</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {events.map((ev) => {
                  const fest = festivals.find((f) => f.id === ev.festivalId);
                  const avail = getEventAvailability(ev);
                  return (
                    <tr key={ev.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-zinc-950">
                        <div className="flex items-center gap-2">
                          <span>{ev.name}</span>
                          {avail.isFull && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-red-100 text-red-700 rounded font-bold">
                              FULL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">{fest?.name || '—'}</td>
                      <td className="py-3 pr-4 font-mono text-zinc-600">{ev.date}</td>
                      <td className="py-3 pr-4">
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
                      <td className="py-3 pr-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between font-mono text-[10px] text-zinc-600">
                            <span>{avail.registeredCount} / {avail.capacity}</span>
                            <span>{avail.percentFilled}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
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
                      <td className="py-3 pr-4 font-mono text-zinc-800 font-semibold">
                        {avail.checkedInCount}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/participants?eventId=${ev.id}`)}
                          className="px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 rounded cursor-pointer transition-colors"
                        >
                          Roster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
