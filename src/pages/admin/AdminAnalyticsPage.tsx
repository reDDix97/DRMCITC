import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, BarChart3, Building, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { AdminLayout } from './AdminLayout';

export const AdminAnalyticsPage: React.FC = () => {
  const { festivals, events, registrations, getEventAvailability } = useNexus();

  // Summary Metrics
  const totalSeats = useMemo(() => events.reduce((sum, e) => sum + e.capacity, 0), [events]);
  const confirmedCount = useMemo(
    () => registrations.filter((r) => r.status === 'Confirmed' || r.status === 'Registered').length,
    [registrations]
  );
  const checkedInCount = useMemo(
    () => registrations.filter((r) => r.status === 'Checked In').length,
    [registrations]
  );
  const waitlistCount = useMemo(
    () => registrations.filter((r) => r.status === 'Waitlisted').length,
    [registrations]
  );

  const overallSeatYield = totalSeats > 0 ? Math.round(((confirmedCount + checkedInCount) / totalSeats) * 100) : 0;
  const attendanceConversion = (confirmedCount + checkedInCount) > 0
    ? Math.round((checkedInCount / (confirmedCount + checkedInCount)) * 100)
    : 0;

  // Event Capacity vs Registrations Data
  const eventComparisonData = useMemo(() => {
    return events.slice(0, 8).map((ev) => {
      const avail = getEventAvailability(ev);
      return {
        name: ev.name.length > 20 ? ev.name.slice(0, 18) + '...' : ev.name,
        capacity: ev.capacity,
        registered: avail.registeredCount,
        checkedIn: avail.checkedInCount,
      };
    });
  }, [events, getEventAvailability]);

  // Registrations by Category Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      const ev = events.find((e) => e.id === r.eventId);
      if (ev) {
        counts[ev.category] = (counts[ev.category] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([cat, count]) => ({
      category: cat,
      participants: count,
    }));
  }, [registrations, events]);

  // Institutional Distribution Data
  const institutionData = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      const inst = r.institution || 'Unknown';
      counts[inst] = (counts[inst] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / Math.max(1, registrations.length)) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [registrations]);

  return (
    <AdminLayout
      activeTab="analytics"
      title="Club Intelligence & Metrics"
      subtitle="Capacity yield, participant turnout rates, category popularity, and institutional distribution"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Seat Yield</span>
              <TrendingUp className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {overallSeatYield}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {confirmedCount + checkedInCount} filled of {totalSeats} seats
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Check-In Conversion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-emerald-700 mt-2">
              {attendanceConversion}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {checkedInCount} verified check-ins recorded
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Waitlisted Seats</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-amber-700 mt-2">
              {waitlistCount}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Pending vacancy re-allocation</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Competitions</span>
              <Award className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="font-mono text-3xl font-bold text-zinc-950 mt-2">
              {events.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Across {festivals.length} tech festivals</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Event Capacity vs Registrations */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-zinc-950">
                Capacity vs Actual Registrations
              </h3>
              <p className="text-xs text-zinc-500">Comparison of allocated seats vs participant signups</p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tickLine={false}
                  />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="capacity" fill="#e4e4e7" name="Capacity" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="registered" fill="#2563eb" name="Registered" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="checkedIn" fill="#10b981" name="Checked In" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Registrations by Category */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-zinc-950">
                Participation by Event Category
              </h3>
              <p className="text-xs text-zinc-500">Student interest breakdown across disciplines</p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#18181b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      color: '#fafafa',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="participants" fill="#18181b" radius={[0, 4, 4, 0]} name="Participants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Institutional Distribution Table */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-zinc-700" />
              <div>
                <h3 className="font-display text-base font-bold text-zinc-950">
                  Institutional Participation Breakdown
                </h3>
                <p className="text-xs text-zinc-500">Participating colleges, schools, and academic institutions</p>
              </div>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              {institutionData.length} Institutions Represented
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="pb-3 font-semibold">Institution Name</th>
                  <th className="pb-3 font-semibold">Registered Delegates</th>
                  <th className="pb-3 font-semibold">Share of Total</th>
                  <th className="pb-3 font-semibold text-right">Representation Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {institutionData.map((inst, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="py-3 font-semibold text-zinc-900">{inst.name}</td>
                    <td className="py-3 font-mono text-zinc-700 font-bold">{inst.count}</td>
                    <td className="py-3 font-mono text-zinc-600">{inst.percent}%</td>
                    <td className="py-3 text-right">
                      <div className="w-36 ml-auto h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, inst.percent * 1.5)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
