import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  Eye,
  EyeOff,
  FolderKanban,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  QrCode,
  Settings,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
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
  const { currentPath, navigate, currentUser, logout, login, signInWithGoogle, users } = useNexus();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Inline login state for the access gate if not authenticated
  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const organizerUser = users.find((u) => u.role === 'organizer');
  const organizerEmail = organizerUser?.email || 'organizer@drmcitclub.org';
  const organizerPassword = organizerUser?.password || 'NexusAdmin2026!';

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

  const handleGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const res = login(gateEmail, gatePassword);
    if (!res.ok) {
      setGateError(res.error || 'Authentication failed.');
      return;
    }
    if (res.user?.role !== 'organizer') {
      setGateError('The provided account does not have organizer clearance.');
    }
  };

  // STRICT ACCESS CONTROL GATE: If not logged in as organizer, DO NOT show organizer workspace
  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col justify-between font-sans">
        <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="font-display font-bold text-lg text-white"
          >
            NEXUS
          </a>
          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portal</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                Organizer Clearance Required
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                The NEXUS Operations Desk is strictly restricted to authenticated DRMC IT Club
                organizers. Participants are not authorized to view operations or rosters.
              </p>
            </div>

            {currentUser ? (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Currently logged in as Participant:</span>
                </div>
                <div className="text-xs text-zinc-300">
                  <p className="font-bold text-white">{currentUser.fullName}</p>
                  <p className="text-zinc-400">{currentUser.email}</p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    Role: {currentUser.role} (Restricted)
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out & Enter Organizer Credentials</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/my-registrations')}
                    className="w-full py-2 px-4 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    View My Event Passes
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/fests')}
                    className="w-full py-2 px-4 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Return to Public Portal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGateLogin} className="space-y-4">
                {/* Organizer Credentials Box - Only for test purpose */}
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 space-y-2.5 text-left">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-200">
                        Organizer Credentials
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      only for test purpose
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900/90 border border-amber-500/20 rounded p-2">
                      <span className="block text-[10px] text-zinc-400 font-medium">Organizer Email</span>
                      <code className="text-xs text-amber-200 select-all font-mono break-all">{organizerEmail}</code>
                    </div>
                    <div className="bg-zinc-900/90 border border-amber-500/20 rounded p-2">
                      <span className="block text-[10px] text-zinc-400 font-medium">Organizer Password</span>
                      <code className="text-xs text-amber-200 select-all font-mono">{organizerPassword}</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setGateEmail(organizerEmail);
                      setGatePassword(organizerPassword);
                      setGateError(null);
                    }}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Auto-fill Organizer Credentials</span>
                  </button>
                </div>

                {gateError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 font-medium">
                    {gateError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Organizer Email or Account ID
                  </label>
                  <input
                    type="text"
                    required
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    placeholder="Enter your email address or account ID"
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Organizer Password
                  </label>
                  <div className="relative">
                    <input
                      type={showGatePassword ? 'text' : 'password'}
                      required
                      value={gatePassword}
                      onChange={(e) => setGatePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 pr-10 text-sm bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGatePassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer focus:outline-none"
                      aria-label={showGatePassword ? 'Hide password' : 'Show password'}
                      title={showGatePassword ? 'Hide password' : 'Show password'}
                    >
                      {showGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                >
                  Unlock Organizer Workspace
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-zinc-950 px-2 text-zinc-400">Or unlock with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setGateError(null);
                    const res = await signInWithGoogle();
                    if (!res.ok) {
                      setGateError(res.error || 'Google Sign-In failed');
                    }
                  }}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/fests')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Cancel and return to public site
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        <footer className="h-12 border-t border-zinc-800 px-6 flex items-center justify-center text-xs text-zinc-600">
          NEXUS Smart Club Operations · Role-Based Access Control Enforced
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
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
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200 font-bold">
              Organizer Workspace
            </span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 border-r border-zinc-200 pr-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-zinc-900">
              {currentUser?.fullName || 'Organizer'}
            </span>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">(Executive)</span>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Log out of organizer account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

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
              Organizer Suite
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
