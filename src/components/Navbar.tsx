import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

export const Navbar: React.FC = () => {
  const {
    currentPath,
    navigate,
    currentUser,
    switchDemoRole,
    logout,
    setCommandPaletteOpen,
  } = useNexus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const cleanPath = currentPath.split('?')[0];
  const isFestivalsTab = currentPath === '/fests?tab=festivals' || cleanPath.startsWith('/fests/');
  const isExploreTab =
    (cleanPath === '/fests' && currentPath !== '/fests?tab=festivals') ||
    cleanPath.startsWith('/events/');
  const isMyRegsTab = cleanPath === '/my-registrations' || cleanPath.startsWith('/registration/');
  const isAdminTab = cleanPath.startsWith('/admin');

  const handleNav = (target: string) => {
    navigate(target);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200 no-print">
      <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="font-display text-xl font-bold tracking-tight text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          NEXUS
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <a
            href="/fests"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/fests');
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isExploreTab
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'
            }`}
          >
            Explore
          </a>
          <a
            href="/fests?tab=festivals"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/fests?tab=festivals');
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isFestivalsTab
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'
            }`}
          >
            Festivals
          </a>
          <a
            href="/my-registrations"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/my-registrations');
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isMyRegsTab
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'
            }`}
          >
            My Registrations
          </a>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/admin');
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isAdminTab
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'
            }`}
          >
            Organizer
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Quick Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span>Search</span>
            <kbd className="font-mono text-[11px] text-zinc-500 pl-1">⌘K</kbd>
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="truncate max-w-[130px]">{currentUser.fullName}</span>
                <span className="text-zinc-400">·</span>
                <span className="text-blue-700 capitalize">{currentUser.role}</span>
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-50 text-sm">
                    <div className="pb-2.5 mb-2.5 border-b border-zinc-100">
                      <p className="font-semibold text-zinc-900 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Role: <span className="font-medium text-zinc-800 capitalize">{currentUser.role}</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[11px] font-medium text-zinc-400">
                        Quick Demo Switcher
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          switchDemoRole('participant');
                          setAccountMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          currentUser.role === 'participant'
                            ? 'bg-zinc-100 text-zinc-950 font-semibold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                        }`}
                      >
                        Participant Account (Tahmid Hasan)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          switchDemoRole('organizer');
                          setAccountMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          currentUser.role === 'organizer'
                            ? 'bg-zinc-100 text-zinc-950 font-semibold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                        }`}
                      >
                        Organizer Admin (Farhan Sadik)
                      </button>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleNav('/my-registrations')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      >
                        My Event Passes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNav('/admin')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      >
                        Organizer Workspace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('/login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setCommandPaletteOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-zinc-600 bg-zinc-100 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search events or festivals...
            </span>
            <kbd className="font-mono text-xs">⌘K</kbd>
          </button>

          <nav className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleNav('/fests')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isExploreTab ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-700'
              }`}
            >
              Explore Events
            </button>
            <button
              type="button"
              onClick={() => handleNav('/fests?tab=festivals')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isFestivalsTab ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-700'
              }`}
            >
              Festivals
            </button>
            <button
              type="button"
              onClick={() => handleNav('/my-registrations')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isMyRegsTab ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-700'
              }`}
            >
              My Registrations
            </button>
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isAdminTab ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-700'
              }`}
            >
              Organizer Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleNav('/login')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700"
            >
              Account & Demo Switcher
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
