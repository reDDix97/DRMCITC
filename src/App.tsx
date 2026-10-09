/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CommandPalette } from './components/CommandPalette';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { NexusProvider, useNexus } from './context/NexusContext';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminCheckInPage } from './pages/admin/AdminCheckInPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminFestsPage } from './pages/admin/AdminFestsPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AuthPage } from './pages/AuthPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { FestDetailPage } from './pages/FestDetailPage';
import { FestDirectoryPage } from './pages/FestDirectoryPage';
import { LandingPage } from './pages/LandingPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { RegisterEventPage } from './pages/RegisterEventPage';
import { RegistrationConfirmPage } from './pages/RegistrationConfirmPage';

const AppRouter: React.FC = () => {
  const { currentPath, navigate } = useNexus();
  const cleanPath = currentPath.split('?')[0].replace(/\/+$/, '') || '/';

  const renderContent = () => {
    // Public landing & discovery
    if (cleanPath === '/') {
      return <LandingPage />;
    }
    if (cleanPath === '/fests' || cleanPath === '/events') {
      return <FestDirectoryPage />;
    }
    if (cleanPath.startsWith('/fests/')) {
      const slug = cleanPath.replace('/fests/', '');
      return <FestDetailPage slug={slug} />;
    }
    if (cleanPath.startsWith('/events/')) {
      const slug = cleanPath.replace('/events/', '');
      return <EventDetailPage slug={slug} />;
    }

    // Participant registration & digital passes
    if (cleanPath.startsWith('/register/')) {
      const eventIdOrSlug = cleanPath.replace('/register/', '');
      return <RegisterEventPage eventIdOrSlug={eventIdOrSlug} />;
    }
    if (cleanPath.startsWith('/registration/')) {
      const regIdOrCode = cleanPath.replace('/registration/', '');
      return <RegistrationConfirmPage registrationIdOrCode={regIdOrCode} />;
    }
    if (cleanPath.startsWith('/registration-confirm/')) {
      const regIdOrCode = cleanPath.replace('/registration-confirm/', '');
      return <RegistrationConfirmPage registrationIdOrCode={regIdOrCode} />;
    }
    if (cleanPath === '/my-registrations') {
      return <MyRegistrationsPage />;
    }

    // Authentication & Account Creation
    if (cleanPath === '/auth' || cleanPath === '/login') {
      return <AuthPage initialMode="login" />;
    }
    if (cleanPath === '/register-account' || cleanPath === '/signup') {
      return <AuthPage initialMode="register" />;
    }

    // Organizer Admin Suite
    if (cleanPath === '/admin') {
      return <AdminOverviewPage />;
    }
    if (cleanPath === '/admin/fests') {
      return <AdminFestsPage />;
    }
    if (cleanPath === '/admin/events') {
      return <AdminEventsPage />;
    }
    if (cleanPath === '/admin/participants') {
      return <AdminParticipantsPage />;
    }
    if (cleanPath === '/admin/checkin') {
      return <AdminCheckInPage />;
    }
    if (cleanPath === '/admin/analytics') {
      return <AdminAnalyticsPage />;
    }
    if (cleanPath === '/admin/settings') {
      return <AdminSettingsPage />;
    }

    // 404 Fallback
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-semibold">
          404 · Page Not Found
        </p>
        <h1 className="font-display text-3xl font-bold text-zinc-950">
          The requested page does not exist
        </h1>
        <p className="text-sm text-zinc-600">
          We could not locate the requested resource at <code className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded">{cleanPath}</code>.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
          >
            Return to Home
          </button>
          <button
            type="button"
            onClick={() => navigate('/fests')}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer transition-colors"
          >
            Browse Festivals
          </button>
        </div>
      </div>
    );
  };

  const isAdminRoute = cleanPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">{renderContent()}</div>
      {!isAdminRoute && <Footer />}
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <NexusProvider>
      <AppRouter />
    </NexusProvider>
  );
}
