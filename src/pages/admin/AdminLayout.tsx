import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Plus,
  QrCode,
  Settings,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'overview' | 'fests' | 'events' | 'participants' | 'checkin' | 'analytics' | 'settings';
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  title,
  subtitle,
  actionButton,
}) => {
  const { currentPath, navigate, currentUser, switchDemoRole } = useNexus();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isOrganizer = currentUser?.role === 'organizer';

  const navItems = [
    { key: 'overview', label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { key: 'fests', label: 'Festivals', path: '/admin/fests', icon: CalendarRange },
    { key: 'events', label: 'Events', path: '/admin/events', icon: FolderKanban },
    { key: 'participants', label: 'Participants', path: '/admin/participants', icon: Users },
    { key: 'checkin', label: 'Check-In Scanner', path: '/admin/checkin', icon: QrCode },
    { key: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Top Banner if not organizer */}
      {!isOrganizer && (
        <div className="bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-inner no-print">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-950 shrink-0" />
            <span>
              You are currently viewing as a <strong>Participant</strong> ({currentUser?.fullName || 'Guest'}).
              Organizer permissions are required to edit festivals and events.
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchDemoRole('organizer')}
            className="px-2.5 py-1 text-xs font-bold bg-zinc-950 text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            Switch to Demo Organizer
          </button>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-4 sm:px-6 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle admin menu"
            className="md:hidden p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg cursor-pointer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="font-display font-bold text-base tracking-tight text-zinc-950 flex items-center gap-2"
          >
            <span>NEXUS</span>
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
              Ops Desk
            </span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 border-r border-zinc-200 pr-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-zinc-900">{currentUser?.fullName || 'DRMC IT Executive'}</span>
            <span className="font-mono text-[11px] text-zinc-500">({currentUser?.role || 'Guest'})</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-zinc-200 bg-white p-4 shrink-0 no-print">
          <div className="mb-4 px-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
              Management Suite
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-200 space-y-2">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <p className="font-mono text-[10px] text-zinc-600 uppercase font-semibold">Club Org</p>
              <p className="text-xs font-bold text-zinc-900">DRMC IT Club</p>
              <p className="text-[11px] text-zinc-600">Season 2026/2027</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs md:hidden">
            <div className="w-64 max-w-[80vw] h-full bg-white p-4 space-y-2 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="font-display font-bold text-sm text-zinc-950">Organizer Desk</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-950 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Title & Actions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                {title}
              </h1>
              {subtitle && <p className="text-xs sm:text-sm text-zinc-600 mt-1">{subtitle}</p>}
            </div>

            {actionButton && <div className="shrink-0">{actionButton}</div>}
          </div>

          {/* Children content */}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};
