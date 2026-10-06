import React, { useState } from 'react';
import { RotateCcw, Save, ShieldCheck, Check } from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { AdminLayout } from './AdminLayout';

export const AdminSettingsPage: React.FC = () => {
  const { organization, resetToSeedData, switchDemoRole, currentUser } = useNexus();
  const [savedMessage, setSavedMessage] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Editable settings fields
  const [orgName, setOrgName] = useState(organization.name);
  const [shortName, setShortName] = useState(organization.shortName);
  const [tagline, setTagline] = useState(organization.tagline || organization.subtitle);
  const [contactEmail, setContactEmail] = useState(organization.contactEmail);
  const [institution, setInstitution] = useState(organization.institution || organization.campus);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    resetToSeedData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
  };

  return (
    <AdminLayout
      activeTab="settings"
      title="Club & System Configuration"
      subtitle="Organization profile, operational defaults, and competition demo utilities"
    >
      <div className="max-w-3xl space-y-6">
        {savedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Organization profile saved successfully.</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>NEXUS database has been restored to factory seed data.</span>
          </div>
        )}

        {/* Organization Profile */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-zinc-950">
            Host Organization Profile
          </h3>
          <p className="text-xs text-zinc-500">
            This information is displayed across festival listings, registration passes, and export manifests.
          </p>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Short Code / Acronym
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Parent Institution / Campus
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Evaluation & Demo Controls */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-base font-bold text-zinc-950">
              Evaluator Demo Controls
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Easily toggle persona privileges to test both sides of NEXUS — participant registration flow and organizer command desk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => switchDemoRole('organizer')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                currentUser?.role === 'organizer'
                  ? 'border-zinc-950 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="text-xs font-bold text-zinc-900">Switch to Organizer Role</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Full access to create fests, manage rosters, and check in participants
              </p>
            </button>

            <button
              type="button"
              onClick={() => switchDemoRole('participant')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                currentUser?.role === 'participant'
                  ? 'border-zinc-950 bg-zinc-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="text-xs font-bold text-zinc-900">Switch to Participant Role</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Simulate a student browsing fests, filling registrations, and viewing digital passes
              </p>
            </button>
          </div>
        </div>

        {/* Database Reset Section */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="font-display text-base font-bold text-red-950">
            Database Re-seed
          </h3>
          <p className="text-xs text-zinc-600">
            Reset all localStorage changes back to the official competition seed data (3 festivals, 8 events, 36 registrations).
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
