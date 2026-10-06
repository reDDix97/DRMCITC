import React from 'react';
import { useNexus } from '../context/NexusContext';

export const Footer: React.FC = () => {
  const { navigate, organization, resetToSeedData } = useNexus();

  return (
    <footer className="bg-white border-t border-zinc-200 mt-20 no-print">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-100">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-lg font-bold tracking-tight text-zinc-950">
                NEXUS
              </span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs font-medium text-zinc-600">
                Smart Club Operations
              </span>
            </div>
            <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
              Centralized festival discovery, real-time seat capacity management, digital QR
              passes, and event operations engineered for {organization.name}.
            </p>
            <p className="text-xs text-zinc-500">
              {organization.name} · {organization.campus}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-900">Platform</p>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/fests')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Explore Events
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/fests?tab=festivals')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Festival Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/my-registrations')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  My Registrations & Passes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Participant & Organizer Login
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-900">Operations Console</p>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Organizer Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/admin/participants')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Participant Roster & Statuses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/admin/check-in')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  QR Check-In Terminal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/admin/analytics')}
                  className="hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  Registration & Capacity Analytics
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} {organization.name}. Built on NEXUS Smart Club Operations.
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${organization.contactEmail}`}
              className="hover:text-zinc-900 transition-colors"
            >
              {organization.contactEmail}
            </a>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                resetToSeedData();
                navigate('/');
              }}
              className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              Reset Demo Seed Data
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
