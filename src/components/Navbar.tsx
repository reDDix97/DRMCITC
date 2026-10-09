import React, { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, Search, Ticket, User, X } from 'lucide-react';
import { useNexus } from '../context/NexusContext';

export const Navbar: React.FC = () => {
  const {
    currentPath,
    navigate,
    currentUser,
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

  const isOrganizer = currentUser?.role === 'organizer';

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

        {/* Zone 2: Clean text navigation links */}
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

          {/* Organizer Workspace: STRICTLY visible only to verified Organizer accounts */}
          {isOrganizer && (
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/admin');
              }}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                isAdminTab
                  ? 'border-zinc-950 text-zinc-950 font-semibold'
                  : 'border-transparent text-blue-700 hover:text-blue-900 hover:border-blue-300 font-semibold'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Organizer Desk</span>
            </a>
          )}
        </nav>

        {/* Zone 3: Actions & Account Menu */}
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
                <span
                  className={`capitalize font-bold ${
                    isOrganizer ? 'text-blue-700' : 'text-zinc-600'
                  }`}
                >
                  {currentUser.role}
                </span>
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-50 text-sm space-y-2">
                    <div className="pb-2.5 border-b border-zinc-100">
                      <p className="font-semibold text-zinc-900 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            isOrganizer
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {currentUser.role} Account
                        </span>
                        {currentUser.studentId && (
                          <span className="font-mono text-[10px] text-zinc-400">
                            {currentUser.studentId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleNav('/my-registrations')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5 text-zinc-500" />
                        <span>My Event Passes</span>
                      </button>

                      {/* Organizer Workspace button: STRICTLY only for verified organizers */}
                      {isOrganizer && (
                        <button
                          type="button"
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Organizer Workspace</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-zinc-100 mt-1 pt-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
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

            {/* Only show Organizer Dashboard on mobile if logged in as organizer */}
            {isOrganizer && (
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  isAdminTab
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Organizer Workspace</span>
              </button>
            )}

            {!currentUser ? (
              <button
                type="button"
                onClick={() => handleNav('/login')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-50 border-t border-zinc-100 mt-1"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border-t border-zinc-100 mt-1"
              >
                Sign Out ({currentUser.fullName})
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
